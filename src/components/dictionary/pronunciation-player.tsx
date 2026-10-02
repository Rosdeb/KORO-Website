"use client";

import * as React from "react";
import { TtsSpeechButton } from "@/components/ui/tts-speech-button";
import { cn } from "@/lib/utils/cn";

export interface PronunciationPlayerProps {
  text: string;
  pronunciation?: string | null;
  languageCode: string;
  languageName?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
}

export function PronunciationPlayer({
  text,
  pronunciation,
  languageCode,
  languageName,
  className,
  size = "default",
  showLabel = true,
}: PronunciationPlayerProps) {
  if (!text && !pronunciation) return null;

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <TtsSpeechButton
        text={text}
        pronunciationText={pronunciation}
        langCode={languageCode}
        label={
          languageName
            ? `Listen to ${languageName} pronunciation`
            : "Listen to pronunciation"
        }
        variant="icon"
        size={size}
        showSettings={true}
      />
      {pronunciation && showLabel && (
        <span className="text-xs font-medium text-muted-foreground">
          /{pronunciation}/
        </span>
      )}
    </div>
  );
}
