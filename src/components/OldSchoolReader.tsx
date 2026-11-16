"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Columns2,
  FileText,
  ScrollText,
  Upload,
  Loader2,
  BookOpen,
  Maximize2,
  Minimize2,
  Volume2,
  Plus,
  X,
} from "lucide-react";
import type { ReaderChapter } from "@/app/api/manga-reader/route";
import { OST_TRACKS } from "@/data/universe";
import { GlimmerFallCrest } from "./FactionSymbols";
import { FeaturedCardsTray } from "./FeaturedCardsTray";
import { useOst } from "./OstContext";

type ViewLayout = "single" | "spread" | "strip";

export function OldSchoolReader() {
  const [chapters, setChapters] = useState<ReaderChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChapterId, setActiveChapterId] = useState<string>("ch-01");
  const [pageIdx, setPageIdx] = useState<number>(0);
  const [layout, setLayout] = useState<ViewLayout>("single");
  const [rtl, setRtl] = useState<boolean>(true); // Classic Japanese manga Right-to-Left default for spreads
  const [fitMode, setFitMode] = useState<"height" | "width">("height");
  const [paperBorder, setPaperBorder] = useState<boolean>(true);

  const { playTrack, setTrackOnly, isPlaying } = useOst();
  const [autoSyncOst, setAutoSyncOst] = useState<boolean>(true);

  // Upload Chapter .zip modal state
  const [showUpload, setShowUpload] = useState(false);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [uploadChapterNum, setUploadChapterNum] = useState<number>(2);
  const [uploadTitle, setUploadTitle] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  const loadChapters = useCallback(async (selectId?: string, initialPageIdx = 0) => {
    setLoading(true);
    try {
      const res = await fetch("/api/manga-reader", { cache: "no-store" });
      const data = await res.json();
      const list: ReaderChapter[] = data?.chapters || [];
      setChapters(list);
      if (selectId && list.some((c) => c.id === selectId)) {
        const matched = list.find((c) => c.id === selectId)!;
        setActiveChapterId(matched.id);
        setPageIdx(Math.min(initialPageIdx, Math.max(0, matched.pages.length - 1)));
        if (autoSyncOst) {
          const tag = `Ch. ${String(matched.number).padStart(2, "0")}`;
          if (isPlaying) playTrack(matched.builtInOstId, tag);
          else setTrackOnly(matched.builtInOstId, tag);
        }
      } else if (list.length > 0 && !list.some((c) => c.id === activeChapterId)) {
        setActiveChapterId(list[0].id);
        setPageIdx(0);
      }
      if (list.length > 0 && !selectId) {
        const maxNum = Math.max(...list.map((c) => c.number));
        setUploadChapterNum(maxNum + 1);
      }
    } finally {
      setLoading(false);
    }
  }, [activeChapterId, autoSyncOst, isPlaying, playTrack, setTrackOnly]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("chapter") || undefined;
    if (requested) {
      let savedPage = 0;
      try {
        const raw = localStorage.getItem("glimmerfall_reader_progress");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.chapterId === requested) savedPage = Number(parsed?.pageIdx) || 0;
        }
      } catch {
        // ignore storage read error
      }
      loadChapters(requested, savedPage);
    } else {
      let savedCh: string | undefined;
      let savedPage = 0;
      try {
        const raw = localStorage.getItem("glimmerfall_reader_progress");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.chapterId) {
            savedCh = parsed.chapterId;
            savedPage = Number(parsed?.pageIdx) || 0;
          }
        }
      } catch {
        // ignore storage read error
      }
      loadChapters(savedCh, savedPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeChapter = chapters.find((c) => c.id === activeChapterId) ?? chapters[0];
  const pages = activeChapter?.pages ?? [];
  const totalPages = pages.length;

  // Save reading progress & preload next 2 pages
  useEffect(() => {
    if (!activeChapter || totalPages === 0) return;
    try {
      localStorage.setItem(
        "glimmerfall_reader_progress",
        JSON.stringify({ chapterId: activeChapter.id, pageIdx })
      );
    } catch {
      // ignore storage quota errors
    }
    for (const offset of [1, 2]) {
      const next = pages[pageIdx + offset];
      if (next?.url) {
        const img = new window.Image();
        img.src = next.url;
      }
    }
  }, [activeChapter, pageIdx, pages, totalPages]);

  const stepAmount = layout === "spread" ? 2 : 1;

  const goNext = useCallback(() => {
    if (totalPages === 0) return;
    setPageIdx((i) => Math.min(totalPages - 1, i + stepAmount));
  }, [totalPages, stepAmount]);

  const goPrev = useCallback(() => {
    if (totalPages === 0) return;
    setPageIdx((i) => Math.max(0, i - stepAmount));
  }, [totalPages, stepAmount]);

  // Classic keyboard shortcuts: Left/Right arrows, Space
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (layout === "strip") return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (layout === "spread" && rtl) goPrev();
        else goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (layout === "spread" && rtl) goNext();
        else goPrev();
      } else if (e.key === " ") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [layout, rtl, goNext, goPrev]);

  const handleSelectChapter = (ch: ReaderChapter) => {
    setActiveChapterId(ch.id);
    setPageIdx(0);
    if (autoSyncOst) {
      const tag = `Ch. ${String(ch.number).padStart(2, "0")}`;
      if (isPlaying) playTrack(ch.builtInOstId, tag);
      else setTrackOnly(ch.builtInOstId, tag);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUploadZip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipFile) {
      setUploadMsg("Please pick a .zip file containing manga pages.");
      return;
    }
    setUploading(true);
    setUploadMsg(null);
    try {
      const fd = new FormData();
      fd.append("zipFile", zipFile);
      fd.append("chapterNumber", String(uploadChapterNum));
      if (uploadTitle.trim()) fd.append("chapterTitle", uploadTitle.trim());

      const res = await fetch("/api/manga-reader", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setUploadMsg(data.error || "Upload failed");
        return;
      }
      setUploadMsg(`Uploaded ${data.uploadedCount} pages to ${data.chapterId}!`);
      setZipFile(null);
      setUploadTitle("");
      await loadChapters(data.chapterId);
      setTimeout(() => setShowUpload(false), 1000);
    } catch (err) {
      setUploadMsg(err instanceof Error ? err.message : "Network error");
    } finally {
      setUploading(false);
    }
  };

  const chapterOst =
    OST_TRACKS.find((t) => t.id === activeChapter?.builtInOstId) ?? OST_TRACKS[0];

  const spreadRight = pages[pageIdx];
  const spreadLeft = pages[pageIdx + 1];

  return (
    <div className="min-h-screen bg-[#0c0d11] text-slate-200 pb-28 select-none">
      {/* Old-School Classic Reader Top Control Strip */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-[#14161d]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
          {/* Brand + Back */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Hub
            </Link>
            <div className="flex items-center gap-2">
              <GlimmerFallCrest className="w-6 h-6" />
              <div className="leading-tight">
                <span className="block text-xs font-bold text-white tracking-wide">
                  GLIMMERFALL READER
                </span>
                <span className="block text-[10px] font-mono text-amber-400">
                  Classic Manga Edition
                </span>
              </div>
            </div>
          </div>

          {/* Chapter & Page Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={activeChapter?.id || ""}
              onChange={(e) => {
                const found = chapters.find((c) => c.id === e.target.value);
                if (found) handleSelectChapter(found);
              }}
              className="px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
            >
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  Ch. {String(ch.number).padStart(2, "0")}: {ch.title} ({ch.pages.length}p)
                </option>
              ))}
            </select>

            {layout !== "strip" && totalPages > 0 && (
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded p-0.5">
                <button
                  onClick={goPrev}
                  disabled={pageIdx === 0}
                  className="p-1 rounded hover:bg-zinc-800 disabled:opacity-30 text-zinc-200"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <select
                  value={pageIdx}
                  onChange={(e) => setPageIdx(Number(e.target.value))}
                  className="bg-transparent text-xs font-mono text-amber-300 px-1.5 focus:outline-none"
                >
                  {pages.map((p, i) => (
                    <option key={p.pathname} value={i} className="bg-zinc-900 text-white">
                      {p.label} ({i + 1}/{totalPages})
                    </option>
                  ))}
                </select>
                <button
                  onClick={goNext}
                  disabled={pageIdx >= totalPages - 1}
                  className="p-1 rounded hover:bg-zinc-800 disabled:opacity-30 text-zinc-200"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Reader Mode & Upload Tools */}
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex rounded bg-zinc-900 border border-zinc-700 p-0.5 text-[11px]">
              <button
                onClick={() => setLayout("single")}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded transition ${
                  layout === "single"
                    ? "bg-amber-400 text-zinc-950 font-bold"
                    : "text-zinc-300 hover:text-white"
                }`}
                title="Single Page Mode"
              >
                <FileText className="w-3 h-3" />
                Page
              </button>
              <button
                onClick={() => setLayout("spread")}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded transition ${
                  layout === "spread"
                    ? "bg-amber-400 text-zinc-950 font-bold"
                    : "text-zinc-300 hover:text-white"
                }`}
                title="Two-Page Spread"
              >
                <Columns2 className="w-3 h-3" />
                Spread
              </button>
              <button
                onClick={() => setLayout("strip")}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded transition ${
                  layout === "strip"
                    ? "bg-amber-400 text-zinc-950 font-bold"
                    : "text-zinc-300 hover:text-white"
                }`}
                title="Vertical Long-Strip Scroll"
              >
                <ScrollText className="w-3 h-3" />
                Strip
              </button>
            </div>

            {layout === "spread" && (
              <button
                onClick={() => setRtl((r) => !r)}
                className="px-2 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-[11px] font-mono text-zinc-300 hover:text-white"
                title="Toggle Reading Direction"
              >
                {rtl ? "RTL ←" : "LTR →"}
              </button>
            )}

            {layout !== "strip" && (
              <button
                onClick={() => setFitMode((m) => (m === "height" ? "width" : "height"))}
                className="p-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white"
                title={fitMode === "height" ? "Switch to Fit Width" : "Switch to Fit Height"}
              >
                {fitMode === "height" ? (
                  <Maximize2 className="w-3.5 h-3.5" />
                ) : (
                  <Minimize2 className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            <button
              onClick={() => setPaperBorder((b) => !b)}
              className={`px-2 py-1.5 rounded border text-[11px] font-medium transition ${
                paperBorder
                  ? "bg-zinc-200 text-zinc-950 border-zinc-200"
                  : "bg-zinc-900 text-zinc-400 border-zinc-700"
              }`}
              title="Toggle Classic White Paper Matte"
            >
              Matte
            </button>

            <button
              onClick={() => setAutoSyncOst((v) => !v)}
              className={`px-2 py-1.5 rounded border text-[11px] font-medium transition ${
                autoSyncOst
                  ? "bg-purple-500/20 text-purple-200 border-purple-400/40"
                  : "bg-zinc-900 text-zinc-400 border-zinc-700"
              }`}
              title="Auto-switch OST per chapter (turn off to keep current song playing)"
            >
              {autoSyncOst ? "Auto OST" : "Lock OST"}
            </button>

            <button
              onClick={() => {
                if (activeChapter) {
                  playTrack(
                    activeChapter.builtInOstId,
                    `Ch. ${String(activeChapter.number).padStart(2, "0")}`
                  );
                }
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-[11px] font-semibold text-purple-200"
              title={`Play ${chapterOst.title}`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              OST
            </button>

            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-[11px] font-bold text-emerald-300"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Chapter .zip
            </button>
          </div>
        </div>
      </header>

      {/* Main Manga Canvas */}
      <main className="max-w-7xl mx-auto px-3 sm:px-5 pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-zinc-400">
            <Loader2 className="w-7 h-7 animate-spin text-amber-400" />
            <p className="text-sm font-mono">Loading chapters from Vercel Blob...</p>
          </div>
        ) : !activeChapter || pages.length === 0 ? (
          <div className="max-w-lg mx-auto my-20 rounded-2xl border border-zinc-800 bg-[#14161d] p-8 text-center space-y-4">
            <BookOpen className="w-10 h-10 text-amber-400 mx-auto" />
            <h2 className="text-lg font-bold text-white">No Chapters Loaded Yet</h2>
            <p className="text-xs text-zinc-400">
              Upload a chapter `.zip` file to store its pages directly on your Vercel Blob
              storage and read it right here.
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400 text-zinc-950 font-bold text-xs"
            >
              <Upload className="w-4 h-4" />
              Upload Chapter .zip
            </button>
          </div>
        ) : layout === "strip" ? (
          /* Vertical Classic Long-Strip Mode */
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="text-center py-2">
              <p className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                Chapter {String(activeChapter.number).padStart(2, "0")}
              </p>
              <h1 className="text-xl font-bold text-white">{activeChapter.title}</h1>
            </div>
            {pages.map((p, idx) => (
              <div key={p.pathname} className="space-y-1">
                <div
                  className={`mx-auto overflow-hidden shadow-2xl ${
                    paperBorder
                      ? "bg-white p-2 sm:p-3 rounded border border-zinc-300"
                      : "rounded border border-zinc-800 bg-black"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={`${activeChapter.title} - ${p.label}`}
                    loading={idx < 3 ? "eager" : "lazy"}
                    className="w-full h-auto block"
                  />
                </div>
                <p className="text-center text-[11px] font-mono text-zinc-500">
                  {p.label} ({idx + 1} / {totalPages})
                </p>
              </div>
            ))}
          </div>
        ) : layout === "spread" ? (
          /* Two-Page Classic Book Spread */
          <div className="flex flex-col items-center gap-3">
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-1.5 items-center justify-center ${
                paperBorder ? "bg-white p-2 rounded shadow-2xl" : ""
              }`}
            >
              {(rtl ? [spreadLeft, spreadRight] : [spreadRight, spreadLeft]).map(
                (p, idx) =>
                  p ? (
                    <div
                      key={p.pathname}
                      onClick={() => {
                        if (rtl) {
                          if (idx === 0) goNext();
                          else goPrev();
                        } else {
                          if (idx === 0) goPrev();
                          else goNext();
                        }
                      }}
                      className="cursor-pointer bg-black flex items-center justify-center"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.url}
                        alt={p.label}
                        className={
                          fitMode === "height"
                            ? "max-h-[calc(100vh-175px)] w-auto object-contain"
                            : "w-full h-auto object-contain"
                        }
                      />
                    </div>
                  ) : (
                    <div
                      key={`blank-${idx}`}
                      className="hidden md:flex items-center justify-center h-96 bg-zinc-900/40 text-xs font-mono text-zinc-600"
                    >
                      End of Chapter
                    </div>
                  )
              )}
            </div>
            <p className="text-xs font-mono text-zinc-400">
              Showing {spreadRight?.label}
              {spreadLeft ? ` & ${spreadLeft.label}` : ""} • Click left/right page or use{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200">←</kbd>{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200">→</kbd>
            </p>
          </div>
        ) : (
          /* Classic Single-Page Old-School Manga Reader */
          <div className="flex flex-col items-center gap-3">
            <div className="relative group flex justify-center">
              <div
                className={`relative overflow-hidden shadow-2xl ${
                  paperBorder
                    ? "bg-white p-2 sm:p-3 rounded border border-zinc-300"
                    : "bg-black rounded border border-zinc-800"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pages[pageIdx].url}
                  alt={pages[pageIdx].label}
                  className={
                    fitMode === "height"
                      ? "max-h-[calc(100vh-175px)] w-auto object-contain"
                      : "max-w-4xl w-full h-auto object-contain"
                  }
                />

                {/* Invisible Left/Right Click Hitboxes just like old-school readers */}
                <button
                  onClick={goPrev}
                  disabled={pageIdx === 0}
                  aria-label="Previous page"
                  className="absolute inset-y-0 left-0 w-1/3 cursor-w-resize focus:outline-none disabled:cursor-default"
                />
                <button
                  onClick={goNext}
                  disabled={pageIdx >= totalPages - 1}
                  aria-label="Next page"
                  className="absolute inset-y-0 right-0 w-2/3 cursor-e-resize focus:outline-none disabled:cursor-default"
                />
              </div>
            </div>

            {/* Bottom Page Bar */}
            <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
              <button
                onClick={goPrev}
                disabled={pageIdx === 0}
                className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-white"
              >
                ← Prev
              </button>
              <span>
                <strong className="text-amber-400">{pages[pageIdx].label}</strong> ({pageIdx + 1} /{" "}
                {totalPages})
              </span>
              <button
                onClick={goNext}
                disabled={pageIdx >= totalPages - 1}
                className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-white"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Next Chapter / Finale CTA + Featured Cards in This Chapter */}
        {activeChapter && (
          <>
            {(() => {
              const curIdx = chapters.findIndex((c) => c.id === activeChapter.id);
              const nextCh = curIdx >= 0 ? chapters[curIdx + 1] : undefined;
              const atEnd = layout === "strip" || pageIdx >= totalPages - stepAmount;
              if (!atEnd) return null;
              return nextCh ? (
                <div className="max-w-4xl mx-auto mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-mono uppercase text-amber-300">
                      Finished Chapter {String(activeChapter.number).padStart(2, "0")}
                    </p>
                    <p className="text-sm font-bold text-white">
                      Up Next: Ch. {String(nextCh.number).padStart(2, "0")} — {nextCh.title}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSelectChapter(nextCh)}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition"
                  >
                    Continue to Chapter {nextCh.number} →
                  </button>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto mt-6 rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-mono uppercase text-cyan-300">
                      End of Season One • The Fractured Nexus
                    </p>
                    <p className="text-sm font-bold text-white">
                      Ready to play the cards &amp; explore the living MMORPG?
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="https://glimmerfalltcg.com"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-cyan-400 text-zinc-950 font-bold text-xs"
                    >
                      GlimmerFallTCG.com
                    </a>
                    <a
                      href="https://glimmerfall.online"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-purple-400 text-zinc-950 font-bold text-xs"
                    >
                      GlimmerFall.Online
                    </a>
                  </div>
                </div>
              );
            })()}

            <FeaturedCardsTray chapterNumber={activeChapter.number} />
          </>
        )}
      </main>

      {/* Add Future Chapter (.zip) Modal */}
      {showUpload && (
        <div
          onClick={() => setShowUpload(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleUploadZip}
            className="max-w-md w-full rounded-2xl border border-zinc-700 bg-[#14161d] p-6 space-y-4 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setShowUpload(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                Add Manga Chapter (.zip) to Vercel Blob
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Unpacks `.jpg`/`.png`/`.webp` pages in numerical order straight into your manga
                Vercel Blob store.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Chapter #
                </label>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={uploadChapterNum}
                  onChange={(e) => setUploadChapterNum(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Chapter Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. The Singularity Parley"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Chapter `.zip` Archive
              </label>
              <input
                type="file"
                accept=".zip,application/zip"
                onChange={(e) => setZipFile(e.target.files?.[0] ?? null)}
                className="w-full text-xs text-zinc-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-amber-400 file:text-zinc-950 file:font-bold"
              />
            </div>

            {uploadMsg && (
              <p className="text-xs font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                {uploadMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Unpacking &amp; Uploading to Vercel Blob...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Chapter to Reader
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
