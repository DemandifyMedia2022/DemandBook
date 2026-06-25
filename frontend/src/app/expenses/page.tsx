"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  PageHeader, StatCard, SectionCard, StatusBadge,
  SearchBar, FilterSelect, Th, Td, TableRow, EmptyState, FAB, Modal, FormField, inputCls, selectCls,
} from "@/components/ui/page-shell";

interface Expense {
  id: string;
  merchant: string;
  category: "Travel" | "Meals" | "Supplies" | "Software" | "Shipping" | "Other";
  date: string;
  amount: number;
  status: "Synced" | "Draft" | "Review";
}

const initialExpenses: Expense[] = [
  { id: "EXP-001", merchant: "Delta Airlines", category: "Travel", date: "Sep 24", amount: 1240.0, status: "Synced" },
  { id: "EXP-002", merchant: "AWS Cloud Services", category: "Software", date: "Sep 22", amount: 342.15, status: "Draft" },
  { id: "EXP-003", merchant: "Starbucks Reserve", category: "Meals", date: "Sep 21", amount: 18.4, status: "Synced" },
  { id: "EXP-004", merchant: "Office Depot", category: "Supplies", date: "Sep 20", amount: 125.0, status: "Review" },
  { id: "EXP-005", merchant: "Uber Business", category: "Travel", date: "Sep 19", amount: 45.8, status: "Synced" },
  { id: "EXP-006", merchant: "Figma", category: "Software", date: "Sep 18", amount: 15.0, status: "Synced" },
  { id: "EXP-007", merchant: "Blue Dart Courier", category: "Shipping", date: "Sep 17", amount: 210.0, status: "Draft" },
];

const categoryIcons: Record<Expense["category"], string> = {
  Travel: "flight",
  Meals: "restaurant",
  Supplies: "inventory_2",
  Software: "computer",
  Shipping: "local_shipping",
  Other: "category",
};

const categoryColors: Record<Expense["category"], string> = {
  Travel: "bg-blue-100 text-blue-700",
  Meals: "bg-orange-100 text-orange-700",
  Supplies: "bg-amber-100 text-amber-700",
  Software: "bg-purple-100 text-purple-700",
  Shipping: "bg-cyan-100 text-cyan-700",
  Other: "bg-slate-100 text-slate-600",
};

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newId, setNewId] = useState("EXP-008");
  const [newMerchant, setNewMerchant] = useState("");
  const [newCategory, setNewCategory] = useState<Expense["category"]>("Other");
  const [newDate, setNewDate] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newStatus, setNewStatus] = useState<Expense["status"]>("Draft");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMerchant || !newAmount) return;
    setExpenses([{ id: newId, merchant: newMerchant, category: newCategory, date: newDate || "Today", amount: parseFloat(newAmount), status: newStatus }, ...expenses]);
    setShowCreateModal(false);
    setNewId("EXP-" + String(expenses.length + 8).padStart(3, "0"));
    setNewMerchant(""); setNewDate(""); setNewAmount(""); setNewCategory("Other"); setNewStatus("Draft");
  };

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

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6">
      <PageHeader
        title="Expenses"
        subtitle="Record and categorize all business expenses for tax and reporting."
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[17px]">add</span>
            Add Expense
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Spend (Month)" value={`₹${totalSpend.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="payments" trend={{ label: "+6.4% vs last month", up: false }} />
        <StatCard label="Pending Sync" value={`₹${draftTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="sync" trend={{ label: `${expenses.filter(e => e.status === "Draft").length} drafts awaiting sync`, up: null }} />
        <StatCard label="Travel Expenses" value={`₹${travelTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="flight" trend={{ label: "Largest category", up: null }} />
      </div>

      <SectionCard
        title="Expense Log"
        subtitle={`${filtered.length} entries`}
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
          <table className="w-full min-w-[680px]">
            <thead>
              <tr>
                <Th>Merchant</Th>
                <Th>Category</Th>
                <Th>Date</Th>
                <Th right>Amount</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((exp) => (
                <TableRow key={exp.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", categoryColors[exp.category])}>
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {categoryIcons[exp.category]}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">{exp.merchant}</p>
                        <p className="text-[11px] text-muted-foreground">{exp.id}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide", categoryColors[exp.category])}>
                      {exp.category}
                    </span>
                  </Td>
                  <Td className="text-muted-foreground">{exp.date}</Td>
                  <Td className="text-right font-bold font-mono text-foreground">
                    ₹{exp.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </Td>
                  <Td><StatusBadge status={exp.status} /></Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded hover:bg-card-container text-muted-foreground hover:text-primary transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button className="p-1.5 rounded hover:bg-card-container text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </Td>
                </TableRow>
              ))}
              {filtered.length === 0 && <EmptyState icon="payments" message="No expenses match the filter." colSpan={6} />}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <FAB label="Add Expense" onClick={() => setShowCreateModal(true)} />

      {showCreateModal && (
        <Modal title="Add Expense" onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreate} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Expense ID">
                <input className={inputCls} value={newId} onChange={(e) => setNewId(e.target.value)} />
              </FormField>
              <FormField label="Status">
                <select className={selectCls} value={newStatus} onChange={(e) => setNewStatus(e.target.value as Expense["status"])}>
                  <option value="Draft">Draft</option>
                  <option value="Review">Review</option>
                  <option value="Synced">Synced</option>
                </select>
              </FormField>
            </div>
            <FormField label="Merchant">
              <input className={inputCls} required placeholder="e.g. IndiGo Airlines" value={newMerchant} onChange={(e) => setNewMerchant(e.target.value)} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Category">
                <select className={selectCls} value={newCategory} onChange={(e) => setNewCategory(e.target.value as Expense["category"])}>
                  {(["Travel", "Meals", "Supplies", "Software", "Shipping", "Other"] as Expense["category"][]).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </FormField>
              <FormField label="Date">
                <input className={inputCls} placeholder="Sep 24" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
              </FormField>
            </div>
            <FormField label="Amount (₹)">
              <input type="number" step="0.01" required placeholder="0.00" className={inputCls} value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
            </FormField>
            <div className="pt-4 border-t border-border flex justify-end gap-3">
              <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm font-semibold text-muted-foreground hover:bg-card-container transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">Add Expense</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
