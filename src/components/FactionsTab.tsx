"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, X } from "lucide-react";
import cardsDbRaw from "@/data/cards_db.json";
import { FACTIONS, type FactionId } from "@/data/universe";
import { FactionSymbol } from "./FactionSymbols";

interface DbCard {
  id: number | string;
  name: string;
  card_type: string;
  cost: number | null;
  power: number | null;
  health: number | null;
  description: string | null;
  image_url: string;
  faction: string;
  keywords: string[] | string | null;
  set_name?: string | null;
  collector_number?: number | string | null;
  set_code?: string | null;
  lore?: string | null;
}

const CARDS_DB = cardsDbRaw as DbCard[];

export function FactionsTab() {
  const [selectedFaction, setSelectedFaction] = useState<FactionId | "all">("all");
  const [query, setQuery] = useState("");
  const [activeCard, setActiveCard] = useState<DbCard | null>(null);

  const filteredCards = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CARDS_DB.filter((c) => {
      const f = (c.faction || "").toLowerCase();
      if (selectedFaction !== "all" && f !== selectedFaction) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q) ||
        (c.lore || "").toLowerCase().includes(q)
      );
    }).sort(
      (a, b) =>
        Number(a.collector_number ?? 9999) - Number(b.collector_number ?? 9999)
    );
  }, [selectedFaction, query]);

  return (
    <div className="space-y-8 pb-28">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Factions &amp; Official Card Lore{" "}
            <span className="text-sm font-mono font-normal text-cyan-400">
              ({CARDS_DB.length} cards)
            </span>
          </h2>
          <p className="text-sm text-slate-400">
            Official faction emblems, Fractured Nexus districts, and the GlimmerFall card lore registry.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedFaction("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
              selectedFaction === "all"
                ? "bg-white text-slate-950 border-white"
                : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
            }`}
          >
            All ({CARDS_DB.length})
          </button>
          {(Object.keys(FACTIONS) as FactionId[]).map((fid) => {
            const f = FACTIONS[fid];
            const active = selectedFaction === fid;
            return (
              <button
                key={fid}
                onClick={() => setSelectedFaction(fid)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  active
                    ? f.badgeBg
                    : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                }`}
              >
                <FactionSymbol faction={fid} className="w-4 h-4" />
                {f.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 322 cards by name, effect, or lore..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0a0d18] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* Faction Lore Banner if filtered */}
      {selectedFaction !== "all" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-[#0b0f1e] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
        >
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <FactionSymbol faction={selectedFaction} className="w-12 h-12" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">
              {FACTIONS[selectedFaction].name} — {FACTIONS[selectedFaction].title}
            </h3>
            <p className="text-xs text-cyan-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              Territory: {FACTIONS[selectedFaction].nexusDistrict}
            </p>
            <p className="text-sm text-slate-300 max-w-2xl">
              {FACTIONS[selectedFaction].description}
            </p>
          </div>
        </motion.div>
      )}

      {/* Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredCards.map((card) => {
          const fid = (card.faction || "aether").toLowerCase() as FactionId;
          const faction = FACTIONS[fid] ?? FACTIONS.aether;
          return (
            <motion.button
              key={card.id}
              whileHover={{ y: -5 }}
              onClick={() => setActiveCard(card)}
              className="group text-left rounded-2xl border border-white/10 bg-[#0a0d19] overflow-hidden shadow-xl hover:border-white/25 transition"
            >
              <div className="relative aspect-[3/4] bg-slate-900 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.image_url}
                  alt={card.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{card.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate">
                    #{String(card.collector_number ?? 0).padStart(3, "0")} • {faction.name}
                  </p>
                </div>
                <FactionSymbol faction={fid} className="w-5 h-5 shrink-0" />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Card Detail & Lore Modal */}
      <AnimatePresence>
        {activeCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveCard(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full rounded-3xl border border-white/15 bg-[#0b0f1e] overflow-hidden shadow-2xl grid grid-cols-1 sm:grid-cols-12"
            >
              <div className="sm:col-span-5 bg-black flex items-center justify-center p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeCard.image_url}
                  alt={activeCard.name}
                  className="rounded-xl max-h-80 object-contain shadow-2xl"
                />
              </div>
              <div className="sm:col-span-7 p-6 space-y-4 relative flex flex-col justify-center">
                <button
                  onClick={() => setActiveCard(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
                <div>
                  <span className="text-[11px] font-mono text-cyan-300">
                    {activeCard.faction} • {activeCard.card_type}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">{activeCard.name}</h3>
                </div>
                {activeCard.description && (
                  <p className="text-xs text-slate-200 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                    {activeCard.description}
                  </p>
                )}
                {activeCard.lore && (
                  <p className="text-xs italic text-purple-200/90 leading-relaxed">
                    “{activeCard.lore}”
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
