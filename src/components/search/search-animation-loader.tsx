"use client";

import { useEffect, useState } from "react";
import { Search, Cpu, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SearchAnimationLoaderProps {
  query?: string;
  sourceLangName?: string;
  targetLangName?: string;
}

const STEPS = [
  { label: "Scanning phonetic corpus & roots", detail: "Cross-referencing IPA & regional dialects" },
  { label: "Neural concept semantic matching", detail: "Evaluating multi-language word embeddings" },
  { label: "Audio pronunciation verification", detail: "Synthesizing native phonetic frequencies" },
  { label: "Compiling verified dictionary entries", detail: "Validating community approval & grammar" },
];

const GLYPHS = [
  { char: "অ", label: "Bengali", angle: 0 },
  { char: "က", label: "Burmese", angle: 72 },
  { char: "A", label: "English", angle: 144 },
  { char: "𑄎", label: "Chakma", angle: 216 },
  { char: "文", label: "Script", angle: 288 },
];

export function SearchAnimationLoader({
  query,
  sourceLangName = "English",
  targetLangName = "Target Language",
}: SearchAnimationLoaderProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    // Dynamic simulated progress climbing smoothly
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 94) return 94;
        const jump = Math.floor(Math.random() * 8) + 4;
        return Math.min(94, prev + jump);
      });
    }, 350);

    const stepTimer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 1100);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
    };
  }, []);

  return (
    <Card className="relative overflow-hidden border border-accent/20 bg-gradient-to-b from-card via-card/95 to-accent-50/15 p-6 sm:p-8 shadow-lg shadow-accent/5">
      {/* 1. Animated Vertical Laser Scanning Sweep */}
      <div
        className="pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-accent/15 to-transparent animate-[pulse_2s_ease-in-out_infinite]"
        style={{
          animationDuration: "2.4s",
        }}
      />
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[32rem] rounded-full bg-accent/10 blur-3xl animate-pulse" />

      {/* 2. Top HUD Bar (Sci-Fi / Video Player Scanner Header) */}
      <div className="relative mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3 text-xs">
        <div className="flex items-center gap-2 font-medium">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Neural Phonetic Radar
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
          <span className="hidden sm:inline-flex items-center gap-1">
            <Cpu className="size-3 text-accent" />
            <span>AI INDEXING</span>
          </span>
          <span className="font-semibold text-accent">{progress}%</span>
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center text-center">
        {/* 3. Central Multi-Ring Hologram Radar */}
        <div className="relative mb-6 flex size-36 sm:size-40 items-center justify-center">
          {/* Sonar Expanding Waves */}
          <span className="absolute inline-flex size-36 sm:size-40 animate-ping rounded-full bg-accent/10 duration-1000 opacity-50" />
          <span className="absolute inline-flex size-28 sm:size-32 animate-pulse rounded-full border border-accent/25 bg-accent/5 duration-700" />

          {/* SVG Tech Ring with Dash Markers */}
          <svg
            className="absolute inset-0 size-full animate-[spin_12s_linear_infinite]"
            viewBox="0 0 160 160"
            fill="none"
          >
            <circle
              cx="80"
              cy="80"
              r="74"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 8"
              className="text-accent/30"
            />
            <circle
              cx="80"
              cy="80"
              r="62"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="20 40"
              className="text-primary/20"
            />
          </svg>

          {/* Reverse Rotating Crosshairs */}
          <div className="absolute inset-0 animate-[spin_20s_linear_infinite_reverse]">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-[1px] bg-gradient-to-b from-accent/40 via-transparent to-accent/40" />
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-accent/40 via-transparent to-accent/40" />
          </div>

          {/* Orbiting Language Glyphs */}
          <div className="absolute inset-0 animate-[spin_10s_linear_infinite]">
            {GLYPHS.map((g, idx) => {
              const rad = (g.angle * Math.PI) / 180;
              const x = 50 + 40 * Math.cos(rad);
              const y = 50 + 40 * Math.sin(rad);
              return (
                <div
                  key={idx}
                  className="absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/30 bg-background/90 text-[11px] font-bold text-accent shadow-xs backdrop-blur-xs"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <span className="animate-[spin_10s_linear_infinite_reverse]">{g.char}</span>
                </div>
              );
            })}
          </div>

          {/* Center Glowing Energy Core */}
          <div className="relative flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent via-accent-600 to-primary text-white shadow-xl shadow-accent/30">
            <Search className="size-6 animate-pulse" />
          </div>
        </div>

        {/* 4. Translation Route HUD Badge */}
        {query && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-background/90 px-4 py-1.5 text-xs font-medium text-foreground shadow-xs backdrop-blur-sm animate-fade-in">
            <span className="text-muted-foreground">{sourceLangName}</span>
            <span className="text-accent font-bold">──►</span>
            <span className="font-semibold text-accent">{targetLangName}</span>
            <span className="mx-1 text-border">|</span>
            <span className="max-w-[14rem] truncate font-medium italic text-foreground">
              &ldquo;{query}&rdquo;
            </span>
          </div>
        )}

        {/* 5. Dynamic Step Headline & Subtitle */}
        <div className="min-h-[3rem]">
          <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground transition-all duration-300">
            {STEPS[stepIndex].label}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground transition-all duration-300">
            {STEPS[stepIndex].detail}
          </p>
        </div>

        {/* 6. High-Tech Equalizer Waveform Visualizer (16-band Spectrum) */}
        <div className="mt-5 flex items-center justify-center gap-1 sm:gap-1.5" aria-hidden="true">
          {[0.4, 0.9, 1.4, 0.7, 1.8, 1.1, 0.6, 1.6, 1.2, 0.5, 1.5, 0.8, 1.7, 1.0, 0.6, 1.3].map(
            (scale, i) => (
              <span
                key={i}
                className="w-1 sm:w-1.5 rounded-full bg-gradient-to-t from-accent to-accent-600 animate-pulse"
                style={{
                  height: `${Math.round(20 * scale)}px`,
                  animationDelay: `${(i % 5) * 150}ms`,
                  animationDuration: "800ms",
                }}
              />
            ),
          )}
        </div>

        {/* 7. Step Progress Indicators */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 border-t border-border/40 pt-4 text-[11px] text-muted-foreground">
          {STEPS.map((s, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 transition-colors ${
                idx === stepIndex
                  ? "bg-accent/15 font-medium text-accent"
                  : idx < stepIndex
                    ? "text-foreground font-normal"
                    : "text-muted-foreground/60"
              }`}
            >
              {idx <= stepIndex ? (
                <CheckCircle2 className="size-3 text-accent" />
              ) : (
                <span className="size-1.5 rounded-full bg-muted-foreground/40" />
              )}
              <span className="hidden sm:inline">{s.label.split(" ")[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
