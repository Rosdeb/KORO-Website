"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, Languages, BookOpen, Shapes, Loader2, ArrowRight, AlertTriangle } from "lucide-react";
import { useDebouncedValue } from "@/lib/utils/use-debounced-value";
import { useGlobalSearch } from "@/features/search/hooks";
import { cn } from "@/lib/utils/cn";
import { scriptClassFor } from "@/lib/utils/script-font";
import { useI18n } from "@/features/i18n/context";

interface SearchBarProps {
  size?: "lg" | "md";
  placeholder?: string;
  autoFocus?: boolean;
  onNavigate?: () => void;
  className?: string;
  collapsible?: boolean;
}

const EXAMPLES = ["family", "water", "পানি", "မြန်မာ", "love", "আলো"];

export function SearchBar({
  size = "md",
  placeholder,
  autoFocus,
  onNavigate,
  className,
  collapsible = false,
}: SearchBarProps) {
  const { t } = useI18n();
  const effectivePlaceholder = placeholder ?? t("search.placeholder");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(!collapsible);
  const debounced = useDebouncedValue(query, 300);
  const { data, isFetching, isError, error } = useGlobalSearch(query);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasResults =
    !!data && (data.languages.length > 0 || data.concepts.length > 0 || data.categories.length > 0);

  // Press "/" to focus search when not already in an input
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        setExpanded(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function expand() {
    if (collapsible) setExpanded(true);
  }

  function collapseIfIdle() {
    if (!collapsible || query.trim()) return;
    setOpen(false);
    setExpanded(false);
  }

  function handleNavigated() {
    setOpen(false);
    onNavigate?.();
    if (collapsible) {
      setQuery("");
      setExpanded(false);
    }
  }

  useEffect(() => {
    if (expanded && collapsible) inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  function goToFullSearch() {
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    handleNavigated();
  }

  const showIdle = open && !query.trim();
  const showResults = open && debounced.trim().length > 1;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative transition-[width] duration-200 ease-out",
        collapsible && !expanded ? "w-9" : "w-full",
        className,
      )}
    >
      {collapsible && !expanded ? (
        <button
          type="button"
          aria-label="Search"
          onClick={expand}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card/80 text-muted-foreground hover:bg-muted hover:text-foreground shadow-xs backdrop-blur-xs transition-colors"
        >
          <Search className="size-4" />
        </button>
      ) : (
        <form role="search" onSubmit={(e) => { e.preventDefault(); goToFullSearch(); }}>
          <div className="relative">
            <button
              type="button"
              aria-label="Search"
              tabIndex={-1}
              className="pointer-events-none absolute left-0 top-1/2 flex -translate-y-1/2 items-center justify-center pl-3.5 text-muted-foreground"
            >
              <Search className={size === "lg" ? "size-5" : "size-4"} />
            </button>
            <input
              ref={inputRef}
              autoFocus={autoFocus}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => { setOpen(true); expand(); }}
              onBlur={() => setTimeout(() => { setOpen(false); collapseIfIdle(); }, 150)}
              placeholder={effectivePlaceholder}
              className={cn(
                "w-full rounded-full border border-input bg-card pl-10 pr-10 text-foreground placeholder:text-muted-foreground shadow-xs transition-shadow",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                size === "lg" ? "h-14 text-base pl-12 pr-14" : "h-9 text-sm",
              )}
            />
            {/* Shortcut hint or loader */}
            {!isFetching && !query && (
              <kbd className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
                /
              </kbd>
            )}
            {isFetching && (
              <Loader2 className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>
        </form>
      )}

      {/* Idle — focus with no query */}
      {showIdle && (
        <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xl animate-scale-in">
          <div className="px-4 pt-3 pb-2">
            <p className="text-xs font-medium text-muted-foreground">Search for</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                { label: "Languages", hint: "e.g. Bengali, Burmese" },
                { label: "Categories", hint: "e.g. Family, Nature" },
                { label: "Words", hint: "any script or language" },
              ].map((item) => (
                <span key={item.label} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground">
                  {item.label}
                  <span className="text-muted-foreground">· {item.hint}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="border-t border-border px-4 py-2.5">
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Try searching</p>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { setQuery(ex); setOpen(true); inputRef.current?.focus(); }}
                  className="rounded-full border border-border bg-background px-3 py-1 text-sm font-medium hover:bg-muted hover:border-accent/40 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {showResults && (
        <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xl animate-scale-in">
          {isError && (
            <div className="flex items-center gap-2.5 border-b border-border bg-danger/5 px-4 py-3 text-xs text-danger">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{error?.message || "Search limit reached. Please try again tomorrow."}</span>
            </div>
          )}

          {!hasResults && !isFetching && !isError && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              {t("search.noMatches")} &ldquo;{debounced}&rdquo;
            </p>
          )}

          {data?.languages && data.languages.length > 0 && (
            <ResultGroup icon={Languages} label={t("common.languages")}>
              {data.languages.slice(0, 3).map((l) => (
                <Link
                  key={l.code}
                  href={`/languages/${l.code}`}
                  onClick={handleNavigated}
                  className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                >
                  <span className="font-medium">{l.name}</span>
                  <span className={cn("text-muted-foreground text-sm", scriptClassFor(l.code))}>{l.nativeName}</span>
                </Link>
              ))}
            </ResultGroup>
          )}

          {data?.categories && data.categories.length > 0 && (
            <ResultGroup icon={Shapes} label={t("common.categories")}>
              {data.categories.slice(0, 3).map((c) => (
                <Link
                  key={c.id}
                  href={`/dictionary/${c.slug}`}
                  onClick={handleNavigated}
                  className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                >
                  <span className="font-medium">{c.name}</span>
                  {typeof c.conceptCount === "number" && (
                    <span className="text-xs text-muted-foreground">{c.conceptCount} words</span>
                  )}
                </Link>
              ))}
            </ResultGroup>
          )}

          {data?.concepts && data.concepts.length > 0 && (
            <ResultGroup icon={BookOpen} label={t("common.concepts")}>
              {data.concepts.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  href={`/dictionary/${c.categorySlug}/${c.id}`}
                  onClick={handleNavigated}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{c.name}</p>
                    {c.translations.length > 0 && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {c.translations.slice(0, 3).map((tr) => (
                          <span key={tr.languageCode} className={cn("mr-2", scriptClassFor(tr.languageCode))}>
                            {tr.text}
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground capitalize">
                    {c.categoryName}
                  </span>
                </Link>
              ))}
            </ResultGroup>
          )}

          {query.trim() && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={goToFullSearch}
              className="flex w-full items-center justify-between border-t border-border px-4 py-3 text-sm font-medium text-accent hover:bg-accent/5 transition-colors"
            >
              <span>See all results for &ldquo;{query.trim()}&rdquo;</span>
              <ArrowRight className="size-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ResultGroup({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border py-1 last:border-b-0">
      <div className="flex items-center gap-1.5 px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </div>
      {children}
    </div>
  );
}
