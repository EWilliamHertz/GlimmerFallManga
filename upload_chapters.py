#!/usr/bin/env python3
"""
Automatically upload GlimmerFall manga chapter .zip archives to Vercel Blob.

Usage:
  python3 upload_chapters.py                # Scans ~/ and ./ for Chapter*.zip
  python3 upload_chapters.py --delete       # Also deletes .zip files after verified upload
  python3 upload_chapters.py path/to/Ch5.zip
"""

import argparse
import concurrent.futures
import json
import os
import re
import sys
import urllib.request
import zipfile

APP_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(APP_DIR, ".env.local")
DEFAULT_SCAN_DIRS = [os.path.expanduser("~"), APP_DIR]
IMAGE_EXT_RE = re.compile(r"\.(jpg|jpeg|png|webp)$", re.I)


def load_token() -> str:
    if os.environ.get("MANGA_BLOB_READ_WRITE_TOKEN"):
        return os.environ["MANGA_BLOB_READ_WRITE_TOKEN"]
    if os.path.exists(ENV_FILE):
        with open(ENV_FILE, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("MANGA_BLOB_READ_WRITE_TOKEN="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError("MANGA_BLOB_READ_WRITE_TOKEN not found in environment or .env.local")


def extract_chapter_number(zip_path: str) -> int:
    base = os.path.basename(zip_path)
    m = re.search(r"(?:chapter|ch)[\s_-]*(\d+)", base, re.I)
    if not m:
        m = re.search(r"(\d+)", base)
    if not m:
        raise ValueError(f"Could not detect chapter number from filename: {base}")
    return int(m.group(1))


def page_sort_key(name: str) -> tuple[int, str]:
    base = os.path.basename(name)
    m = re.match(r"^(\d+)", base)
    return (int(m.group(1)) if m else 99999, base.lower())


def upload_one(token: str, pathname: str, data: bytes, content_type: str) -> str:
    req = urllib.request.Request(
        f"https://blob.vercel-storage.com/{pathname}",
        data=data,
        method="PUT",
        headers={
            "Authorization": f"Bearer {token}",
            "x-api-version": "7",
            "x-add-random-suffix": "0",
            "content-type": content_type,
        },
    )
    with urllib.request.urlopen(req, timeout=45) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        return res["url"]


def process_zip(token: str, zip_path: str, delete_after: bool = False) -> int:
    ch_num = extract_chapter_number(zip_path)
    ch_id = f"ch-{ch_num:02d}"
    print(f"\n==> Processing {zip_path} -> {ch_id}")

    tasks = []
    with zipfile.ZipFile(zip_path, "r") as z:
        members = [
            n
            for n in z.namelist()
            if not n.endswith("/")
            and not os.path.basename(n).startswith(".")
            and "__MACOSX" not in n
            and IMAGE_EXT_RE.search(n)
        ]
        members.sort(key=page_sort_key)

        for idx, member in enumerate(members, 1):
            base = os.path.basename(member)
            ext = os.path.splitext(base)[1].lower().lstrip(".")
            if ext == "jpeg":
                ext = "jpg"
            ctype = (
                "image/png"
                if ext == "png"
                else "image/webp"
                if ext == "webp"
                else "image/jpeg"
            )
            m = re.match(r"^(\d+)", base)
            page_num = int(m.group(1)) if m else idx
            suffix = "_intermission" if "intermission" in base.lower() else ""
            pathname = f"manga/{ch_id}/{page_num:03d}{suffix}.{ext}"
            tasks.append((pathname, z.read(member), ctype))

    if not tasks:
        print(f"  [WARN] No images found inside {zip_path}")
        return 0

    uploaded_count = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        future_map = {
            pool.submit(upload_one, token, p, data, ctype): p
            for p, data, ctype in tasks
        }
        for fut in concurrent.futures.as_completed(future_map):
            pathname = future_map[fut]
            url = fut.result()
            uploaded_count += 1
            print(f"  [OK] {pathname} -> {url}")

    if delete_after and uploaded_count == len(tasks):
        os.remove(zip_path)
        print(f"  [DEL] Removed {zip_path}")

    return uploaded_count


def discover_zips(explicit_paths: list[str]) -> list[str]:
    if explicit_paths:
        return [os.path.abspath(p) for p in explicit_paths]
    found: list[str] = []
    seen: set[str] = set()
    for directory in DEFAULT_SCAN_DIRS:
        if not os.path.isdir(directory):
            continue
        for entry in sorted(os.listdir(directory)):
            if re.match(r"^(?:chapter|ch)[\s_-]*\d+.*\.zip$", entry, re.I):
                full = os.path.abspath(os.path.join(directory, entry))
                if full not in seen:
                    seen.add(full)
                    found.append(full)
    return found


def main() -> int:
    parser = argparse.ArgumentParser(description="Upload chapter .zip archives to Vercel Blob")
    parser.add_argument("zips", nargs="*", help="Optional explicit .zip file paths")
    parser.add_argument(
        "--delete",
        action="store_true",
        help="Delete each .zip after all pages upload successfully",
    )
    args = parser.parse_args()

    token = load_token()
    zips = discover_zips(args.zips)
    if not zips:
        print("No Chapter*.zip files found.")
        return 0

    total = 0
    for zp in zips:
        total += process_zip(token, zp, delete_after=args.delete)

    print(f"\nDone! Uploaded {total} total manga pages across {len(zips)} archive(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
