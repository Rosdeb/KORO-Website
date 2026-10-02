"use client";

import * as React from "react";
import { Volume2, VolumeX, Settings2, Sparkles, Check, Play, Square, FastForward } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  isSpeechSupported,
  getAvailableVoices,
  getVoicesForLanguage,
  speakText,
  stopSpeaking,
  mapLanguageCodeToBcp47,
} from "@/lib/utils/speech";

export interface TtsSpeechButtonProps {
  text: string;
  pronunciationText?: string | null;
  langCode?: string;
  label?: string;
  variant?: "icon" | "inline" | "badge" | "button";
  size?: "sm" | "default" | "lg";
  showSettings?: boolean;
  className?: string;
}

const SPEED_OPTIONS = [
  { label: "0.75x", value: 0.75, desc: "Slow" },
  { label: "1.0x", value: 1.0, desc: "Normal" },
  { label: "1.25x", value: 1.25, desc: "Fast" },
];

export function TtsSpeechButton({
  text,
  pronunciationText,
  langCode = "en",
  label,
  variant = "icon",
  size = "default",
  showSettings = true,
  className,
}: TtsSpeechButtonProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isSupported, setIsSupported] = React.useState(false);
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = React.useState<string>("");
  const [speed, setSpeed] = React.useState<number>(1.0);
  const [speakTarget, setSpeakTarget] = React.useState<"word" | "pronunciation">("word");
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  React.useEffect(() => {
    const supported = isSpeechSupported();
    setIsSupported(supported);

    if (supported) {
      const updateVoices = () => {
        const list = getAvailableVoices();
        setVoices(list);
      };

      updateVoices();

      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
      }

      return () => {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
        }
      };
    }
  }, []);

  const relevantVoices = React.useMemo(() => {
    return getVoicesForLanguage(voices, langCode);
  }, [voices, langCode]);

  const targetText = speakTarget === "pronunciation" && pronunciationText ? pronunciationText : text;

  const handleTogglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();

    if (!isSupported) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    speakText({
      text: targetText,
      langCode,
      voiceName: selectedVoice || undefined,
      rate: speed,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  if (!text && !pronunciationText) return null;

  // Icon sizing
  const iconSizeClass =
    size === "sm" ? "size-3.5" : size === "lg" ? "size-5" : "size-4";

  const buttonSizeClass =
    size === "sm"
      ? "h-7 px-2 text-xs"
      : size === "lg"
      ? "h-11 px-4 text-base"
      : "h-8 px-2.5 text-sm";

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      {variant === "icon" && (
        <button
          type="button"
          onClick={handleTogglePlay}
          aria-label={label || (isPlaying ? "Stop speech" : "Listen to pronunciation")}
          title={label || (isPlaying ? "Stop audio" : "Free Text-to-Speech (TTS)")}
          className={cn(
            "relative inline-flex items-center justify-center rounded-full transition-all duration-200",
            size === "sm" && "size-7",
            size === "default" && "size-8",
            size === "lg" && "size-10",
            isPlaying
              ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30 animate-pulse"
              : "bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105 active:scale-95"
          )}
        >
          {isPlaying ? (
            <Square className={cn(iconSizeClass, "fill-current")} />
          ) : (
            <Volume2 className={iconSizeClass} />
          )}
        </button>
      )}

      {variant === "button" && (
        <button
          type="button"
          onClick={handleTogglePlay}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl font-medium transition-all duration-200",
            buttonSizeClass,
            isPlaying
              ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30"
              : "bg-primary/10 text-primary hover:bg-primary/20 active:scale-98"
          )}
        >
          {isPlaying ? (
            <>
              <Square className={cn(iconSizeClass, "fill-current animate-pulse")} />
              <span>Playing...</span>
            </>
          ) : (
            <>
              <Volume2 className={iconSizeClass} />
              <span>{label || "Listen (TTS)"}</span>
            </>
          )}
        </button>
      )}

      {variant === "inline" && (
        <button
          type="button"
          onClick={handleTogglePlay}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors",
            isPlaying
              ? "bg-primary text-primary-foreground animate-pulse"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {isPlaying ? <Square className="size-3 fill-current" /> : <Volume2 className="size-3.5" />}
          <span>{label || (pronunciationText ? pronunciationText : "Pronounce")}</span>
        </button>
      )}

      {variant === "badge" && (
        <button
          type="button"
          onClick={handleTogglePlay}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all",
            isPlaying
              ? "border-primary bg-primary text-primary-foreground animate-pulse"
              : "border-primary/30 bg-primary/5 text-primary hover:bg-primary/15"
          )}
        >
          {isPlaying ? <Square className="size-3 fill-current" /> : <Volume2 className="size-3" />}
          <span>{label || "TTS Voice"}</span>
        </button>
      )}

      {showSettings && isSupported && (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Voice and speech settings"
              title="TTS Voice & Speed Settings"
              className={cn(
                "rounded-full p-1 text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground",
                size === "sm" ? "size-5 text-[10px]" : "size-6"
              )}
            >
              <Settings2 className={size === "sm" ? "size-3" : "size-3.5"} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3 text-sm shadow-xl" align="end">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="size-4 text-primary" />
                  <span className="font-semibold text-foreground">TTS Voice Settings</span>
                </div>
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  Free
                </span>
              </div>

              {/* Speed selector */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Playback Speed
                </label>
                <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted/60 p-1">
                  {SPEED_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSpeed(opt.value)}
                      className={cn(
                        "flex flex-col items-center rounded-lg py-1 text-xs font-medium transition-all",
                        speed === opt.value
                          ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span>{opt.label}</span>
                      <span className="text-[10px] opacity-70">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Text selection if pronunciation is available */}
              {pronunciationText && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Speech Source
                  </label>
                  <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1">
                    <button
                      type="button"
                      onClick={() => setSpeakTarget("word")}
                      className={cn(
                        "rounded-lg py-1 text-xs font-medium transition-all",
                        speakTarget === "word"
                          ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Word Text
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpeakTarget("pronunciation")}
                      className={cn(
                        "rounded-lg py-1 text-xs font-medium transition-all",
                        speakTarget === "pronunciation"
                          ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Phonetics
                    </button>
                  </div>
                </div>
              )}

              {/* Voice Type selector */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">
                    Voice Type ({relevantVoices.length > 0 ? relevantVoices.length : voices.length} available)
                  </label>
                </div>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Default System Voice</option>
                  {(relevantVoices.length > 0 ? relevantVoices : voices).map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Play preview */}
              <button
                type="button"
                onClick={handleTogglePlay}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold text-primary-foreground transition-all",
                  isPlaying ? "bg-danger hover:bg-danger/90" : "bg-primary hover:bg-primary/90"
                )}
              >
                {isPlaying ? (
                  <>
                    <Square className="size-3.5 fill-current" /> Stop Audio
                  </>
                ) : (
                  <>
                    <Play className="size-3.5 fill-current" /> Play Audio Sample
                  </>
                )}
              </button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
