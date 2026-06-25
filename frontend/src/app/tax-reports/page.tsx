"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { TaxComplianceStats } from "@/components/tax-reports/tax-compliance-stats";
import { ReturnFilingStatus } from "@/components/tax-reports/return-filing-status";
import { TaxRate, TaxRatesTable } from "@/components/tax-reports/tax-rates-table";
import { HsnCode, HsnCodesTab } from "@/components/tax-reports/hsn-codes-tab";
import { TdsThreshold, TdsSettingsTab } from "@/components/tax-reports/tds-settings-tab";
import { StatutoryReports } from "@/components/tax-reports/statutory-reports";
import { CreateTaxRateModal } from "@/components/tax-reports/create-tax-rate-modal";

const initialTaxRates: TaxRate[] = [
  {
    name: "GST @ 18%",
    rate: 18.0,
    type: "Output GST",
    account: "GST Liability Account",
    status: "Active",
  },
  {
    name: "GST @ 12%",
    rate: 12.0,
    type: "Output GST",
    account: "GST Liability Account",
    status: "Active",
  },
  {
    name: "GST @ 5%",
    rate: 5.0,
    type: "Output GST",
    account: "GST Liability Account",
    status: "Active",
  },
  {
    name: "Zero Rated",
    rate: 0.0,
    type: "Exempt",
    account: "Sales Account",
    status: "Draft",
  },
];

const initialHsnCodes: HsnCode[] = [
  {
    code: "998311",
    description: "IT Consultancy Services",
    gstRate: "18% GST",
  },
  {
    code: "847130",
    description: "Portable Data Processing Machines",
    gstRate: "12% GST",
  },
];

const initialTdsThresholds: TdsThreshold[] = [
  {
    section: "Section 194J - Professional Services",
    rate: 10,
    threshold: 30000,
    used: 19500,
  },
  {
    section: "Section 194C - Contractors",
    rate: 2,
    threshold: 100000,
    used: 20000,
  },
];

export default function TaxReports() {
  const [activeTab, setActiveTab] = useState<"Tax Rates" | "HSN/SAC" | "TDS">("Tax Rates");
  const [taxRates, setTaxRates] = useState<TaxRate[]>(initialTaxRates);
  const [hsnCodes, setHsnCodes] = useState<HsnCode[]>(initialHsnCodes);
  const [tdsThresholds] = useState<TdsThreshold[]>(initialTdsThresholds);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateTaxRate = (newRate: TaxRate) => {
    setTaxRates([...taxRates, newRate]);
    setShowCreateModal(false);
  };

  const handleAddHsnCode = (newHsn: HsnCode) => {
    setHsnCodes([...hsnCodes, newHsn]);
  };

  return (
    <div className="p-8 max-w-[1440px] mx-auto space-y-8 flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1 text-muted-foreground mb-1">
            <span className="text-body-sm">Settings</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-body-sm font-semibold text-primary">Tax Configuration</span>
          </nav>
          <h2 className="font-headline-md text-headline-md text-foreground">
            GST &amp; Tax Compliance
          </h2>
          <p className="text-body-md text-muted-foreground">
            Manage tax rates, HSN codes, and generate statutory reports.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => alert("Exporting Filing Data...")}
            className="flex items-center gap-1.5 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-card-container transition-colors text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export Filing Data
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow hover:opacity-90 active:scale-95 transition-all text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add New Tax Rate
          </button>
        </div>
      </div>

      {/* High-Density Bento Grid Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TaxComplianceStats />
        <ReturnFilingStatus />
      </div>

      {/* Configuration Tabs */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="flex border-b border-border bg-card-container-low overflow-x-auto no-scrollbar">
          {(["Tax Rates", "HSN/SAC Codes", "TDS Settings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() =>
                setActiveTab(
                  tab === "Tax Rates" ? "Tax Rates" : tab === "HSN/SAC Codes" ? "HSN/SAC" : "TDS"
                )
              }
              className={cn(
                "px-6 py-4 font-semibold whitespace-nowrap text-xs transition-colors",
                (activeTab === "Tax Rates" && tab === "Tax Rates") ||
                  (activeTab === "HSN/SAC" && tab === "HSN/SAC Codes") ||
                  (activeTab === "TDS" && tab === "TDS Settings")
                  ? "border-b-2 border-primary text-primary font-bold bg-white/50"
                  : "text-muted-foreground hover:bg-card-container"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 1: Tax Rates */}
        {activeTab === "Tax Rates" && (
          <TaxRatesTable taxRates={taxRates} />
        )}

        {/* Tab 2: HSN/SAC Codes */}
        {activeTab === "HSN/SAC" && (
          <HsnCodesTab hsnCodes={hsnCodes} onAddHsnCode={handleAddHsnCode} />
        )}

        {/* Tab 3: TDS Settings */}
        {activeTab === "TDS" && (
          <TdsSettingsTab tdsThresholds={tdsThresholds} />
        )}

        <div className="p-4 bg-card-container-lowest border-t border-border flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span>Configured compliance rates apply globally for tax invoices.</span>
        </div>
      </div>

      {/* Statutory Reports Generating Grid */}
      <StatutoryReports />

      {/* Create Tax Rate Modal */}
      {showCreateModal && (
        <CreateTaxRateModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTaxRate}
        />
      )}
    </div>
  );
}

