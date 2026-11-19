"use client";

import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { GlassSurface } from "@/components/ui/glass";
import { cn } from "@/lib/utils/cn";

// ─── Provider (shared open delay) ────────────────────────────────────────────

interface TooltipProviderCtx {
  delayMs: number;
}
const TooltipProviderContext = createContext<TooltipProviderCtx>({ delayMs: 400 });

export interface TooltipProviderProps {
  delayMs?: number;
  children?: ReactNode;
}

export function TooltipProvider({ delayMs = 400, children }: TooltipProviderProps) {
  return (
    <TooltipProviderContext.Provider value={{ delayMs }}>
      {children}
    </TooltipProviderContext.Provider>
  );
}

// ─── Tooltip root ─────────────────────────────────────────────────────────────

interface TooltipCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
}
const TooltipContext = createContext<TooltipCtx>({ open: false, setOpen: () => undefined });

export interface TooltipProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (v: boolean) => void;
  delayMs?: number;
  children?: ReactNode;
}

export function Tooltip({
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  children,
}: TooltipProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const open = controlled !== undefined ? controlled : internal;

  const setOpen = useCallback(
    (v: boolean) => {
      if (controlled === undefined) setInternal(v);
      onOpenChange?.(v);
    },
    [controlled, onOpenChange],
  );

  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-flex">{children}</div>
    </TooltipContext.Provider>
  );
}

// ─── TooltipTrigger ───────────────────────────────────────────────────────────

export interface TooltipTriggerProps extends ComponentProps<"button"> {
  asChild?: boolean;
}

export function TooltipTrigger({
  asChild = false,
  children,
  className,
  ...props
}: TooltipTriggerProps) {
  const { setOpen } = useContext(TooltipContext);
  const { delayMs } = useContext(TooltipProviderContext);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    timer.current = setTimeout(() => setOpen(true), delayMs);
  }, [setOpen, delayMs]);

  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(false);
  }, [setOpen]);

  // Clear any pending open-timer if the trigger unmounts mid-delay.
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  if (asChild) {
    return (
      <span
        className={cn("inline-flex outline-none", className)}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={cn("outline-none", className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── TooltipContent ───────────────────────────────────────────────────────────

export interface TooltipContentProps extends ComponentProps<"div"> {
  tint?: number;
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
}

export function TooltipContent({
  tint = 0.55,
  side = "top",
  sideOffset = 8,
  children,
  className,
  ...props
}: TooltipContentProps) {
  const { open } = useContext(TooltipContext);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) {
      el.style.opacity = "1";
      el.style.scale = "1";
      el.style.pointerEvents = "auto";
    } else {
      el.style.opacity = "0";
      el.style.scale = "0.88";
      el.style.pointerEvents = "none";
    }
  }, [open]);

  const posStyle: React.CSSProperties = {
    position: "absolute",
    zIndex: 50,
    ...(side === "top" && { bottom: `calc(100% + ${sideOffset}px)`, left: "50%", translate: "-50% 0" }),
    ...(side === "bottom" && { top: `calc(100% + ${sideOffset}px)`, left: "50%", translate: "-50% 0" }),
    ...(side === "left" && { right: `calc(100% + ${sideOffset}px)`, top: "50%", translate: "0 -50%" }),
    ...(side === "right" && { left: `calc(100% + ${sideOffset}px)`, top: "50%", translate: "0 -50%" }),
  };

  return (
    <div
      ref={ref}
      role="tooltip"
      style={{
        ...posStyle,
        opacity: 0,
        scale: "0.88",
        pointerEvents: "none",
        transition: "opacity 0.18s, scale 0.18s cubic-bezier(0.22,1.15,0.36,1.06)",
      }}
      className={cn("pointer-events-none select-none", className)}
      {...props}
    >
      <GlassSurface
        tint={tint}
        radius={10}
        className="whitespace-nowrap px-2.5 py-1 text-[11px] font-medium text-foreground dark:text-white border border-border/40 shadow-md backdrop-blur-md"
      >
        {children}
      </GlassSurface>
    </div>
  );
}
