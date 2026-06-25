"use client";

import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Delta, DeltaIcon, DeltaValue } from "@/components/delta";

type Stat = {
  label: string;
  value: string;
  delta: number;
  hint: string;
  icon: string;
  iconColor: string;
  iconBg: string;
};

const stats: readonly Stat[] = [
  {
    label: "Total Revenue",
    value: "$124,500.00",
    delta: 12.5,
    hint: "vs last month",
    icon: "trending_up",
    iconColor: "text-primary",
    iconBg: "bg-primary-fixed",
  },
  {
    label: "Total Expenses",
    value: "$82,310.50",
    delta: -4.2,
    hint: "vs last month",
    icon: "trending_down",
    iconColor: "text-error",
    iconBg: "bg-error-container",
  },
  {
    label: "Net Profit",
    value: "$42,189.50",
    delta: 18.2,
    hint: "33.8% Margin",
    icon: "stars",
    iconColor: "text-secondary",
    iconBg: "bg-secondary-fixed",
  },
  {
    label: "Receivables",
    value: "$18,440.00",
    delta: 0,
    hint: "12 invoices pending",
    icon: "hourglass_empty",
    iconColor: "text-on-surface-variant",
    iconBg: "bg-surface-container-high",
  },
] as const;

export function DashboardStats() {
  return (
    <>
      {stats.map((s) => (
        <Card key={s.label} className="hover:shadow-md transition-all cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
              {s.label}
            </CardTitle>
            <div className={`p-1.5 rounded-lg ${s.iconBg} ${s.iconColor} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
            </div>
          </CardHeader>
          <CardContent className="py-2">
            <p className="text-balance font-bold text-2xl tabular-nums tracking-tight text-on-surface">
              {s.value}
            </p>
          </CardContent>
          <CardFooter className="gap-1.5 text-xs pt-1">
            {s.delta !== 0 ? (
              <Delta value={s.delta} variant="badge">
                <DeltaIcon variant="trend" />
                <DeltaValue />
              </Delta>
            ) : (
              <span className="bg-surface-container-highest text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded">
                Pending
              </span>
            )}
            <span className="text-pretty text-on-surface-variant text-[11px] font-medium">{s.hint}</span>
          </CardFooter>
        </Card>
      ))}
    </>
  );
}
