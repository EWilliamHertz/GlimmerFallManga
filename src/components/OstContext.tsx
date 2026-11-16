"use client";

import React, { createContext, useContext, useState } from "react";
import { OstPlayer } from "./OstPlayer";

interface OstContextValue {
  currentTrackId: string;
  isPlaying: boolean;
  syncedLabel: string | null;
  playTrack: (trackId?: string, label?: string | null) => void;
  setTrackOnly: (trackId: string, label?: string | null) => void;
  togglePlay: (next?: boolean) => void;
}

const OstContext = createContext<OstContextValue | null>(null);

export function OstProvider({ children }: { children: React.ReactNode }) {
  const [currentTrackId, setCurrentTrackId] = useState<string>("ost-nexus-overture");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [syncedLabel, setSyncedLabel] = useState<string | null>(null);

  const playTrack = (trackId?: string, label?: string | null) => {
    if (trackId) setCurrentTrackId(trackId);
    setSyncedLabel(label ?? null);
    setIsPlaying(true);
  };

  const setTrackOnly = (trackId: string, label?: string | null) => {
    setCurrentTrackId(trackId);
    setSyncedLabel(label ?? null);
  };

  const togglePlay = (next?: boolean) => {
    setIsPlaying((prev) => (typeof next === "boolean" ? next : !prev));
  };

  return (
    <OstContext.Provider
      value={{
        currentTrackId,
        isPlaying,
        syncedLabel,
        playTrack,
        setTrackOnly,
        togglePlay,
      }}
    >
      {children}
      <OstPlayer
        currentTrackId={currentTrackId}
        onSelectTrack={(id) => {
          setCurrentTrackId(id);
          setSyncedLabel(null);
        }}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        syncedLabel={syncedLabel}
      />
    </OstContext.Provider>
  );
}

export function useOst(): OstContextValue {
  const ctx = useContext(OstContext);
  if (!ctx) {
    throw new Error("useOst must be used inside OstProvider");
  }
  return ctx;
}
