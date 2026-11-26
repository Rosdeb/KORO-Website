"use client";

import { useEffect, useState, useRef } from "react";
import { Cpu } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface SearchAnimationLoaderProps {
  query?: string;
  sourceLangName?: string;
  targetLangName?: string;
  className?: string;
}

const STEPS = [
  { label: "Scanning phonetic corpus & roots", detail: "Cross-referencing IPA & regional dialects" },
  { label: "Neural semantic concept matching", detail: "Evaluating multi-language word embeddings" },
  { label: "Audio pronunciation verification", detail: "Synthesizing native phonetic frequencies" },
  { label: "Compiling verified dictionary entries", detail: "Validating community approval & grammar" },
];

export function SearchAnimationLoader({
  query,
  sourceLangName = "English",
  targetLangName = "Target Language",
  className,
}: SearchAnimationLoaderProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(28);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Ensure video is strictly muted, plays silently, and loops continuously at 1.2x speed
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      videoRef.current.playbackRate = 1.2;
      videoRef.current.play().catch(() => {
        // Fallback if browser policy blocks autoplay before interaction
      });
    }

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        const jump = Math.floor(Math.random() * 8) + 4;
        return Math.min(95, prev + jump);
      });
    }, 240);

    const stepTimer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 900);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
    };
  }, []);

  return (
    <Card
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-border bg-white dark:bg-card p-5 sm:p-6 shadow-xs transition-shadow duration-200",
        className,
      )}
    >
      {/* 1. Clean Top HUD Bar (No gradient overlays) */}
      <div className="relative mb-4 flex items-center justify-between border-b border-border/70 pb-3 text-[11px]">
        <div className="flex items-center gap-2 font-medium">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Neural Radar
          </span>
        </div>

        <div className="flex items-center gap-2.5 font-mono text-[11px] text-muted-foreground">
          <span className="hidden sm:inline-flex items-center gap-1">
            <Cpu className="size-3 text-accent" />
            <span>AI SCAN</span>
          </span>
          <span className="font-semibold text-accent">{progress}%</span>
          <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-accent transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center text-center">
        {/* 2. Crisp, Visible Continuous Video Loader */}
        <div className="relative my-3 flex size-28 sm:size-32 items-center justify-center rounded-2xl bg-white overflow-hidden">
          <video
            ref={(el) => {
              videoRef.current = el;
              if (el) {
                el.muted = true;
                el.defaultMuted = true;
                try {
                  el.playbackRate = 1.2;
                } catch {}
                el.play().catch(() => {});
              }
            }}
            src="/Loader.mp4"
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
            aria-hidden="true"
            onLoadedMetadata={(e) => {
              try {
                e.currentTarget.playbackRate = 1.2;
              } catch {}
            }}
            onPlay={(e) => {
              try {
                e.currentTarget.playbackRate = 1.2;
              } catch {}
            }}
            className="size-full object-contain pointer-events-none select-none bg-white"
          />
        </div>

        {/* 3. Translation Route HUD Badge */}
        {query && (
          <div className="mt-2 mb-2.5 inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3.5 py-1 text-xs font-medium text-foreground shadow-2xs animate-fade-in">
            <span className="text-muted-foreground">{sourceLangName}</span>
            <span className="text-accent font-bold">→</span>
            <span className="font-semibold text-accent">{targetLangName}</span>
            <span className="mx-1 text-border">|</span>
            <span className="max-w-[14rem] truncate italic text-muted-foreground">
              &ldquo;{query}&rdquo;
            </span>
          </div>
        )}

        {/* 4. Dynamic Step Headline & Subtitle */}
        <div className="min-h-[2.75rem]">
          <h3 className="text-sm sm:text-base font-semibold tracking-tight text-foreground transition-all duration-300">
            {STEPS[stepIndex].label}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground transition-all duration-300">
            {STEPS[stepIndex].detail}
          </p>
        </div>

        {/* 5. Clean Solid Equalizer Waveform Bars (No gradient) */}
        <div className="mt-3 flex items-center justify-center gap-1" aria-hidden="true">
          {[0.5, 1.1, 0.7, 1.4, 0.9, 1.3, 0.6, 1.2, 0.8, 1.0].map((scale, i) => (
            <span
              key={i}
              className="w-1 rounded-full bg-accent/80 animate-pulse"
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
