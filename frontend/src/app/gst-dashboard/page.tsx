"use client";

import { useState } from "react";
import { GSTMetrics } from "@/components/gst-dashboard/gst-metrics";
import { ReconRecord, ReconTable } from "@/components/gst-dashboard/recon-table";
import { TaxBreakdownChart } from "@/components/gst-dashboard/tax-breakdown-chart";
import { UpcomingDeadlines } from "@/components/gst-dashboard/upcoming-deadlines";
import { ExportGst } from "@/components/gst-dashboard/export-gst";
import { SyncStatus } from "@/components/gst-dashboard/sync-status";

const initialRecon: ReconRecord[] = [
  {
    vendor: "Tata Communications Ltd",
    gstin: "27AAA...G1Z1",
    gstr2b: 45200.0,
    purchase: 45200.0,
    difference: 0.0,
    status: "Matched",
  },
  {
    vendor: "Reliance Retail Ltd",
    gstin: "27AAB...A1Z5",
    gstr2b: 12400.0,
    purchase: 15000.0,
    difference: -2600.0,
    status: "Missing in 2B",
  },
  {
    vendor: "AWS India Services",
    gstin: "27AAI...H1Z3",
    gstr2b: 8900.0,
    purchase: 8900.0,
    difference: 0.0,
    status: "Matched",
  },
];

export default function GSTDashboard() {
  const [reconList] = useState<ReconRecord[]>(initialRecon);
  const [period, setPeriod] = useState("April - June Quarter (FY 2023-24)");

  return (
    <div className="p-8 max-w-[1440px] mx-auto space-y-8 flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-display-lg text-display-lg text-foreground">
            GST Dashboard
          </h2>
          <p className="text-muted-foreground font-body-lg">
            Financial Year 2023-24 • {period}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const newQ = prompt("Enter Period (e.g. July - September Quarter):");
              if (newQ) setPeriod(newQ);
            }}
            className="flex items-center gap-1 bg-card border border-border px-4 py-2 rounded-lg hover:bg-card-container-high transition-colors text-xs font-semibold text-muted-foreground"
          >
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            Change Period
          </button>
          <button
            onClick={() => alert("Reconciling GST portal data...")}
            className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            Reconcile Portal
          </button>
        </div>
      </div>

      {/* Bento Grid Metrics */}
      <GSTMetrics />

      {/* Main Dashboard Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Layout (Reconciliation & Chart) */}
        <div className="lg:col-span-2 space-y-6">
          <ReconTable reconList={reconList} />
          <TaxBreakdownChart />
        </div>

        {/* Right Layout (Deadlines & Exports) */}
        <div className="space-y-6">
          <UpcomingDeadlines />
          <ExportGst />
          <SyncStatus />
        </div>
      </div>
    </div>
  );
}

