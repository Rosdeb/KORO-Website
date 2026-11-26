"use client";

import { useEffect, useState } from "react";
import { Search, Sparkles, Languages, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SearchAnimationLoaderProps {
  query?: string;
  sourceLangName?: string;
  targetLangName?: string;
}

const STEPS = [
  "Searching vocabulary corpus...",
  "Matching cross-language concepts...",
  "Verifying pronunciations & dialects...",
  "Formatting translations...",
];

export function SearchAnimationLoader({
  query,
  sourceLangName = "English",
  targetLangName = "Target Language",
}: SearchAnimationLoaderProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="relative overflow-hidden border-border/80 bg-gradient-to-b from-card via-card/95 to-accent-50/20 p-8 shadow-sm">
      {/* Decorative animated gradient aura in background */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-96 rounded-full bg-accent/10 blur-3xl animate-pulse" />

      <div className="relative flex flex-col items-center justify-center text-center">
        {/* Animated Radar & Translation Waves Visualizer */}
        <div className="relative mb-6 flex size-28 items-center justify-center">
          {/* Outer Ripple Wave 1 */}
          <span className="absolute inline-flex size-28 animate-ping rounded-full bg-accent/15 duration-1000 opacity-40" />

          {/* Outer Ripple Wave 2 */}
          <span className="absolute inline-flex size-24 animate-pulse rounded-full border border-accent/30 bg-accent/5 duration-700" />

          {/* Rotating Orbital Track */}
          <div className="absolute inset-0 animate-[spin_8s_linear_infinite]">
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex size-6 items-center justify-center rounded-full bg-background border border-accent/40 text-accent shadow-xs">
              <Sparkles className="size-3" />
            </span>
            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex size-6 items-center justify-center rounded-full bg-background border border-primary/30 text-muted-foreground shadow-xs">
              <Languages className="size-3" />
            </span>
          </div>

          {/* Central Glowing Orb */}
          <div className="relative flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent to-accent-600 text-white shadow-lg shadow-accent/25">
            <Search className="size-6 animate-pulse" />
          </div>
        </div>

        {/* Translation Path Badge */}
        {query && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3.5 py-1 text-xs font-medium text-foreground shadow-xs backdrop-blur-sm animate-fade-in">
            <span className="text-muted-foreground">{sourceLangName}</span>
            <span className="text-accent font-bold">→</span>
            <span className="font-semibold text-accent">{targetLangName}</span>
            <span className="mx-1 text-border">|</span>
            <span className="max-w-[12rem] truncate italic text-muted-foreground">&ldquo;{query}&rdquo;</span>
          </div>
        )}

        {/* Dynamic cycling step text */}
        <h3 className="text-base font-semibold text-foreground transition-all duration-300">
          {STEPS[stepIndex]}
        </h3>

        {/* Animated Equalizer Wave Bars */}
        <div className="mt-4 flex items-center gap-1.5" aria-hidden="true">
          {[0.6, 1.2, 0.9, 1.4, 0.7, 1.1, 0.8].map((scale, i) => (
            <span
              key={i}
              className="w-1 rounded-full bg-accent animate-pulse"
              style={{
                height: `${14 * scale}px`,
                animationDelay: `${i * 120}ms`,
                animationDuration: "900ms",
              }}
            />
          ))}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Scanning verified native words, phonetics, and grammatical usage
        </p>
      </div>
    </Card>
  );
}
