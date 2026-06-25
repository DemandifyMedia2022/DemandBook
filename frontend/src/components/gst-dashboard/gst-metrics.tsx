"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GstMetricCardProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  badgeText: string;
  badgeColorClass: string;
  badgeBgClass: string;
  label: string;
  value: string;
  footer?: ReactNode;
  pulse?: boolean;
}

function GstMetricCard({
  icon,
  iconColor,
  iconBg,
  badgeText,
  badgeColorClass,
  badgeBgClass,
  label,
  value,
  footer,
  pulse = false,
}: GstMetricCardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border p-6 rounded-xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow",
        pulse && "animate-pulse"
      )}
    >
      <div className="flex justify-between items-start">
        <span className={cn("material-symbols-outlined p-2 rounded-lg", iconColor, iconBg)}>
          {icon}
        </span>
        <span className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full", badgeColorClass, badgeBgClass)}>
          {badgeText}
        </span>
      </div>
      <div className="mt-6">
        <p className="text-muted-foreground font-label-md text-label-md uppercase tracking-wider">
          {label}
        </p>
        <h3 className="font-headline-md text-headline-md font-bold mt-1">{value}</h3>
      </div>
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}

export function GSTMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <GstMetricCard
        icon="account_balance_wallet"
        iconColor="text-primary"
        iconBg="bg-secondary"
        badgeText="↑ 12%"
        badgeColorClass="text-red-600"
        badgeBgClass="bg-red-100"
        label="Total Tax Liability"
        value="₹12,45,600"
        footer={
          <div className="h-1.5 w-full bg-card-container rounded-full overflow-hidden">
            <div className="h-full bg-primary w-3/4"></div>
          </div>
        }
      />

      <GstMetricCard
        icon="payments"
        iconColor="text-secondary"
        iconBg="bg-secondary"
        badgeText="↓ 4%"
        badgeColorClass="text-green-600"
        badgeBgClass="bg-green-100"
        label="ITC Available (GSTR-2B)"
        value="₹8,12,300"
        footer={<p className="text-xs text-muted-foreground font-semibold">Matched: 94.2%</p>}
      />

      <GstMetricCard
        icon="description"
        iconColor="text-tertiary"
        iconBg="bg-tertiary-fixed"
        badgeText="Filed"
        badgeColorClass="text-muted-foreground"
        badgeBgClass="bg-slate-100"
        label="GSTR-1 (May 2024)"
        value="ARN: 1234...890"
        footer={<p className="text-xs text-green-600 font-semibold">Filed on: 10 Jun 2024</p>}
      />

      <GstMetricCard
        icon="priority_high"
        iconColor="text-destructive"
        iconBg="bg-destructive/15"
        badgeText="Draft"
        badgeColorClass="text-destructive"
        badgeBgClass="bg-red-100"
        label="GSTR-3B (May 2024)"
        value="Unfiled"
        footer={<p className="text-xs text-destructive font-bold">Due in: 4 Days</p>}
        pulse
      />
    </div>
  );
}
