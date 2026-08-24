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
    <div className={cn("flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-14 text-center", className)}>
      {Icon && (
        <div className="flex size-12 items-center justify-center rounded-full bg-primary-50">
          <Icon className="size-6 text-primary" />
        </div>
      )}
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
