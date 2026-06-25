"use client";

import { cn } from "@/lib/utils";

export interface ReconRecord {
  vendor: string;
  gstin: string;
  gstr2b: number;
  purchase: number;
  difference: number;
  status: "Matched" | "Missing in 2B";
}

interface ReconTableProps {
  reconList: ReconRecord[];
}

export function ReconTable({ reconList }: ReconTableProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-border bg-card-container-low flex justify-between items-center">
        <h4 className="font-headline-sm text-headline-sm text-foreground">
          GSTR-2B vs Purchase Register
        </h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-body-md border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-card-container-lowest border-b border-border">
              <th className="px-6 py-3 font-label-md text-label-md text-muted-foreground">
                Vendor Name
              </th>
              <th className="px-6 py-3 font-label-md text-label-md text-muted-foreground text-right">
                GSTR-2B Value
              </th>
              <th className="px-6 py-3 font-label-md text-label-md text-muted-foreground text-right">
                Purchase Value
              </th>
              <th className="px-6 py-3 font-label-md text-label-md text-muted-foreground text-right">
                Difference
              </th>
              <th className="px-6 py-3 font-label-md text-label-md text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card-container-lowest">
            {reconList.map((recon, index) => (
              <tr key={index} className="hover:bg-card-container-low transition-colors">
                <td className="px-6 py-4">
                  <p className="font-semibold text-foreground">{recon.vendor}</p>
                  <p className="text-xs text-muted-foreground font-mono-data">
                    {recon.gstin}
                  </p>
                </td>
                <td className="px-6 py-4 text-right font-mono-data">
                  ₹{recon.gstr2b.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-right font-mono-data">
                  ₹{recon.purchase.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td
                  className={cn(
                    "px-6 py-4 text-right font-mono-data",
                    recon.difference < 0 ? "text-destructive" : "text-green-600"
                  )}
                >
                  ₹{recon.difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                      recon.status === "Matched"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    )}
                  >
                    {recon.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
