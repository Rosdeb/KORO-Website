import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 bg-muted/30 px-6 py-10 text-center transition-colors",
        className,
      )}
    >
      {Icon && (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-6" />
        </div>
      )}
      <div className="flex flex-col items-center gap-1">
        <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
        {description && <p className="max-w-xs text-xs sm:text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="mt-1 flex items-center justify-center">{action}</div>}
    </div>
  );
}
