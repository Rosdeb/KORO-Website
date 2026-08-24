"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRef, useState } from "react";
import { Search, Languages, BookOpen, Shapes, Loader2 } from "lucide-react";
import { useDebouncedValue } from "@/lib/utils/use-debounced-value";
import { useGlobalSearch } from "@/features/search/hooks";
import { cn } from "@/lib/utils/cn";
import { scriptClassFor } from "@/lib/utils/script-font";

interface SearchBarProps {
  size?: "lg" | "md";
  placeholder?: string;
  autoFocus?: boolean;
  onNavigate?: () => void;
  className?: string;
}

export function SearchBar({
  size = "md",
  placeholder = "Search languages, words, and concepts...",
  autoFocus,
  onNavigate,
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debounced = useDebouncedValue(query, 300);
  const { data, isFetching } = useGlobalSearch(debounced);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const hasResults =
    !!data && (data.languages.length > 0 || data.concepts.length > 0 || data.categories.length > 0);

  function goToFullSearch() {
    if (!query.trim()) return;
    setOpen(false);
    onNavigate?.();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          goToFullSearch();
        }}
      >
        <div className="relative">
          <Search
            className={cn(
              "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground",
              size === "lg" ? "size-5" : "size-4",
            )}
          />
          <input
            autoFocus={autoFocus}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder={placeholder}
            className={cn(
              "w-full rounded-full border border-input bg-card pl-11 pr-4 text-foreground placeholder:text-muted-foreground shadow-sm transition-shadow",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
              size === "lg" ? "h-14 text-base pl-12" : "h-11 text-sm",
            )}
          />
          {isFetching && (
            <Loader2 className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
      </form>

      {open && debounced.trim().length > 1 && (
        <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xl animate-scale-in">
          {!hasResults && !isFetching && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No matches for &ldquo;{debounced}&rdquo; yet.
            </p>
          )}

          {data?.languages && data.languages.length > 0 && (
            <ResultGroup icon={Languages} label="Languages">
              {data.languages.slice(0, 4).map((l) => (
                <Link
                  key={l.code}
                  href={`/languages/${l.code}`}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted"
                >
                  <span>{l.name}</span>
                  <span className={cn("text-muted-foreground", scriptClassFor(l.code))}>{l.nativeName}</span>
                </Link>
              ))}
            </ResultGroup>
          )}

          {data?.categories && data.categories.length > 0 && (
            <ResultGroup icon={Shapes} label="Categories">
              {data.categories.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  href={`/dictionary/${c.slug}`}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className="flex items-center px-4 py-2.5 text-sm hover:bg-muted"
                >
                  {c.name}
                </Link>
              ))}
            </ResultGroup>
          )}

          {data?.concepts && data.concepts.length > 0 && (
            <ResultGroup icon={BookOpen} label="Concepts">
              {data.concepts.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  href={`/dictionary/${c.categorySlug}/${c.slug}`}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className="flex items-center px-4 py-2.5 text-sm hover:bg-muted"
                >
                  {c.name}
                </Link>
              ))}
            </ResultGroup>
          )}

          {query.trim() && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={goToFullSearch}
              className="w-full border-t border-border px-4 py-3 text-left text-sm font-medium text-primary hover:bg-primary-50"
            >
              See all results for &ldquo;{query.trim()}&rdquo;
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
    <div className="border-b border-border py-1.5 last:border-b-0">
      <div className="flex items-center gap-1.5 px-4 pb-1 pt-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      {children}
    </div>
  );
}
