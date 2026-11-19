import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-foreground text-background hover:bg-primary-hover",
        accent: "bg-accent text-accent-foreground hover:bg-accent-hover",
        brand: "bg-accent text-accent-foreground hover:bg-accent-hover",
        outline: "border border-border bg-transparent hover:bg-muted text-foreground",
        ghost: "bg-transparent hover:bg-muted text-foreground",
        subtle: "bg-muted text-foreground hover:bg-border/70",
        danger: "bg-danger text-danger-foreground hover:opacity-90",
        link: "bg-transparent underline-offset-4 hover:underline p-0 h-auto font-medium text-foreground",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-11 px-6 text-base",
        xl: "h-13 px-8 text-lg",
        icon: "h-9 w-9 shrink-0",
        "icon-sm": "h-7 w-7 shrink-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading && <Loader2 className="size-4 animate-spin" />}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
