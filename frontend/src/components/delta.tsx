"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type DeltaIconVariant = "default" | "trend" | "arrow";
type DeltaVariant = "default" | "badge";

type DeltaContextValue = {
  value: number;
};

const DeltaContext = React.createContext<DeltaContextValue | null>(null);

function useDeltaValue() {
  const context = React.useContext(DeltaContext);
  if (!context) {
    throw new Error(
      "DeltaIcon and DeltaValue must be used inside a `Delta` component."
    );
  }
  return context.value;
}

function Delta({
  className,
  value,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  value: number;
  variant?: DeltaVariant;
}) {
  return (
    <DeltaContext.Provider value={{ value }}>
      {variant === "badge" ? (
        <Badge
          className={cn(
            "gap-1 border-none font-bold text-xs px-2.5 py-0.5 tabular-nums flex items-center w-fit",
            value > 0
              ? "bg-emerald-500/15 text-emerald-600"
              : value < 0
              ? "bg-rose-500/15 text-rose-600"
              : "bg-slate-500/15 text-slate-600",
            className
          )}
          {...(props as React.ComponentProps<typeof Badge>)}
        />
      ) : (
        <div
          className={cn(
            "inline-flex items-center gap-1 font-semibold text-xs tabular-nums",
            value > 0
              ? "text-emerald-600"
              : value < 0
              ? "text-rose-600"
              : "text-slate-600",
            className
          )}
          {...props}
        />
      )}
    </DeltaContext.Provider>
  );
}

function DeltaIcon({
  variant = "default",
  className,
  ...props
}: React.ComponentProps<"span"> & {
  variant?: DeltaIconVariant;
}) {
  const resolvedValue = useDeltaValue();

  if (!resolvedValue || resolvedValue === 0) {
    return (
      <span
        className={cn("material-symbols-outlined text-[16px]", className)}
        {...props}
      >
        remove
      </span>
    );
  }

  if (resolvedValue > 0) {
    if (variant === "trend") {
      return (
        <span
          className={cn("material-symbols-outlined text-[16px]", className)}
          {...props}
        >
          trending_up
        </span>
      );
    }
    if (variant === "arrow") {
      return (
        <span
          className={cn("material-symbols-outlined text-[16px]", className)}
          {...props}
        >
          arrow_upward
        </span>
      );
    }
    return (
      <span
        className={cn("material-symbols-outlined text-[16px]", className)}
        {...props}
      >
        arrow_drop_up
      </span>
    );
  }

  // resolvedValue < 0
  if (variant === "trend") {
    return (
      <span
        className={cn("material-symbols-outlined text-[16px]", className)}
        {...props}
      >
        trending_down
      </span>
    );
  }
  if (variant === "arrow") {
    return (
      <span
        className={cn("material-symbols-outlined text-[16px]", className)}
        {...props}
      >
        arrow_downward
      </span>
    );
  }
  return (
    <span
      className={cn("material-symbols-outlined text-[16px]", className)}
      {...props}
    >
      arrow_drop_down
    </span>
  );
}

function DeltaValue({
  className,
  precision = 1,
  suffix = "%",
  absolute = true,
  ...props
}: React.ComponentProps<"span"> & {
  precision?: number;
  suffix?: string;
  absolute?: boolean;
}) {
  const resolvedValue = useDeltaValue();
  const formattedValue = (
    absolute ? Math.abs(resolvedValue) : resolvedValue
  ).toFixed(precision);

  return (
    <span className={cn("tabular-nums", className)} {...props}>
      {formattedValue}
      {suffix}
    </span>
  );
}

export { Delta, DeltaIcon, DeltaValue };
