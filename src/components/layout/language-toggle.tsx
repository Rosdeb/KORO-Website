"use client";

import { Globe } from "lucide-react";
import { useI18n } from "@/features/i18n/context";
import { cn } from "@/lib/utils/cn";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border border-border bg-card/80 p-0.5 text-xs font-semibold shadow-xs backdrop-blur-xs",
        className
      )}
      role="group"
      aria-label="Language selection"
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={cn(
          "flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all active:scale-95",
          locale === "en"
            ? "bg-primary text-primary-foreground shadow-xs font-bold"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <span className="text-[11px]">EN</span>
      </button>

      <button
        type="button"
        onClick={() => setLocale("bn")}
        aria-pressed={locale === "bn"}
        className={cn(
          "flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all active:scale-95",
          locale === "bn"
            ? "bg-primary text-primary-foreground shadow-xs font-bold font-bn"
            : "text-muted-foreground hover:text-foreground font-bn"
        )}
      >
        <span className="text-[11px]">বাং</span>
      </button>
    </div>
  );
}

export function CompactLanguageToggle({ className }: { className?: string }) {
  const { locale, toggleLocale } = useI18n();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className={cn(
        "flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 text-xs font-medium transition-colors hover:bg-muted active:scale-95",
        className
      )}
      title="Switch website language"
      aria-label="Switch website language"
    >
      <Globe className="size-3.5 text-primary" />
      <span className="font-semibold">{locale === "en" ? "EN" : "বাং"}</span>
    </button>
  );
}
