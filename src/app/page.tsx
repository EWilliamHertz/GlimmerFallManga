"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, Shield, ExternalLink } from "lucide-react";
import { GlimmerFallCrest } from "@/components/FactionSymbols";
import { WelcomeTab } from "@/components/WelcomeTab";
import { ChaptersTab } from "@/components/ChaptersTab";
import { FactionsTab } from "@/components/FactionsTab";
import { useOst } from "@/components/OstContext";

type TabId = "welcome" | "manga" | "factions";

const TABS: {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "welcome", label: "Universe & Trailer", icon: Sparkles },
  { id: "manga", label: "Manga Chapters", icon: BookOpen },
  { id: "factions", label: "Factions & Cards", icon: Shield },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabId>("welcome");
  const { playTrack } = useOst();

  return (
    <div className="min-h-screen bg-[#05060b] text-slate-100 relative">
      {/* Subtle Ambient Background Mesh */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[15%] w-[480px] h-[480px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[520px] h-[520px] rounded-full bg-purple-600/10 blur-[130px]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#05060b]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <button
            onClick={() => setActiveTab("welcome")}
            className="flex items-center gap-2.5 text-left group"
          >
            <GlimmerFallCrest className="w-8 h-8 group-hover:scale-105 transition" />
            <div>
              <span className="block text-sm font-extrabold tracking-wide text-white">
                GLIMMERFALL
              </span>
              <span className="block text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                Fractured Nexus
              </span>
            </div>
          </button>

          {/* Animated Multi-Tab Switcher + Direct Reader Link */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1 rounded-2xl bg-white/[0.04] p-1 border border-white/10">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                      active ? "text-slate-950" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="active-tab-pill"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-300 to-purple-400"
                      />
                    )}
                    <Icon className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <Link
              href="/reader"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/50 text-xs font-bold text-amber-200 transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden lg:inline">Read Manga</span>
              <span className="lg:hidden">Read</span>
            </Link>
          </div>

          {/* External Links */}
          <div className="hidden md:flex items-center gap-4 text-xs text-slate-400">
            <a
              href="https://glimmerfalltcg.com"
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col items-end leading-tight hover:text-cyan-300 transition"
            >
              <span className="inline-flex items-center gap-1 font-semibold text-slate-200 group-hover:text-cyan-300">
                GlimmerFallTCG.com <ExternalLink className="w-3 h-3" />
              </span>
              <span className="text-[10px] uppercase tracking-wider text-cyan-400/80">
                Card Game
              </span>
            </a>
            <span className="h-6 w-px bg-white/10" />
            <a
              href="https://glimmerfall.online"
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col items-end leading-tight hover:text-purple-300 transition"
            >
              <span className="inline-flex items-center gap-1 font-semibold text-slate-200 group-hover:text-purple-300">
                GlimmerFall.Online <ExternalLink className="w-3 h-3" />
              </span>
              <span className="text-[10px] uppercase tracking-wider text-purple-400/80">
                MMORPG
              </span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            {activeTab === "welcome" && (
              <WelcomeTab
                onNavigateTab={setActiveTab}
                onPlayOst={(trackId) => playTrack(trackId)}
              />
            )}
            {activeTab === "manga" && (
              <ChaptersTab
                onSelectChapterOst={(ostId, chapterTag) =>
                  playTrack(ostId, chapterTag)
                }
              />
            )}
            {activeTab === "factions" && <FactionsTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
