"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Loader2, Music2, Volume2, ArrowRight } from "lucide-react";
import type { ReaderChapter } from "@/app/api/manga-reader/route";
import { CHAPTER_METADATA, OST_TRACKS } from "@/data/universe";
import { FactionSymbol } from "./FactionSymbols";

interface ChaptersTabProps {
  onSelectChapterOst: (ostId: string, chapterLabel: string) => void;
}

export function ChaptersTab({ onSelectChapterOst }: ChaptersTabProps) {
  const [chapters, setChapters] = useState<ReaderChapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/manga-reader", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setChapters(d?.chapters || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 pb-28">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            GlimmerFall: The Fractured Nexus — Manga Chapters
          </h2>
          <p className="text-sm text-slate-400">
            Select any released chapter to read in the Classic Manga Reader with its built-in OST.
          </p>
        </div>

        <Link
          href="/reader"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 font-bold text-xs shadow hover:brightness-110 transition"
        >
          <BookOpen className="w-4 h-4" />
          Open Classic Manga Reader
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          <span className="text-sm font-mono">Loading published chapters...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {chapters.map((ch, idx) => {
            const meta = CHAPTER_METADATA.find((m) => m.number === ch.number);
            const ost = OST_TRACKS.find((t) => t.id === ch.builtInOstId) ?? OST_TRACKS[0];
            const cover = ch.pages[0]?.url;

            return (
              <motion.div
                key={ch.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="rounded-3xl border border-white/10 bg-[#0a0d18] overflow-hidden shadow-2xl grid grid-cols-1 sm:grid-cols-12"
              >
                <Link
                  href={`/reader?chapter=${ch.id}`}
                  className="sm:col-span-5 bg-black relative min-h-[220px] overflow-hidden group"
                >
                  {cover && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={cover}
                      alt={ch.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  )}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/80 border border-white/15 text-[11px] font-mono font-bold text-amber-300">
                    CH {String(ch.number).padStart(2, "0")} • {ch.pages.length} Pages
                  </span>
                </Link>

                <div className="sm:col-span-7 p-6 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-cyan-300 uppercase">
                        {ch.subtitle}
                      </span>
                      <FactionSymbol
                        faction={meta?.factionFocus ?? "nexus"}
                        className="w-5 h-5"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-white">{ch.title}</h3>
                    {meta?.synopsis && (
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                        {meta.synopsis}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-400/30 text-[11px] text-purple-200">
                      <Music2 className="w-3 h-3" />
                      Built-in OST: {ost.title}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/reader?chapter=${ch.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition"
                      >
                        Read Chapter {ch.number}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() =>
                          onSelectChapterOst(
                            ch.builtInOstId,
                            `Ch. ${String(ch.number).padStart(2, "0")}`
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-slate-200 transition"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-purple-300" />
                        Play OST
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
