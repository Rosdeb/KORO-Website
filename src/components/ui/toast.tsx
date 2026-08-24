"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error";
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, "id">) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((item: Omit<ToastItem, "id">) => {
    setItems((prev) => [...prev, { ...item, id: Date.now() + Math.random() }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right" duration={4000}>
        {children}
        {items.map((item) => (
          <ToastPrimitive.Root
            key={item.id}
            className={cn(
              "flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-lg",
              "data-[state=open]:animate-scale-in data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
            )}
            onOpenChange={(open) => {
              if (!open) setItems((prev) => prev.filter((i) => i.id !== item.id));
            }}
          >
            {item.variant === "success" && <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />}
            {item.variant === "error" && <AlertCircle className="mt-0.5 size-5 shrink-0 text-danger" />}
            <div className="flex-1">
              <ToastPrimitive.Title className="text-sm font-semibold">{item.title}</ToastPrimitive.Title>
              {item.description && (
                <ToastPrimitive.Description className="mt-0.5 text-sm text-muted-foreground">
                  {item.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close className="text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex w-full max-w-sm flex-col gap-2 p-4 outline-none sm:bottom-4 sm:right-4" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
