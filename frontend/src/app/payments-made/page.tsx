"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
    Search,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    ChevronDown,
    CheckCircle2,
    Clock,
    XCircle,
    X,
    CreditCard,
    Download,
    CheckCheck,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type PaymentStatus = "Paid" | "Pending" | "Failed" | "Cancelled";
type PaymentMethod =
    | "Bank Transfer"
    | "Credit Card"
    | "UPI"
    | "Wire"
    | "ACH"
    | "Cheque"
    | "Auto-debit";
type DateRange = "This Month" | "Last Month" | "This Quarter" | "This Year" | "All Time";

interface Payment {
    id: string;
    paymentNo: string;
    vendor: string;
    billRef?: string;
    paymentDate: string; // ISO
    paymentDateLabel: string;
    method: PaymentMethod;
    txnRef?: string;
    amount: number;
    status: PaymentStatus;
    reconciled: boolean;
    notes?: string;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<
    PaymentStatus,
    { dot: string; text: string; bg: string }
> = {
    Paid: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
    Pending: { dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50" },
    Failed: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
    Cancelled: { dot: "bg-zinc-400", text: "text-zinc-600", bg: "bg-zinc-100" },
};

const METHOD_CONFIG: Record<PaymentMethod, { bg: string; text: string }> = {
    "Bank Transfer": { bg: "bg-blue-50", text: "text-blue-700" },
    "Credit Card": { bg: "bg-purple-50", text: "text-purple-700" },
    "UPI": { bg: "bg-indigo-50", text: "text-indigo-700" },
    "Wire": { bg: "bg-cyan-50", text: "text-cyan-700" },
    "ACH": { bg: "bg-teal-50", text: "text-teal-700" },
    "Cheque": { bg: "bg-zinc-100", text: "text-zinc-600" },
    "Auto-debit": { bg: "bg-orange-50", text: "text-orange-700" },
};

const PAYMENT_METHODS: PaymentMethod[] = [
    "Bank Transfer", "Credit Card", "UPI", "Wire", "ACH", "Cheque", "Auto-debit",
];
const STATUSES: PaymentStatus[] = ["Paid", "Pending", "Failed", "Cancelled"];
const DATE_RANGES: DateRange[] = ["This Month", "Last Month", "This Quarter", "This Year", "All Time"];

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const today = new Date();

function makeDate(daysAgo: number): { paymentDate: string; paymentDateLabel: string } {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return {
        paymentDate: d.toISOString(),
        paymentDateLabel: d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
    };
}

const initialPayments: Payment[] = [
    {
        id: "P-001", paymentNo: "PAY-2024-001",
        vendor: "DLF Properties Ltd.", billRef: "RB-001",
        ...makeDate(2), method: "Bank Transfer",
        txnRef: "NEFT-20240601-4521", amount: 95000,
        status: "Paid", reconciled: true,
    },
    {
        id: "P-002", paymentNo: "PAY-2024-002",
        vendor: "HDFC Bank", billRef: "RB-003",
        ...makeDate(2), method: "Auto-debit",
        txnRef: "AD-20240601-8823", amount: 142000,
        status: "Paid", reconciled: true,
    },
    {
        id: "P-003", paymentNo: "PAY-2024-003",
        vendor: "Tata Communications", billRef: "RB-002",
        ...makeDate(5), method: "Auto-debit",
        txnRef: "AD-20240528-3312", amount: 18500,
        status: "Paid", reconciled: true,
    },
    {
        id: "P-004", paymentNo: "PAY-2024-004",
        vendor: "Khaitan & Co.", billRef: "RB-004",
        ...makeDate(8), method: "Wire",
        txnRef: "WIRE-20240525-9901", amount: 75000,
        status: "Paid", reconciled: false,
        notes: "Q2 legal retainer payment",
    },
    {
        id: "P-005", paymentNo: "PAY-2024-005",
        vendor: "Amazon Web Services",
        ...makeDate(0), method: "Credit Card",
        txnRef: undefined, amount: 12400,
        status: "Pending", reconciled: false,
        notes: "Awaiting card settlement",
    },
    {
        id: "P-006", paymentNo: "PAY-2024-006",
        vendor: "MSEDCL", billRef: "RE-003",
        ...makeDate(12), method: "UPI",
        txnRef: "UPI-20240521-7743", amount: 9200,
        status: "Paid", reconciled: true,
    },
    {
        id: "P-007", paymentNo: "PAY-2024-007",
        vendor: "Blue Dart Logistics", billRef: "RB-006",
        ...makeDate(15), method: "Bank Transfer",
        txnRef: "NEFT-20240518-1102", amount: 32000,
        status: "Failed", reconciled: false,
        notes: "Insufficient funds — retry scheduled",
    },
    {
        id: "P-008", paymentNo: "PAY-2024-008",
        vendor: "LinkedIn Corp.", billRef: "RE-004",
        ...makeDate(20), method: "Credit Card",
        txnRef: "CC-20240513-5519", amount: 32000,
        status: "Cancelled", reconciled: false,
        notes: "Subscription paused before billing",
    },
    {
        id: "P-009", paymentNo: "PAY-2024-009",
        vendor: "Google LLC", billRef: "RE-002",
        ...makeDate(32), method: "Credit Card",
        txnRef: "CC-20240501-3348", amount: 4800,
        status: "Paid", reconciled: true,
    },
    {
        id: "P-010", paymentNo: "PAY-2024-010",
        vendor: "HDFC Ergo", billRef: "RB-005",
        ...makeDate(45), method: "Wire",
        txnRef: "WIRE-20240418-6690", amount: 380000,
        status: "Paid", reconciled: true,
        notes: "Annual insurance premium",
    },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmt(n: number) {
    return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function isInRange(isoDate: string, range: DateRange): boolean {
    const d = new Date(isoDate);
    const now = new Date();
    switch (range) {
        case "This Month":
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        case "Last Month": {
            const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
        }
        case "This Quarter": {
            const q = Math.floor(now.getMonth() / 3);
            return (
                Math.floor(d.getMonth() / 3) === q &&
                d.getFullYear() === now.getFullYear()
            );
        }
        case "This Year":
            return d.getFullYear() === now.getFullYear();
        case "All Time":
            return true;
    }
}

function exportCSV(payments: Payment[]) {
    const headers = [
        "Payment No", "Vendor", "Bill Ref", "Date", "Method",
        "Txn Ref", "Amount", "Status", "Reconciled",
    ];
    const rows = payments.map((p) => [
        p.paymentNo,
        p.vendor,
        p.billRef ?? "",
        p.paymentDateLabel,
        p.method,
        p.txnRef ?? "",
        p.amount.toFixed(2),
        p.status,
        p.reconciled ? "Yes" : "No",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payments-made.csv";
    a.click();
    URL.revokeObjectURL(url);
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
                    <span className={cn(
                        "inline-flex items-center gap-0.5 text-[12px] font-medium px-1.5 py-0.5 rounded-full",
                        positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
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

function StatusPill({ status }: { status: PaymentStatus }) {
    const cfg = STATUS_CONFIG[status];
    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full",
            cfg.bg, cfg.text,
        )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
            {status}
        </span>
    );
}

function MethodBadge({ method }: { method: PaymentMethod }) {
    const cfg = METHOD_CONFIG[method];
    return (
        <span className={cn(
            "inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md",
            cfg.bg, cfg.text,
        )}>
            {method}
        </span>
    );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
const FIELD =
    "w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 transition-colors text-zinc-800 placeholder:text-zinc-400";
const SELECT = cn(FIELD, "appearance-none cursor-pointer");

function RecordPaymentModal({
    onClose,
    onAdd,
}: {
    onClose: () => void;
    onAdd: (p: Payment) => void;
}) {
    const [vendor, setVendor] = useState("");
    const [billRef, setBillRef] = useState("");
    const [amount, setAmount] = useState("");
    const [paymentDate, setPaymentDate] = useState("");
    const [method, setMethod] = useState<PaymentMethod>("Bank Transfer");
    const [txnRef, setTxnRef] = useState("");
    const [notes, setNotes] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!vendor || !amount) return;
        const dateObj = paymentDate ? new Date(paymentDate) : today;
        const label = dateObj.toLocaleDateString("en-IN", {
            month: "short", day: "numeric", year: "numeric",
        });
        onAdd({
            id: `P-${String(Math.floor(Math.random() * 900) + 100)}`,
            paymentNo: `PAY-2024-${String(Math.floor(Math.random() * 900) + 100)}`,
            vendor,
            billRef: billRef || undefined,
            paymentDate: dateObj.toISOString(),
            paymentDateLabel: label,
            method,
            txnRef: txnRef || undefined,
            amount: parseFloat(amount),
            status: "Paid",
            reconciled: false,
            notes: notes || undefined,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                    <div>
                        <h3 className="text-[15px] font-semibold text-zinc-900">Record Payment</h3>
                        <p className="text-[12px] text-zinc-500 mt-0.5">Log a new outgoing payment</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Vendor */}
                    <div>
                        <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                            Vendor
                        </label>
                        <input
                            required
                            placeholder="e.g. HDFC Bank"
                            className={FIELD}
                            value={vendor}
                            onChange={(e) => setVendor(e.target.value)}
                        />
                    </div>

                    {/* Bill Ref + Amount */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                                Bill Ref <span className="normal-case font-normal text-zinc-400">(optional)</span>
                            </label>
                            <input
                                placeholder="e.g. RB-001"
                                className={FIELD}
                                value={billRef}
                                onChange={(e) => setBillRef(e.target.value)}
                            />
                        </div>
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
                    </div>

                    {/* Payment Date + Method */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                                Payment Date
                            </label>
                            <input
                                type="date"
                                className={FIELD}
                                value={paymentDate}
                                onChange={(e) => setPaymentDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                                Payment Method
                            </label>
                            <select
                                className={SELECT}
                                value={method}
                                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                            >
                                {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Transaction Ref */}
                    <div>
                        <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                            Transaction / Reference No. <span className="normal-case font-normal text-zinc-400">(optional)</span>
                        </label>
                        <input
                            placeholder="e.g. NEFT-20240601-4521"
                            className={FIELD}
                            value={txnRef}
                            onChange={(e) => setTxnRef(e.target.value)}
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                            Notes <span className="normal-case font-normal text-zinc-400">(optional)</span>
                        </label>
                        <textarea
                            rows={2}
                            placeholder="Any additional context..."
                            className={cn(FIELD, "resize-none")}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
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
                            Record Payment
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
export default function PaymentsMade() {
    const [payments, setPayments] = useState<Payment[]>(initialPayments);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMethod, setSelectedMethod] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [dateRange, setDateRange] = useState<DateRange>("This Month");
    const [showModal, setShowModal] = useState(false);

    const filtered = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return payments.filter((p) =>
            (
                p.vendor.toLowerCase().includes(q) ||
                p.paymentNo.toLowerCase().includes(q) ||
                (p.txnRef?.toLowerCase().includes(q) ?? false) ||
                (p.billRef?.toLowerCase().includes(q) ?? false)
            ) &&
            (selectedMethod === "All" || p.method === selectedMethod) &&
            (selectedStatus === "All" || p.status === selectedStatus) &&
            isInRange(p.paymentDate, dateRange)
        );
    }, [payments, searchQuery, selectedMethod, selectedStatus, dateRange]);

    // Stats (always from All Time for the year/month cards)
    const thisMonthPayments = payments.filter(
        (p) => p.status === "Paid" && isInRange(p.paymentDate, "This Month"),
    );
    const thisYearPayments = payments.filter(
        (p) => p.status === "Paid" && isInRange(p.paymentDate, "This Year"),
    );
    const pendingCount = payments.filter((p) => p.status === "Pending").length;
    const failedCount = payments.filter((p) => p.status === "Failed").length;

    const totalThisMonth = thisMonthPayments.reduce((s, p) => s + p.amount, 0);
    const totalThisYear = thisYearPayments.reduce((s, p) => s + p.amount, 0);
    const avgPayment =
        filtered.length > 0
            ? filtered.reduce((s, p) => s + p.amount, 0) / filtered.length
            : 0;

    const filteredTotal = filtered
        .filter((p) => p.status === "Paid")
        .reduce((s, p) => s + p.amount, 0);

    const toggleReconciled = (id: string) => {
        setPayments(payments.map((p) =>
            p.id === id ? { ...p, reconciled: !p.reconciled } : p,
        ));
    };

    const handleAdd = (payment: Payment) => {
        setPayments([payment, ...payments]);
        setShowModal(false);
    };

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
            <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">

                {/* Page header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">Payments Made</h1>
                        <p className="text-[13px] text-zinc-500 mt-0.5">
                            A complete ledger of all outgoing payments to vendors.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => exportCSV(filtered)}
                            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-700 border border-zinc-200 bg-white hover:bg-zinc-50 px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Record Payment
                        </button>
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <StatCard
                        label="Paid This Month"
                        value={fmt(Math.round(totalThisMonth))}
                        delta={-3.1}
                        sub={`${thisMonthPayments.length} transactions`}
                    />
                    <StatCard
                        label="Paid This Year"
                        value={fmt(Math.round(totalThisYear))}
                        delta={12.4}
                        sub={`${thisYearPayments.length} transactions`}
                    />
                    <StatCard
                        label="Pending"
                        value={String(pendingCount)}
                        sub={failedCount > 0 ? `${failedCount} failed` : "All clear on failures"}
                    />
                    <StatCard
                        label="Avg. Payment"
                        value={fmt(Math.round(avgPayment))}
                        sub="Based on current filters"
                    />
                </div>

                {/* Table card */}
                <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

                    {/* Toolbar */}
                    <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <h2 className="text-[14px] font-semibold text-zinc-900">Payment Ledger</h2>
                            <p className="text-[12px] text-zinc-500">
                                {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">

                            {/* Date range */}
                            <div className="relative">
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value as DateRange)}
                                    className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer"
                                >
                                    {DATE_RANGES.map((r) => <option key={r}>{r}</option>)}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>

                            {/* Search */}
                            <div className="relative w-56">
                                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Vendor, ref no., txn..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
                                />
                            </div>

                            {/* Method filter */}
                            <div className="relative">
                                <select
                                    value={selectedMethod}
                                    onChange={(e) => setSelectedMethod(e.target.value)}
                                    className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer"
                                >
                                    <option value="All">All Methods</option>
                                    {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
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
                                    ["Payment", ""],
                                    ["Vendor", ""],
                                    ["Bill Ref", ""],
                                    ["Date", ""],
                                    ["Method", ""],
                                    ["Txn Ref", ""],
                                    ["Amount", "text-right"],
                                    ["Status", ""],
                                    ["Reconciled", "text-center"],
                                    ["", ""],
                                ].map(([h, cls], i) => (
                                    <th
                                        key={i}
                                        className={cn(
                                            "px-5 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide",
                                            cls,
                                        )}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filtered.map((payment) => (
                                <tr
                                    key={payment.id}
                                    className={cn(
                                        "transition-colors cursor-pointer group",
                                        payment.status === "Failed"
                                            ? "bg-red-50/20 hover:bg-red-50/40"
                                            : payment.status === "Pending"
                                                ? "bg-amber-50/20 hover:bg-amber-50/40"
                                                : "hover:bg-zinc-50/70",
                                    )}
                                >
                                    {/* Payment No */}
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                                                <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-medium text-zinc-900">{payment.paymentNo}</p>
                                                {payment.notes && (
                                                    <p className="text-[11px] text-zinc-400 max-w-[140px] truncate">{payment.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Vendor */}
                                    <td className="px-5 py-3 text-[13px] text-zinc-700 font-medium">
                                        {payment.vendor}
                                    </td>

                                    {/* Bill Ref */}
                                    <td className="px-5 py-3">
                                        {payment.billRef ? (
                                            <span className="text-[12px] font-mono text-zinc-500 bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded">
                                                {payment.billRef}
                                            </span>
                                        ) : (
                                            <span className="text-zinc-300 text-[13px]">—</span>
                                        )}
                                    </td>

                                    {/* Date */}
                                    <td className="px-5 py-3 text-[13px] text-zinc-500 whitespace-nowrap">
                                        {payment.paymentDateLabel}
                                    </td>

                                    {/* Method */}
                                    <td className="px-5 py-3">
                                        <MethodBadge method={payment.method} />
                                    </td>

                                    {/* Txn Ref */}
                                    <td className="px-5 py-3">
                                        {payment.txnRef ? (
                                            <span className="text-[11px] font-mono text-zinc-400">{payment.txnRef}</span>
                                        ) : (
                                            <span className="text-zinc-300 text-[13px]">—</span>
                                        )}
                                    </td>

                                    {/* Amount */}
                                    <td className="px-5 py-3 text-right font-mono text-[13px] font-semibold text-zinc-900 tabular-nums">
                                        {fmt(payment.amount)}
                                    </td>

                                    {/* Status */}
                                    <td className="px-5 py-3">
                                        <StatusPill status={payment.status} />
                                    </td>

                                    {/* Reconciled toggle */}
                                    <td className="px-5 py-3 text-center">
                                        <button
                                            onClick={() => toggleReconciled(payment.id)}
                                            title={payment.reconciled ? "Mark as unreconciled" : "Mark as reconciled"}
                                            className={cn(
                                                "inline-flex items-center justify-center w-6 h-6 rounded-full transition-colors",
                                                payment.reconciled
                                                    ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                                                    : "bg-zinc-100 text-zinc-300 hover:bg-zinc-200 hover:text-zinc-500",
                                            )}
                                        >
                                            <CheckCheck className="w-3.5 h-3.5" />
                                        </button>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-5 py-3">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <CreditCard className="w-6 h-6 text-zinc-200" />
                                            <p className="text-[13px] text-zinc-400">No payments match your filters.</p>
                                            <button
                                                onClick={() => {
                                                    setSearchQuery("");
                                                    setSelectedMethod("All");
                                                    setSelectedStatus("All");
                                                    setDateRange("All Time");
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
                            <div className="flex items-center gap-4">
                                <span className="text-[12px] text-zinc-400">
                                    {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
                                </span>
                                <span className="text-[12px] text-zinc-400">
                                    {filtered.filter((p) => p.reconciled).length} reconciled
                                </span>
                                {filtered.some((p) => p.status === "Failed") && (
                                    <span className="text-[12px] text-red-500 font-medium">
                                        {filtered.filter((p) => p.status === "Failed").length} failed
                                    </span>
                                )}
                            </div>
                            <span className="text-[13px] font-semibold text-zinc-900 tabular-nums font-mono">
                                Total paid: {fmt(Math.round(filteredTotal))}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <RecordPaymentModal onClose={() => setShowModal(false)} onAdd={handleAdd} />
            )}
        </div>
    );
}