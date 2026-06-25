"use client";

import { useState } from "react";
import { FavoriteReport, FavoriteReports } from "@/components/reports-analytics/favorite-reports";
import { SparklineTrends } from "@/components/reports-analytics/sparkline-trends";
import { ReportCatalog } from "@/components/reports-analytics/report-catalog";
import { GeneratedReport, RecentReportsTable } from "@/components/reports-analytics/recent-reports-table";

const initialFavorites: FavoriteReport[] = [
  {
    id: "fav-1",
    name: "Profit and Loss",
    category: "Financial Overview",
    icon: "analytics",
    colorClass: "text-secondary",
  },
  {
    id: "fav-2",
    name: "Inventory Valuation",
    category: "Stock Summary",
    icon: "inventory",
    colorClass: "text-tertiary",
  },
  {
    id: "fav-3",
    name: "Sales by Customer",
    category: "Revenue Distribution",
    icon: "group",
    colorClass: "text-secondary",
  },
];

const initialGenerated: GeneratedReport[] = [
  {
    name: "Profit and Loss Q3",
    dateRange: "Jul 01, 2023 - Sep 30, 2023",
    generatedBy: "Alex Sterling",
    status: "Ready",
    iconBg: "bg-primary-dim",
    iconColor: "text-primary",
    icon: "description",
  },
  {
    name: "Monthly Inventory Audit",
    dateRange: "Oct 01, 2023 - Oct 31, 2023",
    generatedBy: "Alex Sterling",
    status: "Ready",
    iconBg: "bg-secondary-dim",
    iconColor: "text-secondary",
    icon: "inventory",
  },
  {
    name: "Annual Tax Projection",
    dateRange: "Apr 01, 2023 - Mar 31, 2024",
    generatedBy: "System Generated",
    status: "Draft",
    iconBg: "bg-tertiary-fixed-dim",
    iconColor: "text-tertiary",
    icon: "assessment",
  },
];

export default function ReportsAnalytics() {
  const [favorites] = useState<FavoriteReport[]>(initialFavorites);
  const [generated, setGenerated] = useState<GeneratedReport[]>(initialGenerated);
  const [timePeriod, setTimePeriod] = useState("This Quarter");

  const handleCreateReport = () => {
    const name = prompt("Enter Custom Report Name:");
    if (!name) return;
    const newRep: GeneratedReport = {
      name,
      dateRange: "Oct 01, 2023 - Oct 25, 2023",
      generatedBy: "Alex Sterling",
      status: "Ready",
      iconBg: "bg-primary-dim",
      iconColor: "text-primary",
      icon: "analytics",
    };
    setGenerated([newRep, ...generated]);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Header Row */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="flex text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
            <span>Organization</span>
            <span className="mx-2">/</span>
            <span className="text-primary font-bold">Reports</span>
          </nav>
          <h2 className="font-headline-lg text-headline-lg text-foreground">
            Reports &amp; Analytics
          </h2>
          <p className="text-muted-foreground mt-1 text-body-md">
            Real-time financial insights and deep-dive operational metrics.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-card-container px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-muted-foreground">
            <span className="material-symbols-outlined text-sm">calendar_month</span>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="bg-transparent border-none text-xs font-bold focus:ring-0 p-0 cursor-pointer outline-none"
            >
              <option value="This Month">This Month</option>
              <option value="This Quarter">This Quarter</option>
              <option value="Financial Year">Financial Year</option>
            </select>
          </div>
          <button
            onClick={handleCreateReport}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 hover:shadow-lg transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Create Custom Report
          </button>
        </div>
      </section>

      {/* Favorites & Trends (Bento Grid) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FavoriteReports favorites={favorites} />
        <SparklineTrends />
      </section>

      {/* Report Catalog */}
      <ReportCatalog />

      {/* Recent Generated Reports Table */}
      <RecentReportsTable generated={generated} />
    </div>
  );
}

