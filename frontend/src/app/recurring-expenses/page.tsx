"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Search,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    ChevronDown,
    CheckCircle2,
    PauseCircle,
    XCircle,
    X,
    RefreshCw,
    CreditCard,
    Pause,
    Play,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Frequency = "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Annually";
type ExpenseStatus = "Active" | "Paused" | "Ended";

interface RecurringExpense {
    id: string;
    name: string;
    vendor: string;
    category: string;
    amount: number;
    frequency: Frequency;
    nextDueDate: string; // ISO string for comparison
    nextDueDateLabel: string; // display string
    startDate: string;
    endDate?: string;
    paymentMethod: string;
    status: ExpenseStatus;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<
    ExpenseStatus,
    { dot: string; text: string; bg: string; icon: React.ReactNode }
> = {
    Active: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", icon: <CheckCircle2 className="w-3 h-3" /> },
    Paused: { dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50", icon: <PauseCircle className="w-3 h-3" /> },
    Ended: { dot: "bg-zinc-400", text: "text-zinc-600", bg: "bg-zinc-100", icon: <XCircle className="w-3 h-3" /> },
};

const FREQ_CONFIG: Record<Frequency, { bg: string; text: string }> = {
    Daily: { bg: "bg-purple-50", text: "text-purple-700" },
    Weekly: { bg: "bg-blue-50", text: "text-blue-700" },
    Monthly: { bg: "bg-indigo-50", text: "text-indigo-700" },
    Quarterly: { bg: "bg-cyan-50", text: "text-cyan-700" },
    Annually: { bg: "bg-zinc-100", text: "text-zinc-600" },
};

const FREQUENCIES: Frequency[] = ["Daily", "Weekly", "Monthly", "Quarterly", "Annually"];
const STATUSES: ExpenseStatus[] = ["Active", "Paused", "Ended"];
const CATEGORIES = ["All", "Rent", "SaaS", "Utilities", "Salaries", "Marketing", "Insurance", "Logistics", "Other"];
const PAYMENT_METHODS = ["Bank Transfer", "Credit Card", "ACH", "Wire", "UPI", "Auto-debit"];

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const today = new Date();
const daysFromNow = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
};
const fmt_date = (d: Date) =>
    d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });

const initialExpenses: RecurringExpense[] = [
    {
        id: "RE-001", name: "Office Rent", vendor: "DLF Properties", category: "Rent",
        amount: 85000, frequency: "Monthly",
        nextDueDate: daysFromNow(2).toISOString(), nextDueDateLabel: fmt_date(daysFromNow(2)),
        startDate: "Jan 01, 2023", paymentMethod: "Bank Transfer", status: "Active",
    },
    {
        id: "RE-002", name: "AWS Cloud", vendor: "Amazon Web Services", category: "SaaS",
        amount: 12400, frequency: "Monthly",
        nextDueDate: daysFromNow(8).toISOString(), nextDueDateLabel: fmt_date(daysFromNow(8)),
        startDate: "Mar 15, 2022", paymentMethod: "Credit Card", status: "Active",
    },
    {
        id: "RE-003", name: "Electricity Bill", vendor: "MSEDCL", category: "Utilities",
        amount: 9200, frequency: "Monthly",
        nextDueDate: daysFromNow(1).toISOString(), nextDueDateLabel: fmt_date(daysFromNow(1)),
        startDate: "Jan 01, 2023", paymentMethod: "Auto-debit", status: "Active",
    },
    {
        id: "RE-004", name: "LinkedIn Recruiter", vendor: "LinkedIn Corp.", category: "SaaS",
        amount: 32000, frequency: "Quarterly",
        nextDueDate: daysFromNow(22).toISOString(), nextDueDateLabel: fmt_date(daysFromNow(22)),
        startDate: "Apr 01, 2023", paymentMethod: "Credit Card", status: "Paused",
    },
    {
        id: "RE-005", name: "Business Insurance", vendor: "HDFC Ergo", category: "Insurance",
        amount: 124000, frequency: "Annually",
        nextDueDate: daysFromNow(45).toISOString(), nextDueDateLabel: fmt_date(daysFromNow(45)),
        startDate: "Jun 01, 2022", paymentMethod: "Wire", status: "Active",
    },
    {
        id: "RE-006", name: "Google Workspace", vendor: "Google LLC", category: "SaaS",
        amount: 4800, frequency: "Monthly",
        nextDueDate: daysFromNow(-3).toISOString(), nextDueDateLabel: fmt_date(daysFromNow(-3)),
        startDate: "Jan 01, 2022", endDate: "Dec 31, 2023", paymentMethod: "Credit Card", status: "Ended",
    },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmt(n: number) {
    return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

// Normalize any frequency to monthly amount for burn calc
function toMonthly(amount: number, freq: Frequency): number {
    switch (freq) {
        case "Daily": return amount * 30;
        case "Weekly": return amount * 4.33;
        case "Monthly": return amount;
        case "Quarterly": return amount / 3;
        case "Annually": return amount / 12;
    }
}

function getDueSeverity(isoDate: string, status: ExpenseStatus): "overdue" | "soon" | "normal" {
    if (status !== "Active") return "normal";
    const diff = (new Date(isoDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "overdue";
    if (diff <= 3) return "soon";
    return "normal";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function StatCard({ label, value, delta, sub }: { label: string; value: string; delta?: number; sub?: string }) {
    const positive = delta !== undefined && delta >= 0;
    return (
        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 flex flex-col gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-zinc-500">{label}</span>
                {delta !== undefined && (
                    <span className={cn(
                        "inline-flex items-center gap-0.5 text-[12px] font-medium px-1.5 py-0.5 rounded-full",
                        positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                    )}>
                        {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(delta)}%
                    </span>
                )}
            </div>
            <span className="text-[26px] font-semibold text-zinc-900 tabular-nums tracking-tight">{value}</span>
            {sub && <span className="text-[12px] text-zinc-400">{sub}</span>}
        </div>
    );
}

function StatusPill({ status }: { status: ExpenseStatus }) {
    const cfg = STATUS_CONFIG[status];
    return (
        <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full", cfg.bg, cfg.text)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
            {status}
        </span>
    );
}

function FreqBadge({ freq }: { freq: Frequency }) {
    const cfg = FREQ_CONFIG[freq];
    return (
        <span className={cn("inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md", cfg.bg, cfg.text)}>
            {freq}
        </span>
    );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
const FIELD = "w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 transition-colors text-zinc-800 placeholder:text-zinc-400";
const SELECT = cn(FIELD, "appearance-none cursor-pointer");

function CreateExpenseModal({
    onClose,
    onAdd,
}: {
    onClose: () => void;
    onAdd: (e: RecurringExpense) => void;
}) {
    const [name, setName] = useState("");
    const [vendor, setVendor] = useState("");
    const [category, setCategory] = useState("SaaS");
    const [amount, setAmount] = useState("");
    const [frequency, setFrequency] = useState<Frequency>("Monthly");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Credit Card");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !amount) return;
        const nextDue = daysFromNow(frequency === "Monthly" ? 30 : frequency === "Weekly" ? 7 : frequency === "Annually" ? 365 : 14);
        onAdd({
            id: `RE-${String(Math.floor(Math.random() * 900) + 100)}`,
            name, vendor, category,
            amount: parseFloat(amount),
            frequency,
            nextDueDate: nextDue.toISOString(),
            nextDueDateLabel: fmt_date(nextDue),
            startDate: startDate || fmt_date(today),
            endDate: endDate || undefined,
            paymentMethod,
            status: "Active",
        });
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-[460px] overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                    <div>
                        <h3 className="text-[15px] font-semibold text-zinc-900">Add Recurring Expense</h3>
                        <p className="text-[12px] text-zinc-500 mt-0.5">Set up a new repeating expense</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Expense Name</label>
                        <input required placeholder="e.g. AWS Cloud Hosting" className={FIELD} value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Vendor</label>
                            <input placeholder="e.g. Amazon" className={FIELD} value={vendor} onChange={(e) => setVendor(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Category</label>
                            <select className={SELECT} value={category} onChange={(e) => setCategory(e.target.value)}>
                                {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Amount (₹)</label>
                            <input type="number" step="0.01" min={0} required placeholder="0.00" className={FIELD} value={amount} onChange={(e) => setAmount(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Frequency</label>
                            <select className={SELECT} value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)}>
                                {FREQUENCIES.map((f) => <option key={f}>{f}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Start Date</label>
                            <input type="date" className={FIELD} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">End Date <span className="normal-case font-normal text-zinc-400">(optional)</span></label>
                            <input type="date" className={FIELD} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Payment Method</label>
                        <select className={SELECT} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                            {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                        </select>
                    </div>

                    <div className="pt-2 flex items-center gap-2.5">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-[13px] font-medium text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-2.5 text-[13px] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors shadow-sm">Add Expense</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function RecurringExpenses() {
    const router = useRouter();
    const [expenses, setExpenses] = useState<RecurringExpense[]>(initialExpenses);
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

                const response = await fetch("http://localhost:8888/api/recurring-expenses", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                const res = await response.json();
                if (res.success && res.recurringExpenses) {
                    // If backend table is empty, we can still fall back to mock data or empty array
                    if (res.recurringExpenses.length > 0) {
                        const mapped: RecurringExpense[] = res.recurringExpenses.map((e: any) => {
                            const details = e.other_details || {};
                            return {
                                id: `RE-${String(e.id).padStart(3, '0')}`,
                                dbId: e.id,
                                name: e.merchant || "Unnamed Profile",
                                vendor: details.vendor_name || details.vendor || "—",
                                category: e.category || "Other",
                                amount: parseFloat(e.amount) || 0,
                                frequency: e.frequency || "Monthly",
                                nextDueDate: e.next_date,
                                nextDueDateLabel: new Date(e.next_date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
                                startDate: details.start_date || "—",
                                endDate: details.ends_on || undefined,
                                paymentMethod: details.paid_through || "—",
                                status: e.is_active ? "Active" : (details.never_expires ? "Paused" : "Ended"),
                            };
                        });
                        setExpenses(mapped);
                    } else {
                        // DB is empty, start fresh empty
                        setExpenses([]);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch recurring expenses from API:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchExpenses();
    }, []);

    const filtered = expenses.filter((e) => {
        const q = searchQuery.toLowerCase();
        return (
            (e.name.toLowerCase().includes(q) || e.vendor.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)) &&
            (selectedCategory === "All" || e.category === selectedCategory) &&
            (selectedStatus === "All" || e.status === selectedStatus)
        );
    });

    const activeExpenses = expenses.filter((e) => e.status === "Active");
    const monthlyBurn = activeExpenses.reduce((s, e) => s + toMonthly(e.amount, e.frequency), 0);
    const activeCount = activeExpenses.length;
    const dueThisWeek = activeExpenses.filter((e) => {
        const diff = (new Date(e.nextDueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
    }).length;

    const toggleStatus = async (id: string) => {
        const item = expenses.find(e => e.id === id);
        if (!item) return;
        const newStatus = item.status === "Active" ? "Paused" : "Active";
        const isActive = newStatus === "Active";

        try {
            const token = localStorage.getItem("token");
            const dbId = (item as any).dbId;
            if (!dbId) return;

            const response = await fetch(`http://localhost:8888/api/recurring-expenses/${dbId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    merchant: item.name,
                    category: item.category,
                    amount: item.amount,
                    frequency: item.frequency,
                    next_date: item.nextDueDate,
                    is_active: isActive,
                    other_details: {
                        vendor_name: item.vendor,
                        start_date: item.startDate,
                        ends_on: item.endDate,
                        paid_through: item.paymentMethod
                    }
                })
            });
            const res = await response.json();
            if (res.success) {
                setExpenses(expenses.map((e) =>
                    e.id === id ? { ...e, status: newStatus } : e
                ));
            } else {
                alert(res.message || "Failed to update status");
            }
        } catch (err) {
            console.error("Failed to toggle status:", err);
            alert("Error updating status");
        }
    };

    const filteredMonthlyBurn = filtered
        .filter((e) => e.status === "Active")
        .reduce((s, e) => s + toMonthly(e.amount, e.frequency), 0);

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
            <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">

                {/* Page header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">Recurring Expenses</h1>
                        <p className="text-[13px] text-zinc-500 mt-0.5">Track and manage all your repeating costs in one place.</p>
                    </div>
                    <button
                        onClick={() => router.push("/recurring-expenses/new")}
                        className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Expense
                    </button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        label="Monthly Burn"
                        value={fmt(Math.round(monthlyBurn))}
                        delta={6.4}
                        sub="Across all active expenses"
                    />
                    <StatCard
                        label="Active Subscriptions"
                        value={String(activeCount)}
                        sub={`${expenses.filter((e) => e.status === "Paused").length} paused`}
                    />
                    <StatCard
                        label="Due This Week"
                        value={String(dueThisWeek)}
                        delta={dueThisWeek > 0 ? -dueThisWeek * 5 : undefined}
                        sub="Upcoming payments in 7 days"
                    />
                </div>

                {/* Table card */}
                <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

                    {/* Toolbar */}
                    <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <h2 className="text-[14px] font-semibold text-zinc-900">Expense Register</h2>
                            <p className="text-[12px] text-zinc-500">{filtered.length} expense{filtered.length !== 1 ? "s" : ""}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="relative w-52">
                                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search expenses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
                                />
                            </div>
                            <div className="relative">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer"
                                >
                                    {CATEGORIES.map((c) => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer"
                                >
                                    <option value="All">All Status</option>
                                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-zinc-100">
                                {[
                                    ["Expense", ""],
                                    ["Category", ""],
                                    ["Frequency", ""],
                                    ["Next Due", ""],
                                    ["Amount", "text-right"],
                                    ["Status", ""],
                                    ["", ""],
                                ].map(([h, cls], i) => (
                                    <th key={i} className={cn("px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide", cls)}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filtered.map((expense) => {
                                const severity = getDueSeverity(expense.nextDueDate, expense.status);
                                return (
                                    <tr
                                        key={expense.id}
                                        className={cn(
                                            "transition-colors cursor-pointer group",
                                            severity === "soon" ? "bg-amber-50/40 hover:bg-amber-50/70" :
                                                severity === "overdue" ? "bg-red-50/30 hover:bg-red-50/60" :
                                                    "hover:bg-zinc-50/70"
                                        )}
                                    >
                                        {/* Expense name + vendor */}
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                                                    <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-medium text-zinc-900">{expense.name}</p>
                                                    <p className="text-[12px] text-zinc-400">{expense.vendor || "—"}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="px-6 py-3 text-[13px] text-zinc-500">{expense.category}</td>

                                        {/* Frequency */}
                                        <td className="px-6 py-3">
                                            <FreqBadge freq={expense.frequency} />
                                        </td>

                                        {/* Next due */}
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-1.5">
                                                {severity === "overdue" && (
                                                    <span className="text-[12px] font-semibold text-red-600">{expense.nextDueDateLabel}</span>
                                                )}
                                                {severity === "soon" && (
                                                    <span className="text-[12px] font-semibold text-amber-600">{expense.nextDueDateLabel}</span>
                                                )}
                                                {severity === "normal" && (
                                                    <span className="text-[13px] text-zinc-500">{expense.nextDueDateLabel}</span>
                                                )}
                                                {severity === "overdue" && (
                                                    <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-full">Overdue</span>
                                                )}
                                                {severity === "soon" && (
                                                    <span className="text-[10px] font-bold text-white bg-amber-400 px-1.5 py-0.5 rounded-full">Soon</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Amount */}
                                        <td className="px-6 py-3 text-right font-mono text-[13px] font-semibold text-zinc-900 tabular-nums">
                                            {fmt(expense.amount)}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-3">
                                            <StatusPill status={expense.status} />
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {expense.status !== "Ended" && (
                                                    <button
                                                        onClick={() => toggleStatus(expense.id)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium text-[#5B5FEF] border border-[#5B5FEF]/20 bg-[#5B5FEF]/5 rounded-lg hover:bg-[#5B5FEF]/10 transition-colors whitespace-nowrap"
                                                    >
                                                        {expense.status === "Active"
                                                            ? <><Pause className="w-3 h-3" /> Pause</>
                                                            : <><Play className="w-3 h-3" /> Resume</>
                                                        }
                                                    </button>
                                                )}
                                                <button className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <RefreshCw className="w-6 h-6 text-zinc-200" />
                                            <p className="text-[13px] text-zinc-400">No recurring expenses match your filters.</p>
                                            <button
                                                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setSelectedStatus("All"); }}
                                                className="text-[12px] text-[#5B5FEF] hover:underline mt-1"
                                            >
                                                Clear filters
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Footer */}
                    {filtered.length > 0 && (
                        <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                            <span className="text-[12px] text-zinc-400">
                                {filtered.length} expense{filtered.length !== 1 ? "s" : ""}
                            </span>
                            <span className="text-[13px] font-semibold text-zinc-900 tabular-nums font-mono">
                                Monthly burn: {fmt(Math.round(filteredMonthlyBurn))}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Loading state rendering */}
            {loading && (
                <div className="fixed inset-0 bg-[#FAFAFA]/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="w-6 h-6 text-zinc-500 animate-spin" />
                        <p className="text-[13px] text-zinc-500">Loading...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
