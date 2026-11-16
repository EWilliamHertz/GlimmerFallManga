"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Film,
  Sparkles,
  BookOpen,
  Shield,
  Music2,
} from "lucide-react";
import { FACTIONS, type FactionId } from "@/data/universe";
import { FactionSymbol, GlimmerFallOfficialLogo } from "./FactionSymbols";

interface WelcomeTabProps {
  onNavigateTab: (tab: "welcome" | "manga" | "factions") => void;
  onPlayOst: (trackId?: string) => void;
}

export function WelcomeTab({ onNavigateTab, onPlayOst }: WelcomeTabProps) {
  const [resume, setResume] = useState<{ chapterId: string; pageNumber: number } | null>(
    null
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem("glimmerfall_reader_progress");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.chapterId && Number(parsed?.pageIdx) >= 0) {
          setResume({
            chapterId: parsed.chapterId,
            pageNumber: Number(parsed.pageIdx) + 1,
          });
        }
      }
    } catch {
      // ignore localStorage read errors
    }
  }, []);

  return (
    <div className="space-y-12 pb-28">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c1022] via-[#080b16] to-[#120b24] p-8 md:p-12 shadow-2xl">
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-purple-600/15 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-wrap items-center gap-3"
            >
              <GlimmerFallOfficialLogo className="h-12 w-auto" />
              <div className="flex flex-wrap items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-[11px]">
                <div className="flex flex-col leading-tight">
                  <span className="font-semibold text-cyan-300">GlimmerFallTCG.com</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">Card Game</span>
                </div>
                <span className="h-5 w-px bg-white/15" />
                <div className="flex flex-col leading-tight">
                  <span className="font-semibold text-purple-300">GlimmerFall.Online</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">MMORPG</span>
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.08]"
            >
              Welcome to{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-amber-300 bg-clip-text text-transparent">
                The Fractured Nexus
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-slate-300 text-base md:text-lg leading-relaxed max-w-xl"
            >
              Dive into the living lore of GlimmerFall across the four floating
              plates of the Fractured Nexus. Watch the official launch trailer,
              listen to the built-in soundtrack, explore the 322-card lore
              archive, and read the official manga chapters.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                href={resume ? `/reader?chapter=${resume.chapterId}` : "/reader"}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 transition"
              >
                <BookOpen className="w-4 h-4" />
                {resume
                  ? `Continue ${resume.chapterId.toUpperCase()} • Page ${resume.pageNumber}`
                  : "Read Manga"}
              </Link>
              <button
                onClick={() => onNavigateTab("manga")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 font-semibold text-sm shadow-lg shadow-cyan-500/20 hover:brightness-110 transition"
              >
                <Sparkles className="w-4 h-4" />
                Browse Chapters
              </button>
              <button
                onClick={() => onPlayOst("ost-nexus-overture")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium text-sm transition"
              >
                <Music2 className="w-4 h-4 text-cyan-300" />
                Play Nexus Overture OST
              </button>
              <button
                onClick={() => onNavigateTab("factions")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium text-sm transition"
              >
                <Shield className="w-4 h-4 text-amber-300" />
                Explore 4 Factions
              </button>
            </motion.div>
          </div>

          {/* GlimmerFall Trailer Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="lg:col-span-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-purple-400" />
                GlimmerFall Official Trailer
              </span>
              <span className="text-[11px] font-mono text-cyan-300/90">1080p HD</span>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/15 bg-[#050711] shadow-2xl">
              <video
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-cover"
                poster="/logos/faction_representatives.jpg"
              >
                <source
                  src="https://o20ql1pn6r6cwj04.public.blob.vercel-storage.com/glimmerfall/cinematics/Glimmerfall_Dual_Launch_Trailer_1080p.mp4"
                  type="video/mp4"
                />
              </video>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Four Plates of the Fractured Nexus */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              The Four Plates of the Fractured Nexus
            </h2>
            <p className="text-sm text-slate-400">
              Click any faction to explore its lore, symbols, and cards—or weave them into the manga.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(FACTIONS) as FactionId[]).map((fid, idx) => {
            const f = FACTIONS[fid];
            return (
              <motion.button
                key={fid}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                whileHover={{ y: -4 }}
                onClick={() => onNavigateTab("factions")}
                className="group text-left rounded-2xl border border-white/10 bg-[#0a0d18]/90 p-5 hover:border-white/25 transition relative overflow-hidden"
              >
                <div
                  className="absolute inset-x-0 top-0 h-1 opacity-80"
                  style={{ backgroundColor: f.color }}
                />
                <div className="flex items-center justify-between mb-3">
                  <FactionSymbol faction={fid} className="w-9 h-9" />
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${f.badgeBg}`}>
                    {f.nexusDistrict}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{f.name}</h3>
                <p className="text-xs font-medium text-slate-400 mb-2">{f.title}</p>
                <p className="text-xs text-slate-300/80 leading-relaxed line-clamp-3">
                  {f.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
