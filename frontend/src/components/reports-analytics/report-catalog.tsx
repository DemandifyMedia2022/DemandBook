"use client";

import { cn } from "@/lib/utils";

export interface CatalogGroup {
  title: string;
  icon: string;
  reports: { name: string; isPro?: boolean }[];
}

export const catalogGroups: CatalogGroup[] = [
  {
    title: "Financial Reports",
    icon: "account_balance",
    reports: [
      { name: "Profit & Loss" },
      { name: "Balance Sheet" },
      { name: "Cash Flow Statement" },
      { name: "Trial Balance" },
    ],
  },
  {
    title: "Sales Reports",
    icon: "shopping_cart",
    reports: [
      { name: "Sales by Customer" },
      { name: "Sales by Item" },
      { name: "Sales Order History" },
      { name: "Customer Balances" },
    ],
  },
  {
    title: "Inventory Reports",
    icon: "inventory_2",
    reports: [
      { name: "Inventory Valuation" },
      { name: "Stock Summary" },
      { name: "Low Stock Alerts" },
      { name: "Inventory Aging", isPro: true },
    ],
  },
  {
    title: "Tax & Accounting",
    icon: "account_tree",
    reports: [
      { name: "GST / VAT Summary" },
      { name: "Account Transactions" },
      { name: "Journal Report" },
    ],
  },
];

export function ReportCatalog() {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">folder_open</span>
        <h3 className="font-headline-md text-headline-md text-foreground font-bold">
          Report Catalog
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {catalogGroups.map((group, idx) => (
          <div
            key={idx}
            className="bg-card rounded-xl shadow-sm border border-border flex flex-col overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-4 bg-card-container-low border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">{group.icon}</span>
                <h4 className="font-bold text-sm text-foreground">{group.title}</h4>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {group.reports.length} Reports
              </span>
            </div>
            <div className="flex-grow">
              <table className="w-full text-left">
                <tbody className="divide-y divide-border/50 bg-card-container-lowest">
                  {group.reports.map((report, rIdx) => (
                    <tr
                      key={rIdx}
                      onClick={() => alert(`Opening ${report.name}...`)}
                      className={cn(
                        "hover:bg-card-container-low transition-colors group cursor-pointer",
                        report.isPro && "opacity-60 cursor-not-allowed"
                      )}
                    >
                      <td className="px-4 py-3 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        {report.name}
                        {report.isPro && (
                          <span className="text-[8px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-bold uppercase">
                            Pro
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {report.isPro ? (
                          <span className="material-symbols-outlined text-xs text-outline">
                            lock
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Downloading ${report.name}...`);
                            }}
                            className="p-1 hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-xs">download</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
