"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  PageHeader, StatCard, SectionCard, StatusBadge,
  SearchBar, FilterSelect, Th, Td, TableRow, EmptyState, FAB
} from "@/components/ui/page-shell";
import { 
  Plane, 
  UtensilsCrossed, 
  Package, 
  Monitor, 
  Truck, 
  Tag, 
  Pencil, 
  Trash2 
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Expense {
  id: string;
  merchant: string;
  category: "Travel" | "Meals" | "Supplies" | "Software" | "Shipping" | "Other";
  date: string;
  amount: number;
  status: "Synced" | "Draft" | "Review";
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const CATEGORY_CONFIG: Record<
  Expense["category"],
  { icon: React.ReactNode; bg: string; text: string }
> = {
  Travel: { icon: <Plane className="w-3.5 h-3.5" />, bg: "bg-blue-50", text: "text-blue-700" },
  Meals: { icon: <UtensilsCrossed className="w-3.5 h-3.5" />, bg: "bg-orange-50", text: "text-orange-700" },
  Supplies: { icon: <Package className="w-3.5 h-3.5" />, bg: "bg-amber-50", text: "text-amber-700" },
  Software: { icon: <Monitor className="w-3.5 h-3.5" />, bg: "bg-violet-50", text: "text-violet-700" },
  Shipping: { icon: <Truck className="w-3.5 h-3.5" />, bg: "bg-cyan-50", text: "text-cyan-700" },
  Other: { icon: <Tag className="w-3.5 h-3.5" />, bg: "bg-zinc-100", text: "text-zinc-600" },
};

const STATUS_CONFIG: Record<
  Expense["status"],
  { dot: string; text: string; bg: string }
> = {
  Synced: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  Draft: { dot: "bg-zinc-400", text: "text-zinc-600", bg: "bg-zinc-100" },
  Review: { dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50" },
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const initialExpenses: Expense[] = [
  { id: "EXP-001", merchant: "Delta Airlines", category: "Travel", date: "Sep 24, 2024", amount: 1240.00, status: "Synced" },
  { id: "EXP-002", merchant: "AWS Cloud Services", category: "Software", date: "Sep 22, 2024", amount: 342.15, status: "Draft" },
  { id: "EXP-003", merchant: "Starbucks Reserve", category: "Meals", date: "Sep 21, 2024", amount: 18.40, status: "Synced" },
  { id: "EXP-004", merchant: "Office Depot", category: "Supplies", date: "Sep 20, 2024", amount: 125.00, status: "Review" },
  { id: "EXP-005", merchant: "Uber Business", category: "Travel", date: "Sep 19, 2024", amount: 45.80, status: "Synced" },
  { id: "EXP-006", merchant: "Figma", category: "Software", date: "Sep 18, 2024", amount: 15.00, status: "Synced" },
  { id: "EXP-007", merchant: "Blue Dart Courier", category: "Shipping", date: "Sep 17, 2024", amount: 210.00, status: "Draft" },
];

function CategoryBadge({ category }: { category: Expense["category"] }) {
  const cfg = CATEGORY_CONFIG[category];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full", cfg.bg, cfg.text)}>
      {cfg.icon}
      {category}
    </span>
  );
}

function StatusPill({ status }: { status: Expense["status"] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full", cfg.bg, cfg.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {status}
    </span>
  );
}

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function Expenses() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExpenses() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:8888/api/payment/list", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const res = await response.json();
        if (res.success && res.expenses) {
          if (res.expenses.length > 0) {
            const mapped: Expense[] = res.expenses.map((e: any) => ({
              id: e.custom_id,
              merchant: e.merchant,
              category: (["Travel", "Meals", "Supplies", "Software", "Shipping", "Other"].includes(e.category) ? e.category : "Other") as Expense["category"],
              date: e.date,
              amount: parseFloat(e.amount) || 0,
              status: e.status || "Synced"
            }));
            setExpenses(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to fetch expenses from API:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchExpenses();
  }, []);

  const filtered = expenses.filter((e) => {
    const q = searchQuery.toLowerCase();
    return (
      (e.merchant.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)) &&
      (selectedCategory === "All" || e.category === selectedCategory) &&
      (selectedStatus === "All" || e.status === selectedStatus)
    );
  });

  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);
  const draftTotal = expenses.filter((e) => e.status === "Draft").reduce((s, e) => s + e.amount, 0);
  const travelTotal = expenses.filter((e) => e.category === "Travel").reduce((s, e) => s + e.amount, 0);

  const handleDelete = (id: string) => setExpenses(expenses.filter((e) => e.id !== id));

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Expenses"
        subtitle="Record and categorize all business expenses for tax and reporting."
        actions={
          <button
            onClick={() => router.push("/expenses/new")}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[17px]">add</span>
            Record Expense
          </button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Spend (Month)" value={`₹${totalSpend.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="payments" trend={{ label: "Combined recorded spend", up: null }} />
        <StatCard label="Pending Sync" value={`₹${draftTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="sync" trend={{ label: `${expenses.filter(e => e.status === "Draft").length} drafts awaiting sync`, up: null }} />
        <StatCard label="Travel Expenses" value={`₹${travelTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="flight" trend={{ label: "Category total", up: null }} />
      </div>

      {/* Table Section */}
      <SectionCard
        title="Expense Log"
        subtitle={loading ? "Loading entries..." : `${filtered.length} entries`}
        noPadding
        actions={
          <div className="flex items-center gap-2">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search expenses..." />
            <FilterSelect value={selectedCategory} onChange={setSelectedCategory} options={["All", "Travel", "Meals", "Supplies", "Software", "Shipping", "Other"]} />
            <FilterSelect value={selectedStatus} onChange={setSelectedStatus} options={["All", "Synced", "Draft", "Review"]} />
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <Th>Merchant / Mileage</Th>
                <Th>Category</Th>
                <Th>Date</Th>
                <Th right>Amount</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((exp) => {
                const catCfg = CATEGORY_CONFIG[exp.category];
                return (
                  <tr key={exp.id} className="hover:bg-zinc-50/70 transition-colors cursor-pointer group">
                    {/* Merchant */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", catCfg.bg, catCfg.text)}>
                          {catCfg.icon}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-zinc-900">{exp.merchant}</p>
                          <p className="text-[11px] text-zinc-500">{exp.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3">
                      <CategoryBadge category={exp.category} />
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3 text-[13px] text-zinc-500">{exp.date}</td>

                    {/* Amount */}
                    <td className="px-5 py-3 text-right font-mono text-[13px] font-bold text-zinc-900 tabular-nums">
                      {fmt(exp.amount)}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">
                      <StatusPill status={exp.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(exp.id); }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <p className="text-[13px] text-zinc-400">No expenses match your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Footer summary */}
          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <span className="text-[12px] text-zinc-400">
                {filtered.length} entr{filtered.length !== 1 ? "ies" : "y"}
              </span>
              <span className="text-[13px] font-semibold text-zinc-900 tabular-nums font-mono">
                Total: {fmt(filtered.reduce((s, e) => s + e.amount, 0))}
              </span>
            </div>
          )}
        </div>
      </SectionCard>

      <FAB label="Record Expense" onClick={() => router.push("/expenses/new")} />
    </div>
  );
}