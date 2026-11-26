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
        "relative w-full overflow-hidden rounded-2xl border border-border bg-card/90 p-4 sm:p-5 shadow-xs backdrop-blur-sm transition-shadow duration-200",
        className,
      )}
    >
      {/* 1. Subtle Laser Scan Beam in background */}
      <div
        className="pointer-events-none absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-accent/10 to-transparent animate-pulse"
        style={{ animationDuration: "2.2s" }}
      />
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-36 w-72 rounded-full bg-accent/5 blur-2xl animate-pulse" />

      {/* 2. Compact Top HUD Bar */}
      <div className="relative mb-3 flex items-center justify-between border-b border-border pb-2 text-[11px]">
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
        {/* 3. Transparent, Seamlessly Looping MP4 Video Loader (1:1 aspect ratio) */}
        <div className="relative mb-3 flex size-24 sm:size-28 items-center justify-center bg-transparent">
          <video
            ref={videoRef}
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
              e.currentTarget.playbackRate = 1.2;
            }}
            onPlay={(e) => {
              e.currentTarget.playbackRate = 1.2;
            }}
            className="size-full object-contain pointer-events-none select-none bg-transparent"
            style={{ backgroundColor: "transparent" }}
          />
        </div>

        {/* 4. Translation Route HUD Badge */}
        {query && (
          <div className="mb-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-0.5 text-[11px] font-medium text-foreground shadow-2xs animate-fade-in">
            <span className="text-muted-foreground">{sourceLangName}</span>
            <span className="text-accent font-bold">→</span>
            <span className="font-semibold text-accent">{targetLangName}</span>
            <span className="mx-0.5 text-border">|</span>
            <span className="max-w-[12rem] truncate italic text-muted-foreground">
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

        {/* 6. Compact Equalizer Waveform Visualizer */}
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
