"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/glass-tooltip";
import { cn } from "@/lib/utils/cn";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

const noopSubscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const active = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[2];
  const ActiveIcon = active.icon;

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card/80 text-foreground hover:bg-muted shadow-xs backdrop-blur-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {mounted ? <ActiveIcon className="size-4" /> : <Sun className="size-4" />}
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          Theme
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        {OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={cn(mounted && theme === option.value ? "bg-muted text-foreground" : "")}
          >
            <option.icon className="size-4" /> {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
