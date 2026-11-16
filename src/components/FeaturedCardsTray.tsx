"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ExternalLink } from "lucide-react";
import cardsDbRaw from "@/data/cards_db.json";
import { CHAPTER_METADATA, FACTIONS, type FactionId } from "@/data/universe";
import { FactionSymbol } from "./FactionSymbols";

interface DbCard {
  id: number | string;
  name: string;
  card_type: string;
  description: string | null;
  image_url: string;
  faction: string;
  lore?: string | null;
}

const CARDS_BY_NAME = new Map<string, DbCard>(
  (cardsDbRaw as DbCard[]).map((c) => [c.name.toLowerCase(), c])
);

export function FeaturedCardsTray({
  chapterNumber,
  compact = false,
}: {
  chapterNumber: number;
  compact?: boolean;
}) {
  const [selectedCard, setSelectedCard] = useState<DbCard | null>(null);

  const featuredCards = useMemo(() => {
    const meta = CHAPTER_METADATA.find((c) => c.number === chapterNumber);
    if (!meta) return [];
    return meta.featuredCards
      .map((name) => CARDS_BY_NAME.get(name.toLowerCase()))
      .filter((c): c is DbCard => Boolean(c));
  }, [chapterNumber]);

  if (featuredCards.length === 0) return null;

  return (
    <>
      {compact ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mr-0.5">
            Featured:
          </span>
          {featuredCards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => setSelectedCard(card)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-400/40 text-[10px] text-slate-200 transition"
            >
              <FactionSymbol
                faction={(card.faction || "aether").toLowerCase() as FactionId}
                className="w-3 h-3"
              />
              {card.name}
            </button>
          ))}
        </div>
      ) : (
        <section className="max-w-4xl mx-auto mt-8 rounded-2xl border border-zinc-800 bg-[#14161d]/90 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Featured Cards in Chapter {String(chapterNumber).padStart(2, "0")}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Click any canon card from this chapter to read its official GlimmerFall lore.
              </p>
            </div>
            <a
              href="https://glimmerfalltcg.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:underline"
            >
              View on GlimmerFallTCG.com <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {featuredCards.map((card) => {
              const fid = (card.faction || "aether").toLowerCase() as FactionId;
              const f = FACTIONS[fid] ?? FACTIONS.aether;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setSelectedCard(card)}
                  className="group text-left rounded-xl border border-zinc-800 bg-zinc-950/70 overflow-hidden hover:border-amber-400/50 transition"
                >
                  <div className="aspect-[3/4] bg-black overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.image_url}
                      alt={card.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="p-2 flex items-center justify-between gap-1.5">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-white truncate">{card.name}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{f.name}</p>
                    </div>
                    <FactionSymbol faction={fid} className="w-4 h-4 shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Card Lore Modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCard(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-xl w-full rounded-3xl border border-white/15 bg-[#0b0f1e] overflow-hidden shadow-2xl grid grid-cols-1 sm:grid-cols-12"
            >
              <div className="sm:col-span-5 bg-black flex items-center justify-center p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedCard.image_url}
                  alt={selectedCard.name}
                  className="rounded-xl max-h-72 object-contain"
                />
              </div>
              <div className="sm:col-span-7 p-6 space-y-3 relative flex flex-col justify-center">
                <button
                  type="button"
                  onClick={() => setSelectedCard(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
                <div>
                  <span className="text-[11px] font-mono text-cyan-300">
                    {selectedCard.faction} • {selectedCard.card_type}
                  </span>
                  <h4 className="text-xl font-bold text-white mt-0.5">
                    {selectedCard.name}
                  </h4>
                </div>
                {selectedCard.description && (
                  <p className="text-xs text-slate-200 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                    {selectedCard.description}
                  </p>
                )}
                {selectedCard.lore && (
                  <p className="text-xs italic text-purple-200/90 leading-relaxed">
                    “{selectedCard.lore}”
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
