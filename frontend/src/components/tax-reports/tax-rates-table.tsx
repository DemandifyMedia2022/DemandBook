"use client";

import { cn } from "@/lib/utils";

export interface TaxRate {
  name: string;
  rate: number;
  type: string;
  account: string;
  status: "Active" | "Draft";
}

interface TaxRatesTableProps {
  taxRates: TaxRate[];
}

export function TaxRatesTable({ taxRates }: TaxRatesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse font-body-md min-w-[700px]">
        <thead>
          <tr className="bg-card-container-low border-b border-border">
            <th className="px-6 py-3 font-label-md text-label-md text-muted-foreground uppercase text-xs">
              Tax Name
            </th>
            <th className="px-6 py-3 font-label-md text-label-md text-muted-foreground uppercase text-xs">
              Rate (%)
            </th>
            <th className="px-6 py-3 font-label-md text-label-md text-muted-foreground uppercase text-xs">
              Type
            </th>
            <th className="px-6 py-3 font-label-md text-label-md text-muted-foreground uppercase text-xs">
              Account
            </th>
            <th className="px-6 py-3 font-label-md text-label-md text-muted-foreground uppercase text-xs">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card-container-lowest">
          {taxRates.map((tr, index) => (
            <tr key={index} className="hover:bg-card-container-low transition-colors">
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-bold text-foreground">{tr.name}</span>
                  <span className="text-[11px] text-muted-foreground">Tax configuration</span>
                </div>
              </td>
              <td className="px-6 py-4 font-mono-data text-mono-data font-bold">
                {tr.rate.toFixed(2)}%
              </td>
              <td className="px-6 py-4 text-muted-foreground">{tr.type}</td>
              <td className="px-6 py-4 text-muted-foreground">{tr.account}</td>
              <td className="px-6 py-4">
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase",
                    tr.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-700"
                  )}
                >
                  {tr.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
