"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// PageHeader
// ─────────────────────────────────────────────────────────────────────────────
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="font-display-lg text-display-lg text-foreground">{title}</h2>
        {subtitle && <p className="text-muted-foreground font-body-lg">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StatCard
// ─────────────────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  iconColor?: string;
  trend?: { label: string; up?: boolean | null };
}

export function StatCard({ label, value, icon, iconColor = "text-primary", trend }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10", iconColor === "text-primary" ? "bg-primary/10" : "bg-destructive/10")}>
          <span
            className={cn("material-symbols-outlined text-[20px]", iconColor === "text-primary" ? "text-primary" : "text-destructive")}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>
      </div>
      <p className="text-2xl font-extrabold text-foreground tracking-tight">{value}</p>
      {trend && (
        <div
          className={cn(
            "flex items-center gap-1 text-[11px] font-semibold",
            trend.up === true && "text-green-600",
            trend.up === false && "text-destructive",
            trend.up === null && "text-muted-foreground"
          )}
        >
          {trend.up === true && (
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
          )}
          {trend.up === false && (
            <span className="material-symbols-outlined text-[14px]">trending_down</span>
          )}
          {trend.up === null && (
            <span className="material-symbols-outlined text-[14px]">warning</span>
          )}
          <span>{trend.label}</span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SectionCard
// ─────────────────────────────────────────────────────────────────────────────
export function SectionCard({
  title,
  subtitle,
  actions,
  children,
  className,
  noPadding,
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl shadow-sm overflow-hidden",
        className
      )}
    >
      {(title || actions) && (
        <div className="px-5 py-3.5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30">
          <div>
            {title && <p className="font-bold text-sm text-foreground">{title}</p>}
            {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      <div className={cn(!noPadding && "p-5")}>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StatusBadge
// ─────────────────────────────────────────────────────────────────────────────
const statusMap: Record<string, string> = {
  paid: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  active: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  "in stock": "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  synced: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  filed: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  approved: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  "out of stock": "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  "low stock": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  review: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  partial: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  sent: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  processed: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  draft: "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400",
  inactive: "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400",
  "not filed": "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = statusMap[status.toLowerCase()] ?? "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400";
  return (
    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide whitespace-nowrap", cls)}>
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SearchBar
// ─────────────────────────────────────────────────────────────────────────────
export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[17px]">
        search
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 pr-3 py-1.5 border border-border rounded-lg bg-background text-sm w-full sm:w-56 focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/50"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FilterSelect
// ─────────────────────────────────────────────────────────────────────────────
export function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-background border border-border px-2.5 py-1.5 rounded-lg text-muted-foreground text-xs font-semibold cursor-pointer outline-none focus:ring-1 focus:ring-primary"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TableHeader / TableCell
// ─────────────────────────────────────────────────────────────────────────────
export function Th({ children, right }: { children?: ReactNode; right?: boolean }) {
  return (
    <th
      className={cn(
        "px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/20 border-b border-border",
        right && "text-right"
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-5 py-3 text-sm text-foreground", className)}>{children}</td>
  );
}

export function TableRow({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "border-b border-border transition-colors",
        onClick && "cursor-pointer hover:bg-muted/50"
      )}
    >
      {children}
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EmptyState
// ─────────────────────────────────────────────────────────────────────────────
export function EmptyState({
  icon = "inbox",
  message = "No results found.",
  colSpan = 6,
}: {
  icon?: string;
  message?: string;
  colSpan?: number;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-16 text-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <span className="material-symbols-outlined text-[40px] opacity-30">{icon}</span>
          <p className="text-sm font-semibold">{message}</p>
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FAB — Floating Action Button
// ─────────────────────────────────────────────────────────────────────────────
export function FAB({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-50 bg-primary text-primary-foreground h-14 px-5 rounded-full shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all group font-bold text-sm"
    >
      <span className="material-symbols-outlined text-[22px]">add</span>
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal Shell
// ─────────────────────────────────────────────────────────────────────────────
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-accent hover:text-accent-foreground transition-colors text-muted-foreground"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FormField
// ─────────────────────────────────────────────────────────────────────────────
export function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

export const inputCls =
  "w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-foreground bg-background placeholder:text-muted-foreground/50";

export const selectCls =
  "w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-foreground bg-background cursor-pointer";
