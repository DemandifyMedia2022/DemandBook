"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PageHeader, StatCard, SectionCard } from "@/components/ui/page-shell";

export default function ProfitLoss() {
  const [method, setMethod] = useState<"Accrual" | "Cash">("Accrual");
  const [dateRange, setDateRange] = useState("Jan 1, 2024 - Dec 31, 2024");

  // Mocking method toggles slightly changing values for realism
  const revenueScale = method === "Accrual" ? 1.0 : 0.94;
  const expenseScale = method === "Accrual" ? 1.0 : 0.96;

  const productSales = 980000.0 * revenueScale;
  const serviceIncome = 220000.0 * revenueScale;
  const shippingFreight = 15000.0 * revenueScale;
  const totalRevenue = productSales + serviceIncome + shippingFreight;

  const inventoryMaterials = 180000.0 * expenseScale;
  const directLabor = 70000.0 * expenseScale;
  const totalCOGS = inventoryMaterials + directLabor;

  const grossProfit = totalRevenue - totalCOGS;

  const salariesWages = 250000.0 * expenseScale;
  const marketingAdvertising = 45000.0 * expenseScale;
  const rentUtilities = 60000.0 * expenseScale;
  const techSoftware = 18500.0 * expenseScale;
  const taxesLicenses = 12300.0 * expenseScale;
  const totalOpsExpenses = salariesWages + marketingAdvertising + rentUtilities + techSoftware + taxesLicenses;

  const interestIncome = 2500.0 * revenueScale;
  const netProfit = grossProfit - totalOpsExpenses + interestIncome;

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6">
      <PageHeader
        title="Profit & Loss Statement"
        subtitle="Real-time statement of operations and profit margins."
        actions={
          <button
            onClick={() => alert("Downloading PDF...")}
            className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg text-xs font-semibold text-muted-foreground hover:bg-card-container transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export PDF
          </button>
        }
      />

      {/* Filters Bar */}
      <section className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col gap-1">
            <span className="font-label-md text-[10px] text-muted-foreground uppercase tracking-wider">
              Date Range
            </span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-card-container-low border border-border px-3 py-1.5 rounded-lg text-muted-foreground font-body-sm text-body-sm cursor-pointer outline-none"
            >
              <option value="Jan 1, 2024 - Dec 31, 2024">Jan 1, 2024 - Dec 31, 2024</option>
              <option value="Q1 2024">Q1 2024 (Jan - Mar)</option>
              <option value="Q2 2024">Q2 2024 (Apr - Jun)</option>
              <option value="Q3 2024">Q3 2024 (Jul - Sep)</option>
              <option value="Q4 2024">Q4 2024 (Oct - Dec)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-card-container-low p-1 rounded-full border border-border">
          <button
            onClick={() => setMethod("Accrual")}
            className={cn(
              "px-4 py-1.5 rounded-full text-label-md font-label-md text-xs transition-all",
              method === "Accrual"
                ? "bg-white shadow-sm text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Accrual
          </button>
          <button
            onClick={() => setMethod("Cash")}
            className={cn(
              "px-4 py-1.5 rounded-full text-label-md font-label-md text-xs transition-all",
              method === "Cash"
                ? "bg-white shadow-sm text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Cash
          </button>
        </div>
      </section>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
          icon="trending_up"
          trend={{ label: method === "Accrual" ? "+12.4% YoY" : "+9.8% YoY", up: true }}
        />
        <StatCard
          label="Total Expenses"
          value={`₹${(totalCOGS + totalOpsExpenses).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
          icon="trending_down"
          iconColor="text-destructive"
          trend={{ label: "+2.1% vs last year", up: false }}
        />
        <StatCard
          label="Net Profit"
          value={`₹${netProfit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
          icon="account_balance"
          trend={{ label: `${((netProfit / totalRevenue) * 100).toFixed(1)}% margin`, up: true }}
        />
      </div>

      {/* P&L Statement Details */}
      <SectionCard title="Statement of Profit & Loss" subtitle={`${dateRange} · ${method} basis`} noPadding>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body-md min-w-[600px]">
            <thead>
              <tr className="bg-card-container-low text-muted-foreground text-label-md uppercase tracking-widest border-b border-border">
                <th className="px-6 py-3 font-semibold text-xs">Account Category</th>
                <th className="px-6 py-3 font-semibold text-right text-xs">Actual Amount</th>
                <th className="px-6 py-3 font-semibold text-right text-xs">% of Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {/* Income */}
              <tr className="bg-card-container/20">
                <td className="px-6 py-3 font-bold text-foreground">Income (Operating Revenue)</td>
                <td className="px-6 py-3 text-right"></td>
                <td className="px-6 py-3 text-right"></td>
              </tr>
              <tr className="hover:bg-card-container-low transition-all">
                <td className="px-6 py-3 pl-12 text-muted-foreground">Product Sales</td>
                <td className="px-6 py-3 text-right font-mono-data">
                  ${productSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-3 text-right text-muted-foreground text-xs">
                  {((productSales / totalRevenue) * 100).toFixed(1)}%
                </td>
              </tr>
              <tr className="hover:bg-card-container-low transition-all">
                <td className="px-6 py-3 pl-12 text-muted-foreground">Service Income</td>
                <td className="px-6 py-3 text-right font-mono-data">
                  ${serviceIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-3 text-right text-muted-foreground text-xs">
                  {((serviceIncome / totalRevenue) * 100).toFixed(1)}%
                </td>
              </tr>
              <tr className="hover:bg-card-container-low transition-all">
                <td className="px-6 py-3 pl-12 text-muted-foreground">Shipping &amp; Freight</td>
                <td className="px-6 py-3 text-right font-mono-data">
                  ${shippingFreight.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-3 text-right text-muted-foreground text-xs">
                  {((shippingFreight / totalRevenue) * 100).toFixed(1)}%
                </td>
              </tr>
              <tr className="bg-card-container/10 border-t border-border font-bold text-primary">
                <td className="px-6 py-3 pl-6">Total Operating Revenue</td>
                <td className="px-6 py-3 text-right font-mono-data">
                  ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-3 text-right">100.0%</td>
              </tr>

              {/* COGS */}
              <tr className="bg-card-container/20">
                <td className="px-6 py-3 font-bold text-foreground">Cost of Goods Sold (COGS)</td>
                <td className="px-6 py-3 text-right"></td>
                <td className="px-6 py-3 text-right"></td>
              </tr>
              <tr className="hover:bg-card-container-low transition-all">
                <td className="px-6 py-3 pl-12 text-muted-foreground">Inventory Materials</td>
                <td className="px-6 py-3 text-right font-mono-data">
                  (${inventoryMaterials.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                </td>
                <td className="px-6 py-3 text-right text-muted-foreground text-xs">
                  {((inventoryMaterials / totalRevenue) * 100).toFixed(1)}%
                </td>
              </tr>
              <tr className="hover:bg-card-container-low transition-all">
                <td className="px-6 py-3 pl-12 text-muted-foreground">Direct Labor</td>
                <td className="px-6 py-3 text-right font-mono-data">
                  (${directLabor.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                </td>
                <td className="px-6 py-3 text-right text-muted-foreground text-xs">
                  {((directLabor / totalRevenue) * 100).toFixed(1)}%
                </td>
              </tr>
              <tr className="bg-card-container/10 border-t border-border font-bold text-foreground">
                <td className="px-6 py-3 pl-6">Total Cost of Goods Sold</td>
                <td className="px-6 py-3 text-right font-mono-data">
                  (${totalCOGS.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                </td>
                <td className="px-6 py-3 text-right text-xs">
                  {((totalCOGS / totalRevenue) * 100).toFixed(1)}%
                </td>
              </tr>

              {/* Gross Profit */}
              <tr className="bg-primary/5 font-black text-foreground">
                <td className="px-6 py-4 text-base pl-6">GROSS PROFIT</td>
                <td className="px-6 py-4 text-right font-mono-data text-base">
                  ${grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-right text-base">
                  {((grossProfit / totalRevenue) * 100).toFixed(1)}%
                </td>
              </tr>

              {/* Operating Expenses */}
              <tr className="bg-card-container/20">
                <td className="px-6 py-3 font-bold text-foreground">Operating Expenses</td>
                <td className="px-6 py-3 text-right"></td>
                <td className="px-6 py-3 text-right"></td>
              </tr>
              <tr className="hover:bg-card-container-low transition-all">
                <td className="px-6 py-3 pl-12 text-muted-foreground">Salaries and Wages</td>
                <td className="px-6 py-3 text-right font-mono-data">
                  (${salariesWages.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                </td>
                <td className="px-6 py-3 text-right text-muted-foreground text-xs">
                  {((salariesWages / totalRevenue) * 100).toFixed(1)}%
                </td>
              </tr>
              <tr className="hover:bg-card-container-low transition-all">
                <td className="px-6 py-3 pl-12 text-muted-foreground">Marketing &amp; Advertising</td>
                <td className="px-6 py-3 text-right font-mono-data">
                  (${marketingAdvertising.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                </td>
                <td className="px-6 py-3 text-right text-muted-foreground text-xs">
                  {((marketingAdvertising / totalRevenue) * 100).toFixed(1)}%
                </td>
              </tr>
              <tr className="hover:bg-card-container-low transition-all">
                <td className="px-6 py-3 pl-12 text-muted-foreground">Rent and Utilities</td>
                <td className="px-6 py-3 text-right font-mono-data">
                  (${rentUtilities.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                </td>
                <td className="px-6 py-3 text-right text-muted-foreground text-xs">
                  {((rentUtilities / totalRevenue) * 100).toFixed(1)}%
                </td>
              </tr>
              <tr className="hover:bg-card-container-low transition-all">
                <td className="px-6 py-3 pl-12 text-muted-foreground">Technology &amp; Software</td>
                <td className="px-6 py-3 text-right font-mono-data">
                  (${techSoftware.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                </td>
                <td className="px-6 py-3 text-right text-muted-foreground text-xs">
                  {((techSoftware / totalRevenue) * 100).toFixed(1)}%
                </td>
              </tr>
              <tr className="hover:bg-card-container-low transition-all">
                <td className="px-6 py-3 pl-12 text-muted-foreground">Taxes &amp; Licenses</td>
                <td className="px-6 py-3 text-right font-mono-data">
                  (${taxesLicenses.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                </td>
                <td className="px-6 py-3 text-right text-muted-foreground text-xs">
                  {((taxesLicenses / totalRevenue) * 100).toFixed(1)}%
                </td>
              </tr>
              <tr className="bg-card-container/10 border-t border-border font-bold text-foreground">
                <td className="px-6 py-3 pl-6">Total Operating Expenses</td>
                <td className="px-6 py-3 text-right font-mono-data">
                  (${totalOpsExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                </td>
                <td className="px-6 py-3 text-right text-xs">
                  {((totalOpsExpenses / totalRevenue) * 100).toFixed(1)}%
                </td>
              </tr>

              {/* Other Income/Expenses */}
              <tr className="bg-card-container/20">
                <td className="px-6 py-3 font-bold text-foreground">Other Income / (Expenses)</td>
                <td className="px-6 py-3 text-right"></td>
                <td className="px-6 py-3 text-right"></td>
              </tr>
              <tr className="hover:bg-card-container-low transition-all">
                <td className="px-6 py-3 pl-12 text-muted-foreground">Interest Income</td>
                <td className="px-6 py-3 text-right font-mono-data">
                  ${interestIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-3 text-right text-muted-foreground text-xs">
                  {((interestIncome / totalRevenue) * 100).toFixed(1)}%
                </td>
              </tr>

              {/* Net Profit */}
              <tr className="bg-primary text-primary-foreground font-black">
                <td className="px-6 py-5 text-base uppercase tracking-widest pl-6">NET PROFIT</td>
                <td className="px-6 py-5 text-right font-mono-data text-base">
                  ${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-5 text-right text-base">
                  {((netProfit / totalRevenue) * 100).toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-card-container-low text-[10px] text-muted-foreground italic border-t border-border">
          * Report dynamically generated based on method: {method}. All amounts in ₹ INR. Figures are based on selected Accrual or Cash ledger settings and subject to final audit.
        </div>
      </SectionCard>
    </div>
  );
}
