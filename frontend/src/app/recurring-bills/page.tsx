"use client";

import { useState } from "react";
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
    Receipt,
    Pause,
    Play,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Frequency = "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Annually";
type BillStatus = "Active" | "Paused" | "Ended";

interface RecurringBill {
    id: string;
    name: string;
    vendor: string;
    category: string;
    referenceNo?: string;
    amount: number;
    frequency: Frequency;
    nextDueDate: string;
    nextDueDateLabel: string;
    startDate: string;
    endDate?: string;
    paymentTerms: string;
    paymentMethod: string;
    status: BillStatus;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<
    BillStatus,
    { dot: string; text: string; bg: string; icon: React.ReactNode }
> = {
    Active: {
        dot: "bg-emerald-500",
        text: "text-emerald-700",
        bg: "bg-emerald-50",
        icon: <CheckCircle2 className="w-3 h-3" />,
    },
    Paused: {
        dot: "bg-amber-400",
        text: "text-amber-700",
        bg: "bg-amber-50",
        icon: <PauseCircle className="w-3 h-3" />,
    },
    Ended: {
        dot: "bg-zinc-400",
        text: "text-zinc-600",
        bg: "bg-zinc-100",
        icon: <XCircle className="w-3 h-3" />,
    },
};

const FREQ_CONFIG: Record<Frequency, { bg: string; text: string }> = {
    Daily: { bg: "bg-purple-50", text: "text-purple-700" },
    Weekly: { bg: "bg-blue-50", text: "text-blue-700" },
    Monthly: { bg: "bg-indigo-50", text: "text-indigo-700" },
    Quarterly: { bg: "bg-cyan-50", text: "text-cyan-700" },
    Annually: { bg: "bg-zinc-100", text: "text-zinc-600" },
};

const FREQUENCIES: Frequency[] = ["Daily", "Weekly", "Monthly", "Quarterly", "Annually"];
const STATUSES: BillStatus[] = ["Active", "Paused", "Ended"];
const CATEGORIES = [
    "All", "Rent", "Utilities", "Loan EMI", "Subscriptions",
    "Retainer", "Supplier Contract", "Logistics", "Insurance", "Other",
];
const PAYMENT_METHODS = ["Bank Transfer", "Credit Card", "ACH", "Wire", "UPI", "Auto-debit", "Cheque"];
const PAYMENT_TERMS = ["Net 7", "Net 15", "Net 30", "Net 45", "Net 60", "Due on Receipt"];

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

const initialBills: RecurringBill[] = [
    {
        id: "RB-001", name: "Office Lease", vendor: "DLF Properties Ltd.",
        category: "Rent", referenceNo: "LEASE-2023-001",
        amount: 95000, frequency: "Monthly",
        nextDueDate: daysFromNow(2).toISOString(), nextDueDateLabel: fmt_date(daysFromNow(2)),
        startDate: "Jan 01, 2023", paymentTerms: "Due on Receipt",
        paymentMethod: "Bank Transfer", status: "Active",
    },
    {
        id: "RB-002", name: "Internet & Leased Line", vendor: "Tata Communications",
        category: "Utilities", referenceNo: "TCL-98423",
        amount: 18500, frequency: "Monthly",
        nextDueDate: daysFromNow(8).toISOString(), nextDueDateLabel: fmt_date(daysFromNow(8)),
        startDate: "Mar 01, 2022", paymentTerms: "Net 15",
        paymentMethod: "Auto-debit", status: "Active",
    },
    {
        id: "RB-003", name: "Term Loan EMI", vendor: "HDFC Bank",
        category: "Loan EMI", referenceNo: "HL-20230045",
        amount: 142000, frequency: "Monthly",
        nextDueDate: daysFromNow(1).toISOString(), nextDueDateLabel: fmt_date(daysFromNow(1)),
        startDate: "Apr 01, 2023", paymentTerms: "Due on Receipt",
        paymentMethod: "Auto-debit", status: "Active",
    },
    {
        id: "RB-004", name: "Legal Retainer", vendor: "Khaitan & Co.",
        category: "Retainer", referenceNo: "KHT-Q2-2024",
        amount: 75000, frequency: "Quarterly",
        nextDueDate: daysFromNow(18).toISOString(), nextDueDateLabel: fmt_date(daysFromNow(18)),
        startDate: "Jan 01, 2024", paymentTerms: "Net 7",
        paymentMethod: "Wire", status: "Active",
    },
    {
        id: "RB-005", name: "Annual Audit Fee", vendor: "Deloitte India LLP",
        category: "Retainer", referenceNo: "DEL-AUD-2024",
        amount: 380000, frequency: "Annually",
        nextDueDate: daysFromNow(60).toISOString(), nextDueDateLabel: fmt_date(daysFromNow(60)),
        startDate: "Jun 01, 2022", paymentTerms: "Net 30",
        paymentMethod: "Bank Transfer", status: "Paused",
    },
    {
        id: "RB-006", name: "Warehouse Storage", vendor: "Blue Dart Logistics",
        category: "Logistics", referenceNo: "BDL-WH-112",
        amount: 32000, frequency: "Monthly",
        nextDueDate: daysFromNow(-2).toISOString(), nextDueDateLabel: fmt_date(daysFromNow(-2)),
        startDate: "Feb 01, 2022", endDate: "Jan 31, 2024",
        paymentTerms: "Net 15", paymentMethod: "Bank Transfer", status: "Ended",
    },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmt(n: number) {
    return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function toMonthly(amount: number, freq: Frequency): number {
    switch (freq) {
        case "Daily": return amount * 30;
        case "Weekly": return amount * 4.33;
        case "Monthly": return amount;
        case "Quarterly": return amount / 3;
        case "Annually": return amount / 12;
    }
}

function getDueSeverity(isoDate: string, status: BillStatus): "overdue" | "soon" | "normal" {
    if (status !== "Active") return "normal";
    const diff = (new Date(isoDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "overdue";
    if (diff <= 3) return "soon";
    return "normal";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function StatCard({
    label, value, delta, sub,
}: {
    label: string; value: string; delta?: number; sub?: string;
}) {
    const positive = delta !== undefined && delta >= 0;
    return (
        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 flex flex-col gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-zinc-500">{label}</span>
                {delta !== undefined && (
                    <span
                        className={cn(
                            "inline-flex items-center gap-0.5 text-[12px] font-medium px-1.5 py-0.5 rounded-full",
                            positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
                        )}
                    >
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

function StatusPill({ status }: { status: BillStatus }) {
    const cfg = STATUS_CONFIG[status];
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full",
                cfg.bg, cfg.text,
            )}
        >
            <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
            {status}
        </span>
    );
}

function FreqBadge({ freq }: { freq: Frequency }) {
    const cfg = FREQ_CONFIG[freq];
    return (
        <span
            className={cn(
                "inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md",
                cfg.bg, cfg.text,
            )}
        >
            {freq}
        </span>
    );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
const FIELD =
    "w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 transition-colors text-zinc-800 placeholder:text-zinc-400";
const SELECT = cn(FIELD, "appearance-none cursor-pointer");

function CreateBillModal({
    onClose,
    onAdd,
}: {
    onClose: () => void;
    onAdd: (b: RecurringBill) => void;
}) {
    const [name, setName] = useState("");
    const [vendor, setVendor] = useState("");
    const [category, setCategory] = useState("Utilities");
    const [referenceNo, setReferenceNo] = useState("");
    const [amount, setAmount] = useState("");
    const [frequency, setFrequency] = useState<Frequency>("Monthly");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [paymentTerms, setPaymentTerms] = useState("Net 30");
    const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !amount) return;
        const nextDue = daysFromNow(
            frequency === "Monthly" ? 30
                : frequency === "Weekly" ? 7
                    : frequency === "Annually" ? 365
                        : 14,
        );
        onAdd({
            id: `RB-${String(Math.floor(Math.random() * 900) + 100)}`,
            name, vendor, category,
            referenceNo: referenceNo || undefined,
            amount: parseFloat(amount),
            frequency,
            nextDueDate: nextDue.toISOString(),
            nextDueDateLabel: fmt_date(nextDue),
            startDate: startDate || fmt_date(today),
            endDate: endDate || undefined,
            paymentTerms,
            paymentMethod,
            status: "Active",
        });
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                    <div>
                        <h3 className="text-[15px] font-semibold text-zinc-900">Add Recurring Bill</h3>
                        <p className="text-[12px] text-zinc-500 mt-0.5">Set up a new repeating vendor bill</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Bill name */}
                    <div>
                        <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                            Bill Name
                        </label>
                        <input
                            required
                            placeholder="e.g. Office Lease"
                            className={FIELD}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Vendor + Category */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                                Vendor
                            </label>
                            <input
                                placeholder="e.g. HDFC Bank"
                                className={FIELD}
                                value={vendor}
                                onChange={(e) => setVendor(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                                Category
                            </label>
                            <select
                                className={SELECT}
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {CATEGORIES.filter((c) => c !== "All").map((c) => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Reference No */}
                    <div>
                        <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                            Reference / Bill No. <span className="normal-case font-normal text-zinc-400">(optional)</span>
                        </label>
                        <input
                            placeholder="e.g. INV-2024-001"
                            className={FIELD}
                            value={referenceNo}
                            onChange={(e) => setReferenceNo(e.target.value)}
                        />
                    </div>

                    {/* Amount + Frequency */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                                Amount (₹)
                            </label>
                            <input
                                type="number" step="0.01" min={0} required
                                placeholder="0.00"
                                className={FIELD}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                                Frequency
                            </label>
                            <select
                                className={SELECT}
                                value={frequency}
                                onChange={(e) => setFrequency(e.target.value as Frequency)}
                            >
                                {FREQUENCIES.map((f) => <option key={f}>{f}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Payment Terms + Method */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                                Payment Terms
                            </label>
                            <select
                                className={SELECT}
                                value={paymentTerms}
                                onChange={(e) => setPaymentTerms(e.target.value)}
                            >
                                {PAYMENT_TERMS.map((t) => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                                Payment Method
                            </label>
                            <select
                                className={SELECT}
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Start + End Date */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                                Start Date
                            </label>
                            <input
                                type="date"
                                className={FIELD}
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                                End Date{" "}
                                <span className="normal-case font-normal text-zinc-400">(optional)</span>
                            </label>
                            <input
                                type="date"
                                className={FIELD}
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 text-[13px] font-medium text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 text-[13px] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors shadow-sm"
                        >
                            Add Bill
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function RecurringBills() {
    const [bills, setBills] = useState<RecurringBill[]>(initialBills);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [showModal, setShowModal] = useState(false);

    const filtered = bills.filter((b) => {
        const q = searchQuery.toLowerCase();
        return (
            (
                b.name.toLowerCase().includes(q) ||
                b.vendor.toLowerCase().includes(q) ||
                b.id.toLowerCase().includes(q) ||
                (b.referenceNo?.toLowerCase().includes(q) ?? false)
            ) &&
            (selectedCategory === "All" || b.category === selectedCategory) &&
            (selectedStatus === "All" || b.status === selectedStatus)
        );
    });

    const activeBills = bills.filter((b) => b.status === "Active");
    const monthlyPayable = activeBills.reduce((s, b) => s + toMonthly(b.amount, b.frequency), 0);
    const activeCount = activeBills.length;
    const dueThisWeek = activeBills.filter((b) => {
        const diff = (new Date(b.nextDueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
    }).length;
    const overdueCount = activeBills.filter((b) => {
        const diff = (new Date(b.nextDueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diff < 0;
    }).length;

    const filteredMonthlyPayable = filtered
        .filter((b) => b.status === "Active")
        .reduce((s, b) => s + toMonthly(b.amount, b.frequency), 0);

    const toggleStatus = (id: string) => {
        setBills(
            bills.map((b) =>
                b.id === id
                    ? {
                        ...b,
                        status:
                            b.status === "Active" ? "Paused"
                                : b.status === "Paused" ? "Active"
                                    : b.status,
                    }
                    : b,
            ),
        );
    };

    const handleAdd = (bill: RecurringBill) => {
        setBills([bill, ...bills]);
        setShowModal(false);
    };

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
            <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">

                {/* Page header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">Recurring Bills</h1>
                        <p className="text-[13px] text-zinc-500 mt-0.5">
                            Manage all repeating vendor bills and payables in one place.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Bill
                    </button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <StatCard
                        label="Monthly Payable"
                        value={fmt(Math.round(monthlyPayable))}
                        delta={4.2}
                        sub="Across all active bills"
                    />
                    <StatCard
                        label="Active Bills"
                        value={String(activeCount)}
                        sub={`${bills.filter((b) => b.status === "Paused").length} paused`}
                    />
                    <StatCard
                        label="Due This Week"
                        value={String(dueThisWeek)}
                        sub="Upcoming payments in 7 days"
                    />
                    <StatCard
                        label="Overdue"
                        value={String(overdueCount)}
                        delta={overdueCount > 0 ? -overdueCount * 10 : undefined}
                        sub="Bills past their due date"
                    />
                </div>

                {/* Table card */}
                <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

                    {/* Toolbar */}
                    <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <h2 className="text-[14px] font-semibold text-zinc-900">Bill Register</h2>
                            <p className="text-[12px] text-zinc-500">
                                {filtered.length} bill{filtered.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Search */}
                            <div className="relative w-56">
                                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search bills or ref no..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
                                />
                            </div>

                            {/* Category filter */}
                            <div className="relative">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer"
                                >
                                    {CATEGORIES.map((c) => (
                                        <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
                                    ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>

                            {/* Status filter */}
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
                                    ["Bill", ""],
                                    ["Reference", ""],
                                    ["Frequency", ""],
                                    ["Next Due", ""],
                                    ["Terms", ""],
                                    ["Amount", "text-right"],
                                    ["Status", ""],
                                    ["", ""],
                                ].map(([h, cls], i) => (
                                    <th
                                        key={i}
                                        className={cn(
                                            "px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide",
                                            cls,
                                        )}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filtered.map((bill) => {
                                const severity = getDueSeverity(bill.nextDueDate, bill.status);
                                return (
                                    <tr
                                        key={bill.id}
                                        className={cn(
                                            "transition-colors cursor-pointer group",
                                            severity === "soon"
                                                ? "bg-amber-50/40 hover:bg-amber-50/70"
                                                : severity === "overdue"
                                                    ? "bg-red-50/30 hover:bg-red-50/60"
                                                    : "hover:bg-zinc-50/70",
                                        )}
                                    >
                                        {/* Bill name + vendor */}
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                                                    <Receipt className="w-3.5 h-3.5 text-zinc-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-medium text-zinc-900">{bill.name}</p>
                                                    <p className="text-[12px] text-zinc-400">{bill.vendor || "—"}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Reference No */}
                                        <td className="px-6 py-3">
                                            {bill.referenceNo ? (
                                                <span className="text-[12px] font-mono text-zinc-500 bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded">
                                                    {bill.referenceNo}
                                                </span>
                                            ) : (
                                                <span className="text-[13px] text-zinc-300">—</span>
                                            )}
                                        </td>

                                        {/* Frequency */}
                                        <td className="px-6 py-3">
                                            <FreqBadge freq={bill.frequency} />
                                        </td>

                                        {/* Next due */}
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-1.5">
                                                {severity === "overdue" && (
                                                    <>
                                                        <span className="text-[12px] font-semibold text-red-600">
                                                            {bill.nextDueDateLabel}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-full">
                                                            Overdue
                                                        </span>
                                                    </>
                                                )}
                                                {severity === "soon" && (
                                                    <>
                                                        <span className="text-[12px] font-semibold text-amber-600">
                                                            {bill.nextDueDateLabel}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-white bg-amber-400 px-1.5 py-0.5 rounded-full">
                                                            Soon
                                                        </span>
                                                    </>
                                                )}
                                                {severity === "normal" && (
                                                    <span className="text-[13px] text-zinc-500">{bill.nextDueDateLabel}</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Payment Terms */}
                                        <td className="px-6 py-3 text-[13px] text-zinc-500">{bill.paymentTerms}</td>

                                        {/* Amount */}
                                        <td className="px-6 py-3 text-right font-mono text-[13px] font-semibold text-zinc-900 tabular-nums">
                                            {fmt(bill.amount)}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-3">
                                            <StatusPill status={bill.status} />
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {bill.status !== "Ended" && (
                                                    <button
                                                        onClick={() => toggleStatus(bill.id)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium text-[#5B5FEF] border border-[#5B5FEF]/20 bg-[#5B5FEF]/5 rounded-lg hover:bg-[#5B5FEF]/10 transition-colors whitespace-nowrap"
                                                    >
                                                        {bill.status === "Active" ? (
                                                            <><Pause className="w-3 h-3" /> Pause</>
                                                        ) : (
                                                            <><Play className="w-3 h-3" /> Resume</>
                                                        )}
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
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Receipt className="w-6 h-6 text-zinc-200" />
                                            <p className="text-[13px] text-zinc-400">No recurring bills match your filters.</p>
                                            <button
                                                onClick={() => {
                                                    setSearchQuery("");
                                                    setSelectedCategory("All");
                                                    setSelectedStatus("All");
                                                }}
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
                                {filtered.length} bill{filtered.length !== 1 ? "s" : ""}
                            </span>
                            <span className="text-[13px] font-semibold text-zinc-900 tabular-nums font-mono">
                                Monthly payable: {fmt(Math.round(filteredMonthlyPayable))}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <CreateBillModal onClose={() => setShowModal(false)} onAdd={handleAdd} />
            )}
        </div>
    );
}