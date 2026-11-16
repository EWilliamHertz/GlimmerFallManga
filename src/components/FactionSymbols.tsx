"use client";

import React from "react";
import type { FactionId } from "@/data/universe";

export function GlimmerFallCrest({ className = "w-8 h-8" }: { className?: string }) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src="/logos/glimmerfall-logo-256.png"
      alt="GlimmerFall Official Logo"
      className={`object-contain ${className}`}
    />
  );
}

export function GlimmerFallOfficialLogo({ className = "h-14 w-auto" }: { className?: string }) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src="/logos/GlimmerFall_official_multicolor_logo.png"
      alt="GlimmerFall Official Multicolor Logo"
      className={`object-contain ${className}`}
    />
  );
}

export function FactionSymbol({
  faction,
  className = "w-6 h-6",
}: {
  faction: FactionId | "nexus";
  className?: string;
}) {
  if (faction === "nexus") {
    return <GlimmerFallCrest className={className} />;
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={`/factions/${faction}_nobg.png`}
      alt={`${faction} faction emblem`}
      className={`object-contain ${className}`}
    />
  );
}
