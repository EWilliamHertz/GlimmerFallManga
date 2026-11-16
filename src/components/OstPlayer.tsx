"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music2,
  Sparkles,
  ListMusic,
} from "lucide-react";
import { OST_TRACKS, type OstTrack } from "@/data/universe";
import { FactionSymbol } from "./FactionSymbols";

interface OstPlayerProps {
  currentTrackId: string;
  onSelectTrack: (trackId: string) => void;
  isPlaying: boolean;
  onTogglePlay: (next?: boolean) => void;
  syncedLabel?: string | null;
}

export function OstPlayer({
  currentTrackId,
  onSelectTrack,
  isPlaying,
  onTogglePlay,
  syncedLabel,
}: OstPlayerProps) {
  const [volume, setVolume] = useState(0.55);
  const [muted, setMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [audioMode, setAudioMode] = useState<"file" | "synth">("synth");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const fmtTime = (sec: number) => {
    if (!Number.isFinite(sec) || sec <= 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const trackIndex = Math.max(
    0,
    OST_TRACKS.findIndex((t) => t.id === currentTrackId)
  );
  const track: OstTrack = OST_TRACKS[trackIndex] ?? OST_TRACKS[0];

  const stopSynth = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const playSynthStep = (t: OstTrack, step: number) => {
    if (!ctxRef.current || !gainRef.current) return;
    const ctx = ctxRef.current;
    const now = ctx.currentTime;
    const { baseFreq, chordIntervals, waveform, filterFreq, pulseRateMs } = t.synthPreset;

    const semitone = chordIntervals[step % chordIntervals.length];
    const freq = baseFreq * Math.pow(2, semitone / 12);

    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = waveform;
    osc.frequency.setValueAtTime(freq, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(filterFreq, now);

    const dur = (pulseRateMs / 1000) * 1.4;
    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.exponentialRampToValueAtTime(0.18, now + 0.08);
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(gainRef.current);

    osc.start(now);
    osc.stop(now + dur + 0.05);
  };

  // Try real audio file first; fall back cleanly to built-in Web Audio OST synth
  useEffect(() => {
    stopSynth();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (!isPlaying) return;

    let cancelled = false;

    const startSynth = () => {
      if (cancelled) return;
      setAudioMode("synth");
      if (!ctxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        ctxRef.current = new AudioCtx();
        gainRef.current = ctxRef.current.createGain();
        gainRef.current.connect(ctxRef.current.destination);
      }
      if (ctxRef.current.state === "suspended") {
        ctxRef.current.resume();
      }
      if (gainRef.current) {
        gainRef.current.gain.value = muted ? 0 : volume;
      }

      let step = 0;
      playSynthStep(track, step++);
      intervalRef.current = setInterval(() => {
        playSynthStep(track, step++);
      }, track.synthPreset.pulseRateMs);
    };

    setCurrentTime(0);
    setDuration(0);

    if (track.audioFile) {
      const audio = new Audio(track.audioFile);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = muted ? 0 : volume;
      audioRef.current = audio;

      const onTime = () => setCurrentTime(audio.currentTime || 0);
      const onMeta = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      const onEnded = () => {
        if (cancelled) return;
        audio.currentTime = 0;
        audio.play().catch(() => startSynth());
      };

      audio.addEventListener("timeupdate", onTime);
      audio.addEventListener("loadedmetadata", onMeta);
      audio.addEventListener("ended", onEnded);

      audio
        .play()
        .then(() => {
          if (!cancelled) setAudioMode("file");
        })
        .catch(() => {
          startSynth();
        });

      return () => {
        cancelled = true;
        stopSynth();
        audio.removeEventListener("timeupdate", onTime);
        audio.removeEventListener("loadedmetadata", onMeta);
        audio.removeEventListener("ended", onEnded);
        audio.pause();
      };
    } else {
      startSynth();
    }

    return () => {
      cancelled = true;
      stopSynth();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, track.id]);

  // Update volume / mute live
  useEffect(() => {
    const targetVol = muted ? 0 : volume;
    if (audioRef.current) {
      audioRef.current.volume = targetVol;
    }
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.setTargetAtTime(targetVol, ctxRef.current.currentTime, 0.05);
    }
  }, [volume, muted]);

  const handlePrev = () => {
    const prevIdx = (trackIndex - 1 + OST_TRACKS.length) % OST_TRACKS.length;
    onSelectTrack(OST_TRACKS[prevIdx].id);
  };

  const handleNext = () => {
    const nextIdx = (trackIndex + 1) % OST_TRACKS.length;
    onSelectTrack(OST_TRACKS[nextIdx].id);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[min(94vw,860px)]">
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className="mb-3 rounded-2xl border border-white/10 bg-[#0b0e1a]/95 backdrop-blur-xl p-3 shadow-2xl shadow-black/70"
          >
            <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-white/10">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Music2 className="w-3.5 h-3.5 text-cyan-400" />
                GlimmerFall Built-in OST Queue
              </span>
              <span className="text-[11px] text-slate-500">
                Official GlimmerFall.Online Soundtrack
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto">
              {OST_TRACKS.map((item) => {
                const active = item.id === track.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTrack(item.id);
                      onTogglePlay(true);
                    }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left transition ${
                      active
                        ? "bg-cyan-500/15 border border-cyan-400/30 text-white"
                        : "hover:bg-white/5 border border-transparent text-slate-300"
                    }`}
                  >
                    <FactionSymbol faction={item.faction} className="w-5 h-5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate">{item.title}</div>
                      <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{item.bpm} BPM</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-2xl border border-white/15 bg-[#090c17]/90 backdrop-blur-2xl px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.75)] flex flex-wrap items-center justify-between gap-3">
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 shrink-0">
            <FactionSymbol faction={track.faction} className="w-6 h-6" />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-white truncate">{track.title}</p>
              {syncedLabel && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  <Sparkles className="w-2.5 h-2.5" />
                  {syncedLabel}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">
              {track.subtitle} •{" "}
              <span className="text-cyan-300/90">
                {audioMode === "file"
                  ? duration > 0
                    ? `${fmtTime(currentTime)} / ${fmtTime(duration)}`
                    : "Audio File"
                  : "Live Nexus Synth"}
              </span>
            </p>
            {audioMode === "file" && duration > 0 && (
              <input
                type="range"
                min={0}
                max={duration}
                step={1}
                value={Math.min(currentTime, duration)}
                onChange={(e) => {
                  const next = parseFloat(e.target.value);
                  setCurrentTime(next);
                  if (audioRef.current) audioRef.current.currentTime = next;
                }}
                aria-label="Seek track position"
                className="w-full h-1 mt-1 accent-cyan-400 cursor-pointer"
              />
            )}
          </div>
        </div>

        {/* Equalizer + Controls */}
        <div className="flex items-center gap-2">
          {/* Animated Equalizer Bars */}
          <div className="hidden md:flex items-end gap-0.5 h-5 mr-2">
            {[0.4, 0.9, 0.6, 1, 0.5, 0.8].map((h, i) => (
              <motion.span
                key={i}
                animate={
                  isPlaying
                    ? { scaleY: [0.25, h, 0.35, h * 0.85, 0.25] }
                    : { scaleY: 0.2 }
                }
                transition={{
                  repeat: Infinity,
                  duration: 0.9 + i * 0.12,
                  ease: "easeInOut",
                }}
                style={{ originY: 1 }}
                className="w-1 h-5 rounded-full bg-gradient-to-t from-cyan-500 to-purple-400"
              />
            ))}
          </div>

          <button
            onClick={handlePrev}
            aria-label="Previous OST track"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => onTogglePlay()}
            aria-label={isPlaying ? "Pause OST" : "Play OST"}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 hover:scale-105 transition"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={handleNext}
            aria-label="Next OST track"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Volume & Queue */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMuted((m) => !m)}
            aria-label="Mute toggle"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => {
              setMuted(false);
              setVolume(parseFloat(e.target.value));
            }}
            className="w-16 sm:w-20 accent-cyan-400 cursor-pointer"
          />
          <button
            onClick={() => setShowPlaylist((s) => !s)}
            className={`p-2 rounded-lg border transition ${
              showPlaylist
                ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-300"
                : "border-white/10 text-slate-300 hover:bg-white/10"
            }`}
            title="OST Playlist"
          >
            <ListMusic className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
