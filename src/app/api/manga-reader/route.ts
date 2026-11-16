import { NextResponse } from "next/server";
import JSZip from "jszip";
import { CHAPTER_METADATA } from "@/data/universe";

export interface ReaderPage {
  pageNumber: number;
  label: string;
  url: string;
  pathname: string;
}

export interface ReaderChapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  builtInOstId: string;
  pages: ReaderPage[];
}

function getToken(): string | undefined {
  return process.env.MANGA_BLOB_READ_WRITE_TOKEN;
}

function parsePageMeta(pathname: string): {
  chapterNum: number;
  chapterId: string;
  pageNumber: number;
  label: string;
} | null {
  const m = pathname.match(/^manga\/ch-(\d+)\/(\d+)(?:_([a-z0-9_-]+))?\.(jpg|jpeg|png|webp)$/i);
  if (!m) return null;
  const chapterNum = Number(m[1]);
  const chapterId = `ch-${String(chapterNum).padStart(2, "0")}`;
  const pageNumber = Number(m[2]);
  const suffix = m[3] ? ` — ${m[3].replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}` : "";
  return {
    chapterNum,
    chapterId,
    pageNumber,
    label: `Page ${pageNumber}${suffix}`,
  };
}

export async function GET() {
  const token = getToken();
  if (!token) {
    return NextResponse.json(
      { error: "MANGA_BLOB_READ_WRITE_TOKEN is not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch("https://blob.vercel-storage.com?prefix=manga/&limit=1000", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `Failed to list Vercel Blob (${res.status})`, details: errText },
        { status: res.status }
      );
    }

    const data = await res.json();
    const blobs: Array<{ pathname: string; url: string; uploadedAt?: string }> =
      data?.blobs || [];

    // Check optional custom chapter titles manifest
    let customManifest: Record<string, { title?: string; subtitle?: string }> = {};
    const manifestBlob = blobs.find((b) => b.pathname === "manga/manifest.json");
    if (manifestBlob?.url) {
      try {
        const mRes = await fetch(manifestBlob.url, { cache: "no-store" });
        if (mRes.ok) customManifest = await mRes.json();
      } catch {
        // ignore manifest parse error
      }
    }

    const chapterMap = new Map<string, ReaderChapter>();

    for (const b of blobs) {
      const meta = parsePageMeta(b.pathname);
      if (!meta) continue;

      if (!chapterMap.has(meta.chapterId)) {
        const sagaMatch = CHAPTER_METADATA.find((c) => c.number === meta.chapterNum);
        const custom = customManifest[meta.chapterId];
        chapterMap.set(meta.chapterId, {
          id: meta.chapterId,
          number: meta.chapterNum,
          title: custom?.title || sagaMatch?.title || `Chapter ${meta.chapterNum}`,
          subtitle: custom?.subtitle || sagaMatch?.subtitle || "GlimmerFall: The Fractured Nexus",
          builtInOstId: sagaMatch?.builtInOstId || "ost-nexus-overture",
          pages: [],
        });
      }

      chapterMap.get(meta.chapterId)!.pages.push({
        pageNumber: meta.pageNumber,
        label: meta.label,
        url: b.url,
        pathname: b.pathname,
      });
    }

    const chapters = Array.from(chapterMap.values())
      .sort((a, b) => a.number - b.number)
      .map((ch) => ({
        ...ch,
        pages: ch.pages.sort((a, b) => a.pageNumber - b.pageNumber),
      }));

    return NextResponse.json({ chapters });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load chapters" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const token = getToken();
  if (!token) {
    return NextResponse.json(
      { error: "MANGA_BLOB_READ_WRITE_TOKEN is not configured" },
      { status: 500 }
    );
  }

  try {
    const form = await req.formData();
    const zipFile = form.get("zipFile");
    const rawNum = Number(form.get("chapterNumber") || 1);
    const chapterNum = Math.max(1, Math.min(999, Math.floor(rawNum)));
    const chapterId = `ch-${String(chapterNum).padStart(2, "0")}`;
    const customTitle = String(form.get("chapterTitle") || "").trim();

    if (!(zipFile instanceof File)) {
      return NextResponse.json({ error: "Please attach a .zip file" }, { status: 400 });
    }

    const zipBuf = await zipFile.arrayBuffer();
    const zip = await JSZip.loadAsync(zipBuf);

    const imageEntries: Array<{
      name: string;
      pageNumber: number;
      suffix: string;
      ext: string;
      contentType: string;
      entry: JSZip.JSZipObject;
    }> = [];

    let fallbackIdx = 1;
    zip.forEach((relPath, entry) => {
      if (entry.dir) return;
      const base = relPath.split("/").pop() || "";
      if (base.startsWith(".") || base.startsWith("__MACOSX")) return;
      const extMatch = base.match(/\.(jpg|jpeg|png|webp)$/i);
      if (!extMatch) return;

      const ext = extMatch[1].toLowerCase() === "jpeg" ? "jpg" : extMatch[1].toLowerCase();
      const contentType =
        ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

      const numMatch = base.match(/^(\d+)/);
      const pageNumber = numMatch ? Number(numMatch[1]) : 900 + fallbackIdx++;
      const isIntermission = /intermission/i.test(base);

      imageEntries.push({
        name: base,
        pageNumber,
        suffix: isIntermission ? "_intermission" : "",
        ext,
        contentType,
        entry,
      });
    });

    if (imageEntries.length === 0) {
      return NextResponse.json(
        { error: "No .jpg, .png, or .webp pages found inside that .zip" },
        { status: 400 }
      );
    }

    imageEntries.sort((a, b) => a.pageNumber - b.pageNumber || a.name.localeCompare(b.name));

    const uploadedPages: ReaderPage[] = [];
    for (const item of imageEntries) {
      const data = await item.entry.async("nodebuffer");
      const padPage = String(item.pageNumber).padStart(3, "0");
      const pathname = `manga/${chapterId}/${padPage}${item.suffix}.${item.ext}`;

      const upRes = await fetch(`https://blob.vercel-storage.com/${pathname}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-version": "7",
          "x-add-random-suffix": "0",
          "content-type": item.contentType,
        },
        body: new Uint8Array(data),
      });

      if (!upRes.ok) {
        const errText = await upRes.text();
        return NextResponse.json(
          { error: `Failed uploading ${pathname} (${upRes.status})`, details: errText },
          { status: upRes.status }
        );
      }

      const uploaded = await upRes.json();
      uploadedPages.push({
        pageNumber: item.pageNumber,
        label: `Page ${item.pageNumber}${item.suffix ? " — Intermission" : ""}`,
        url: uploaded.url,
        pathname,
      });
    }

    // Save custom chapter title to manga/manifest.json if provided
    if (customTitle) {
      let existingManifest: Record<string, { title?: string; subtitle?: string }> = {};
      try {
        const listRes = await fetch(
          "https://blob.vercel-storage.com?prefix=manga/manifest.json&limit=5",
          { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
        );
        if (listRes.ok) {
          const listData = await listRes.json();
          const found = listData?.blobs?.find(
            (b: { pathname: string }) => b.pathname === "manga/manifest.json"
          );
          if (found?.url) {
            const mRes = await fetch(found.url, { cache: "no-store" });
            if (mRes.ok) existingManifest = await mRes.json();
          }
        }
      } catch {
        // ignore existing manifest read error
      }

      existingManifest[chapterId] = { title: customTitle };
      await fetch("https://blob.vercel-storage.com/manga/manifest.json", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-version": "7",
          "x-add-random-suffix": "0",
          "content-type": "application/json",
        },
        body: JSON.stringify(existingManifest),
      });
    }

    return NextResponse.json({
      chapterId,
      uploadedCount: uploadedPages.length,
      pages: uploadedPages,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to unpack .zip" },
      { status: 500 }
    );
  }
}
