"use client";

import { useEffect, useState } from "react";
import { Search, Cpu } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SearchAnimationLoaderProps {
  query?: string;
  sourceLangName?: string;
  targetLangName?: string;
}

const STEPS = [
  { label: "Scanning phonetic corpus & roots", detail: "Cross-referencing IPA & regional dialects" },
  { label: "Neural semantic concept matching", detail: "Evaluating multi-language word embeddings" },
  { label: "Audio pronunciation verification", detail: "Synthesizing native phonetic frequencies" },
  { label: "Compiling verified dictionary entries", detail: "Validating community approval & grammar" },
];

const GLYPHS = [
  { char: "অ", angle: 0 },
  { char: "A", angle: 120 },
  { char: "က", angle: 240 },
];

export function SearchAnimationLoader({
  query,
  sourceLangName = "English",
  targetLangName = "Target Language",
}: SearchAnimationLoaderProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(24);

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        const jump = Math.floor(Math.random() * 9) + 4;
        return Math.min(95, prev + jump);
      });
    }, 300);

    const stepTimer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 1100);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
    };
  }, []);

  return (
    <Card className="relative mx-auto max-w-lg overflow-hidden border border-accent/20 bg-gradient-to-b from-card via-card/95 to-accent-50/15 p-4 sm:p-5 shadow-sm">
      {/* 1. Subtle Laser Scan Beam */}
      <div
        className="pointer-events-none absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-accent/15 to-transparent animate-pulse"
        style={{ animationDuration: "2s" }}
      />
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-36 w-72 rounded-full bg-accent/10 blur-2xl animate-pulse" />

      {/* 2. Compact Top HUD Bar */}
      <div className="relative mb-3.5 flex items-center justify-between border-b border-border/50 pb-2 text-[11px]">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Neural Radar
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
          <span className="hidden sm:inline-flex items-center gap-1">
            <Cpu className="size-2.5 text-accent" />
            <span>AI SCAN</span>
          </span>
          <span className="font-semibold text-accent">{progress}%</span>
          <div className="h-1 w-12 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center text-center">
        {/* 3. Compact Multi-Ring Hologram Radar (size-20 / 80px) */}
        <div className="relative mb-3 flex size-20 items-center justify-center">
          {/* Sonar Expanding Waves */}
          <span className="absolute inline-flex size-20 animate-ping rounded-full bg-accent/10 duration-1000 opacity-40" />
          <span className="absolute inline-flex size-16 animate-pulse rounded-full border border-accent/25 bg-accent/5 duration-700" />

          {/* SVG Tech Ring with Dash Markers */}
          <svg
            className="absolute inset-0 size-full animate-[spin_10s_linear_infinite]"
            viewBox="0 0 80 80"
            fill="none"
          >
            <circle
              cx="40"
              cy="40"
              r="37"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="3 6"
              className="text-accent/35"
            />
            <circle
              cx="40"
              cy="40"
              r="31"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="12 24"
              className="text-primary/20"
            />
          </svg>

          {/* Reverse Rotating Crosshairs */}
          <div className="absolute inset-0 animate-[spin_16s_linear_infinite_reverse]">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-[1px] bg-gradient-to-b from-accent/30 via-transparent to-accent/30" />
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-accent/30 via-transparent to-accent/30" />
          </div>

          {/* Orbiting Language Glyphs */}
          <div className="absolute inset-0 animate-[spin_8s_linear_infinite]">
            {GLYPHS.map((g, idx) => {
              const rad = (g.angle * Math.PI) / 180;
              const x = 50 + 38 * Math.cos(rad);
              const y = 50 + 38 * Math.sin(rad);
              return (
                <div
                  key={idx}
                  className="absolute flex size-4.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/30 bg-background text-[9px] font-bold text-accent shadow-2xs"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <span className="animate-[spin_8s_linear_infinite_reverse]">{g.char}</span>
                </div>
              );
            })}
          </div>

          {/* Center Glowing Energy Core */}
          <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-accent to-accent-600 text-white shadow-md shadow-accent/25">
            <Search className="size-4 animate-pulse" />
          </div>
        </div>

        {/* 4. Translation Route HUD Badge */}
        {query && (
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-background/80 px-3 py-0.5 text-[11px] font-medium text-foreground shadow-2xs backdrop-blur-xs animate-fade-in">
            <span className="text-muted-foreground">{sourceLangName}</span>
            <span className="text-accent font-bold">→</span>
            <span className="font-semibold text-accent">{targetLangName}</span>
            <span className="mx-0.5 text-border">|</span>
            <span className="max-w-[10rem] truncate italic text-muted-foreground">
              &ldquo;{query}&rdquo;
            </span>
          </div>
        )}

        {/* 5. Dynamic Step Headline & Subtitle */}
        <div className="min-h-[2.5rem]">
          <h3 className="text-sm font-semibold tracking-tight text-foreground transition-all duration-300">
            {STEPS[stepIndex].label}
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground transition-all duration-300">
            {STEPS[stepIndex].detail}
          </p>
        </div>

        {/* 6. Compact Equalizer Waveform Visualizer (10-band Spectrum) */}
        <div className="mt-2.5 flex items-center justify-center gap-1" aria-hidden="true">
          {[0.5, 1.1, 0.7, 1.4, 0.9, 1.3, 0.6, 1.2, 0.8, 1.0].map((scale, i) => (
            <span
              key={i}
              className="w-1 rounded-full bg-gradient-to-t from-accent to-accent-600 animate-pulse"
              style={{
                height: `${Math.round(14 * scale)}px`,
                animationDelay: `${(i % 4) * 130}ms`,
                animationDuration: "750ms",
              }}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
