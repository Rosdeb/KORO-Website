import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 font-extrabold tracking-tight", className)}>
      <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 4L12 20L20 4"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M8 11.5H16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </span>
      <span className="text-lg">Koro</span>
    </Link>
  );
}
