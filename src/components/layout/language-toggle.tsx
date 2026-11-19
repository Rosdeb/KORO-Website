"use client";

import { Globe } from "lucide-react";
import { useI18n } from "@/features/i18n/context";
import { cn } from "@/lib/utils/cn";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/glass-tooltip";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <TooltipProvider delayMs={250}>
      <div
        className={cn(
          "inline-flex h-9 items-center rounded-xl border border-border bg-card/80 p-1 text-xs font-semibold shadow-xs backdrop-blur-xs",
          className
        )}
        role="group"
        aria-label="Language selection"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setLocale("en")}
              aria-pressed={locale === "en"}
              className={cn(
                "flex h-7 items-center justify-center gap-1 rounded-lg px-3 text-xs transition-all active:scale-95",
                locale === "en"
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>EN</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>
            English
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setLocale("bn")}
              aria-pressed={locale === "bn"}
              className={cn(
                "flex h-7 items-center justify-center gap-1 rounded-lg px-3 text-xs transition-all active:scale-95",
                locale === "bn"
                  ? "bg-primary text-primary-foreground shadow-xs font-bold font-bn"
                  : "text-muted-foreground hover:text-foreground font-bn"
              )}
            >
              <span className="font-bn">বাং</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>
            বাংলা (Bengali)
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export function CompactLanguageToggle({ className }: { className?: string }) {
  const { locale, toggleLocale } = useI18n();

  return (
    <TooltipProvider delayMs={250}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={toggleLocale}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card/80 px-3 text-xs font-medium transition-colors hover:bg-muted shadow-xs backdrop-blur-xs active:scale-95",
              className
            )}
            aria-label="Switch website language"
          >
            <Globe className="size-4 text-primary" />
            <span className="font-semibold">{locale === "en" ? "EN" : "বাং"}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          {locale === "en" ? "Switch to বাংলা" : "Switch to English"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
