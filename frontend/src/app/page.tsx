"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { DashboardStats } from "@/components/stats";
import { RevenueChart } from "@/components/revenue-chart";
import { RefundReturnRateChart } from "@/components/refund-return-rate-chart";
import { CategoryRankChart } from "@/components/category-rank-chart";
import { QuickActions } from "@/components/quick-actions";

interface Activity {
  date: string;
  type: string;
  number: string;
  partner: string;
  status: "Paid" | "Processed" | "Overdue" | "Draft";
  amount: number;
}

const initialActivities: Activity[] = [
  {
    date: "Oct 24, 2023",
    type: "Invoice",
    number: "#INV-2023-084",
    partner: "Acme Corporation",
    status: "Paid",
    amount: 1240.0,
  },
  {
    date: "Oct 23, 2023",
    type: "Payment",
    number: "#PAY-00421",
    partner: "Stellar Dynamics",
    status: "Processed",
    amount: 500.0,
  },
  {
    date: "Oct 22, 2023",
    type: "Invoice",
    number: "#INV-2023-083",
    partner: "Cyberdyne Systems",
    status: "Overdue",
    amount: 3812.5,
  },
  {
    date: "Oct 21, 2023",
    type: "Expense",
    number: "#EXP-9921",
    partner: "AWS Cloud Services",
    status: "Draft",
    amount: -245.1,
  },
];

export default function Dashboard() {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredActivities = activities.filter(
    (act) =>
      act.partner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-[1440px] mx-auto space-y-8 flex flex-col min-h-[calc(100vh-4rem)]">


      {/* Dashboard Block (stats + charts + quick actions) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats />
        <RevenueChart />
        <RefundReturnRateChart />
        <CategoryRankChart />
        <QuickActions />
      </div>

      {/* Recent Activity Section */}
      <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container-low">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Recent Activity
            </h2>
            <p className="text-on-surface-variant text-body-sm">
              Real-time audit log of ledger items
            </p>
          </div>
          <div className="flex gap-4 w-full sm:w-auto items-center">
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Search partner or transaction..."
                className="pl-8 pr-4 py-1.5 border border-outline-variant rounded bg-surface text-body-sm w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface border-b border-outline-variant">
                <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase">
                  Date
                </th>
                <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase">
                  Type
                </th>
                <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase">
                  Number
                </th>
                <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase">
                  Customer / Vendor
                </th>
                <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase">
                  Status
                </th>
                <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase text-right">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredActivities.map((act, index) => (
                <tr
                  key={index}
                  className="hover:bg-slate-50 transition-all duration-300 active:scale-[0.99] cursor-pointer"
                >
                  <td className="px-6 py-3 font-body-sm text-body-sm text-on-surface">
                    {act.date}
                  </td>
                  <td className="px-6 py-3 font-body-sm text-body-sm font-bold text-on-surface">
                    {act.type}
                  </td>
                  <td className="px-6 py-3 font-mono-data text-mono-data text-primary">
                    {act.number}
                  </td>
                  <td className="px-6 py-3 font-body-sm text-body-sm text-on-surface">
                    {act.partner}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                        act.status === "Paid" &&
                        "bg-green-100 text-green-700",
                        act.status === "Processed" &&
                        "bg-slate-100 text-slate-700",
                        act.status === "Overdue" &&
                        "bg-red-100 text-red-700",
                        act.status === "Draft" &&
                        "bg-slate-100 text-slate-700"
                      )}
                    >
                      {act.status}
                    </span>
                  </td>
                  <td
                    className={cn(
                      "px-6 py-3 font-mono-data text-mono-data text-right font-bold",
                      act.amount < 0 ? "text-error" : "text-on-surface"
                    )}
                  >
                    {act.amount < 0
                      ? `($${Math.abs(act.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })})`
                      : `$${act.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}`}
                  </td>
                </tr>
              ))}
              {filteredActivities.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-on-surface-variant font-body-sm"
                  >
                    No activity logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
