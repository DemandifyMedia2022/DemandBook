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
        <h2 className="font-display-lg text-display-lg text-on-surface">{title}</h2>
        {subtitle && <p className="text-on-surface-variant font-body-lg">{subtitle}</p>}
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
    <div className="bg-surface border border-outline-variant rounded-xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
          {label}
        </span>
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center bg-primary/8", iconColor === "text-primary" ? "bg-primary/8" : "bg-error/8")}>
          <span
            className={cn("material-symbols-outlined text-[20px]", iconColor)}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>
      </div>
      <p className="text-2xl font-extrabold text-on-surface tracking-tight">{value}</p>
      {trend && (
        <div
          className={cn(
            "flex items-center gap-1 text-[11px] font-semibold",
            trend.up === true && "text-green-600",
            trend.up === false && "text-error",
            trend.up === null && "text-on-surface-variant"
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
        "bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden",
        className
      )}
    >
      {(title || actions) && (
        <div className="px-5 py-3.5 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low">
          <div>
            {title && <p className="font-bold text-sm text-on-surface">{title}</p>}
            {subtitle && <p className="text-[11px] text-on-surface-variant">{subtitle}</p>}
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
  paid: "bg-green-100 text-green-700",
  active: "bg-green-100 text-green-700",
  "in stock": "bg-green-100 text-green-700",
  synced: "bg-green-100 text-green-700",
  filed: "bg-green-100 text-green-700",
  approved: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  "out of stock": "bg-red-100 text-red-700",
  rejected: "bg-red-100 text-red-700",
  "low stock": "bg-amber-100 text-amber-700",
  review: "bg-amber-100 text-amber-700",
  partial: "bg-amber-100 text-amber-700",
  sent: "bg-blue-100 text-blue-700",
  processed: "bg-blue-100 text-blue-700",
  pending: "bg-amber-100 text-amber-700",
  draft: "bg-slate-100 text-slate-600",
  inactive: "bg-slate-100 text-slate-600",
  "not filed": "bg-slate-100 text-slate-600",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = statusMap[status.toLowerCase()] ?? "bg-slate-100 text-slate-600";
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
      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[17px]">
        search
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 pr-3 py-1.5 border border-outline-variant rounded-lg bg-surface text-sm w-full sm:w-56 focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
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
      className="bg-surface border border-outline-variant px-2.5 py-1.5 rounded-lg text-on-surface-variant text-xs font-semibold cursor-pointer outline-none focus:ring-1 focus:ring-primary"
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
        "px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container-low border-b border-outline-variant",
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
    <td className={cn("px-5 py-3 text-sm text-on-surface", className)}>{children}</td>
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
        "border-b border-outline-variant transition-colors",
        onClick && "cursor-pointer hover:bg-surface-container-low"
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
        <div className="flex flex-col items-center gap-2 text-on-surface-variant">
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
      className="fixed bottom-8 right-8 z-50 bg-primary text-on-primary h-14 px-5 rounded-full shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all group font-bold text-sm"
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
      <div className="bg-surface border border-outline-variant rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h2 className="text-base font-bold text-on-surface">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface-container transition-colors text-on-surface-variant"
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
      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

export const inputCls =
  "w-full px-3 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-on-surface bg-surface placeholder:text-on-surface-variant/50";

export const selectCls =
  "w-full px-3 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-on-surface bg-surface cursor-pointer";
