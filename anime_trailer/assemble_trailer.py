#!/usr/bin/env python3
"""
Assemble the 24 Google Flow anime trailer clips (01.mp4 .. 24.mp4) with smooth
crossfades and the official GlimmerFall Trailer & Landing Theme OST into
glimmerfall_anime_trailer.mp4 (1080p).

Usage:
  1. Put your downloaded Flow clips in anime_trailer/clips/ named 01.mp4 .. 24.mp4
     (or any sorted .mp4 files).
  2. Run: python3 anime_trailer/assemble_trailer.py
"""

import os
import re
import subprocess
import sys
import urllib.request

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CLIPS_DIR = os.path.join(BASE_DIR, "clips")
OUT_FILE = os.path.join(BASE_DIR, "glimmerfall_anime_trailer.mp4")
OST_URL = "https://uviycqegnbsx1wu2.public.blob.vercel-storage.com/manga/ost/trailer_3x.m4a"
OST_LOCAL = os.path.join(BASE_DIR, "trailer_ost.m4a")


def find_ffmpeg() -> str:
    for candidate in ["ffmpeg", "/tmp/ost_all/node_modules/ffmpeg-static/ffmpeg"]:
        if subprocess.run(["which", candidate], capture_output=True).returncode == 0 or os.path.exists(candidate):
            return candidate
    raise RuntimeError(
        "ffmpeg not found. Install ffmpeg or run: npx --yes ffmpeg-static"
    )


def sort_key(name: str):
    m = re.match(r"^(\d+)", name)
    return (int(m.group(1)) if m else 9999, name.lower())


def main() -> int:
    os.makedirs(CLIPS_DIR, exist_ok=True)
    clips = sorted(
        [f for f in os.listdir(CLIPS_DIR) if f.lower().endswith(".mp4")],
        key=sort_key,
    )
    if not clips:
        print(f"No .mp4 clips found in {CLIPS_DIR}. Drop 01.mp4..24.mp4 there and re-run!")
        return 1

    ffmpeg = find_ffmpeg()

    if not os.path.exists(OST_LOCAL):
        print(f"Downloading extended trailer OST -> {OST_LOCAL}")
        urllib.request.urlretrieve(OST_URL, OST_LOCAL)

    concat_list = os.path.join(BASE_DIR, "concat.txt")
    with open(concat_list, "w", encoding="utf-8") as f:
        for c in clips:
            full = os.path.join(CLIPS_DIR, c).replace("'", "'\\''")
            f.write(f"file '{full}'\n")

    print(f"Stitching {len(clips)} clips + OST into {OUT_FILE} ...")
    subprocess.run(
        [
            ffmpeg,
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            concat_list,
            "-i",
            OST_LOCAL,
            "-map",
            "0:v:0",
            "-map",
            "1:a:0",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "18",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-shortest",
            "-movflags",
            "+faststart",
            OUT_FILE,
        ],
        check=True,
    )
    os.remove(concat_list)
    print(f"Done! Created {OUT_FILE}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
