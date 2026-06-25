"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ActionItem {
  title: string;
  description: string;
  href: string;
  icon: string;
  iconBg: string;
}

const actions: ActionItem[] = [
  {
    title: "Create Invoice",
    description: "Issue a new billing statement",
    href: "/invoices",
    icon: "description",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    title: "Record Expense",
    description: "Log outgoing business costs",
    href: "/expenses",
    icon: "payments",
    iconBg: "bg-error-container/20 text-error",
  },
  {
    title: "Add Customer",
    description: "Register client profile details",
    href: "/customers",
    icon: "person_add",
    iconBg: "bg-secondary-container/20 text-secondary",
  },
  {
    title: "Export Tax Filing",
    description: "Download monthly GSTR reports",
    href: "/tax-reports",
    icon: "download",
    iconBg: "bg-surface-container-highest text-on-surface-variant",
  },
];

export function QuickActions() {
  return (
    <Card className="hover:shadow-md transition-all">
      <CardHeader>
        <CardTitle className="text-on-surface">Quick Actions</CardTitle>
        <CardDescription className="text-on-surface-variant">Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map((act) => (
          <a
            key={act.title}
            href={act.href}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container transition-colors group cursor-pointer border border-outline-variant/20"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${act.iconBg} flex items-center justify-center`}>
                <span className="material-symbols-outlined text-[20px]">{act.icon}</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-xs text-on-surface group-hover:text-primary transition-colors">
                  {act.title}
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  {act.description}
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </a>
        ))}
      </CardContent>
    </Card>
  );
}
