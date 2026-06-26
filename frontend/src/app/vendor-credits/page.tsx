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
    X,
    Tag,
    Download,
    AlertCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type CreditStatus = "Open" | "Partially Used" | "Fully Used" | "Expired";
type CreditReason =
    | "Return"
    | "Overpayment"
    | "Discount"
    | "Price Adjustment"
    | "Other";

interface VendorCredit {
    id: string;
    creditNo: string;
    vendor: string;
    creditNoteRef?: string;
    linkedBill?: string;
    issueDate: string;
    issueDateLabel: string;
    expiryDate?: string;
    expiryDateLabel?: string;
    amount: number;
    amountUsed: number;
    reason: CreditReason;
    status: CreditStatus;
    notes?: string;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<
    CreditStatus,
    { dot: string; text: string; bg: string }
> = {
    "Open": { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
    "Partially Used": { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" },
    "Fully Used": { dot: "bg-zinc-400", text: "text-zinc-600", bg: "bg-zinc-100" },
    "Expired": { dot: "bg-red-400", text: "text-red-700", bg: "bg-red-50" },
};

const REASON_CONFIG: Record<CreditReason, { bg: string; text: string }> = {
    "Return": { bg: "bg-orange-50", text: "text-orange-700" },
    "Overpayment": { bg: "bg-purple-50", text: "text-purple-700" },
    "Discount": { bg: "bg-teal-50", text: "text-teal-700" },
    "Price Adjustment": { bg: "bg-indigo-50", text: "text-indigo-700" },
    "Other": { bg: "bg-zinc-100", text: "text-zinc-600" },
};

const STATUSES: CreditStatus[] = ["Open", "Partially Used", "Fully Used", "Expired"];
const REASONS: CreditReason[] = [
    "Return", "Overpayment", "Discount", "Price Adjustment", "Other",
];

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const today = new Date();

function makeIssueDate(daysAgo: number) {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return {
        issueDate: d.toISOString(),
        issueDateLabel: d.toLocaleDateString("en-IN", {
            month: "short", day: "numeric", year: "numeric",
        }),
    };
}

function makeExpiryDate(daysFromNow: number) {
    const d = new Date(today);
    d.setDate(d.getDate() + daysFromNow);
    return {
        expiryDate: d.toISOString(),
        expiryDateLabel: d.toLocaleDateString("en-IN", {
            month: "short", day: "numeric", year: "numeric",
        }),
    };
}

function deriveStatus(
    amount: number,
    amountUsed: number,
    expiryDate?: string,
): CreditStatus {
    if (expiryDate && new Date(expiryDate) < today) return "Expired";
    if (amountUsed >= amount) return "Fully Used";
    if (amountUsed > 0) return "Partially Used";
    return "Open";
}

const rawCredits: Omit<VendorCredit, "status">[] = [
    {
        id: "VC-001", creditNo: "VCRD-2024-001",
        vendor: "DLF Properties Ltd.", creditNoteRef: "CN-DLF-441", linkedBill: "RB-001",
        ...makeIssueDate(10), ...makeExpiryDate(80),
        amount: 12000, amountUsed: 0,
        reason: "Overpayment" as CreditReason,
        notes: "Excess rent paid in May",
    },
    {
        id: "VC-002", creditNo: "VCRD-2024-002",
        vendor: "Tata Communications", creditNoteRef: "CN-TCL-882",
        ...makeIssueDate(18),
        amount: 3500, amountUsed: 3500,
        reason: "Discount" as CreditReason,
        notes: "Annual plan discount applied",
    },
    {
        id: "VC-003", creditNo: "VCRD-2024-003",
        vendor: "Amazon Web Services", linkedBill: "RE-002",
        ...makeIssueDate(5), ...makeExpiryDate(25),
        amount: 8000, amountUsed: 2400,
        reason: "Price Adjustment" as CreditReason,
        notes: "Reserved instance pricing correction",
    },
    {
        id: "VC-004", creditNo: "VCRD-2024-004",
        vendor: "Blue Dart Logistics", creditNoteRef: "CN-BDL-119", linkedBill: "RB-006",
        ...makeIssueDate(22),
        amount: 6500, amountUsed: 0,
        reason: "Return" as CreditReason,
        notes: "Damaged goods returned — credit issued",
    },
    {
        id: "VC-005", creditNo: "VCRD-2024-005",
        vendor: "HDFC Ergo", creditNoteRef: "CN-HE-007",
        ...makeIssueDate(60), ...makeExpiryDate(8),
        amount: 22000, amountUsed: 10000,
        reason: "Price Adjustment" as CreditReason,
        notes: "Policy premium revision",
    },
    {
        id: "VC-006", creditNo: "VCRD-2024-006",
        vendor: "Google LLC", linkedBill: "RE-006",
        ...makeIssueDate(90), ...makeExpiryDate(-5),
        amount: 4800, amountUsed: 0,
        reason: "Return" as CreditReason,
        notes: "Unused Workspace licences refunded",
    },
    {
        id: "VC-007", creditNo: "VCRD-2024-007",
        vendor: "Khaitan & Co.", creditNoteRef: "CN-KHT-031",
        ...makeIssueDate(30),
        amount: 15000, amountUsed: 7500,
        reason: "Overpayment" as CreditReason,
    },
];

const initialCredits: VendorCredit[] = rawCredits.map((c) => ({
    ...c,
    status: deriveStatus(c.amount, c.amountUsed, c.expiryDate),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmt(n: number) {
    return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function getExpirySeverity(credit: VendorCredit): "expired" | "soon" | "normal" {
    if (!credit.expiryDate || credit.status === "Fully Used") return "normal";
    const diff =
        (new Date(credit.expiryDate).getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24);
    if (diff < 0) return "expired";
    if (diff <= 14) return "soon";
    return "normal";
}

function exportCSV(credits: VendorCredit[]) {
    const headers = [
        "Credit No", "Vendor", "Credit Note Ref", "Linked Bill",
        "Issue Date", "Expiry Date", "Reason",
        "Amount", "Amount Used", "Balance", "Status",
    ];
    const rows = credits.map((c) => [
        c.creditNo, c.vendor, c.creditNoteRef ?? "", c.linkedBill ?? "",
        c.issueDateLabel, c.expiryDateLabel ?? "",
        c.reason,
        c.amount.toFixed(2), c.amountUsed.toFixed(2),
        (c.amount - c.amountUsed).toFixed(2),
        c.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vendor-credits.csv";
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
                        {positive
                            ? <ArrowUpRight className="w-3 h-3" />
                            : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(delta)}%
                    </span>
                )}
            </div>
            <span className="text-[26px] font-semibold text-zinc-900 tabular-nums tracking-tight">
                {value}
            </span>
            {sub && <span className="text-[12px] text-zinc-400">{sub}</span>}
        </div>
    );
}

function StatusPill({ status }: { status: CreditStatus }) {
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

function ReasonBadge({ reason }: { reason: CreditReason }) {
    const cfg = REASON_CONFIG[reason];
    return (
        <span className={cn(
            "inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md",
            cfg.bg, cfg.text,
        )}>
            {reason}
        </span>
    );
}

function BalanceBar({ amount, amountUsed }: { amount: number; amountUsed: number }) {
    const pct = Math.min(100, (amountUsed / amount) * 100);
    return (
        <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                    className={cn(
                        "h-full rounded-full transition-all",
                        pct >= 100 ? "bg-zinc-400" : pct > 50 ? "bg-blue-400" : "bg-emerald-400",
                    )}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-[12px] text-zinc-500 tabular-nums font-mono">
                {fmt(amount - amountUsed)}
            </span>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Apply Credit Modal
// ---------------------------------------------------------------------------
function ApplyCreditModal({
    credit,
    onClose,
    onApply,
}: {
    credit: VendorCredit;
    onClose: () => void;
    onApply: (id: string, applyAmount: number, billRef: string) => void;
}) {
    const balance = credit.amount - credit.amountUsed;
    const [applyAmount, setApplyAmount] = useState(String(balance));
    const [billRef, setBillRef] = useState("");

    const FIELD =
        "w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 transition-colors text-zinc-800 placeholder:text-zinc-400";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseFloat(applyAmount);
        if (!val || val <= 0 || val > balance) return;
        onApply(credit.id, val, billRef);
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-[420px] overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                    <div>
                        <h3 className="text-[15px] font-semibold text-zinc-900">Apply Credit</h3>
                        <p className="text-[12px] text-zinc-500 mt-0.5">{credit.creditNo} · {credit.vendor}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Balance info */}
                    <div className="bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 flex items-center justify-between">
                        <span className="text-[13px] text-zinc-500">Available balance</span>
                        <span className="text-[15px] font-semibold text-zinc-900 font-mono tabular-nums">
                            {fmt(balance)}
                        </span>
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                            Amount to Apply (₹)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min={0.01}
                            max={balance}
                            required
                            className={FIELD}
                            value={applyAmount}
                            onChange={(e) => setApplyAmount(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                            Apply to Bill Ref <span className="normal-case font-normal text-zinc-400">(optional)</span>
                        </label>
                        <input
                            placeholder="e.g. RB-002"
                            className={FIELD}
                            value={billRef}
                            onChange={(e) => setBillRef(e.target.value)}
                        />
                    </div>

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
                            Apply Credit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Add Credit Modal
// ---------------------------------------------------------------------------
const FIELD =
    "w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 transition-colors text-zinc-800 placeholder:text-zinc-400";
const SELECT = cn(FIELD, "appearance-none cursor-pointer");

function AddCreditModal({
    onClose,
    onAdd,
}: {
    onClose: () => void;
    onAdd: (c: VendorCredit) => void;
}) {
    const [vendor, setVendor] = useState("");
    const [creditNoteRef, setCreditNoteRef] = useState("");
    const [linkedBill, setLinkedBill] = useState("");
    const [amount, setAmount] = useState("");
    const [issueDate, setIssueDate] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [reason, setReason] = useState<CreditReason>("Return");
    const [notes, setNotes] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!vendor || !amount) return;
        const issueDateObj = issueDate ? new Date(issueDate) : today;
        const expiryDateObj = expiryDate ? new Date(expiryDate) : undefined;
        const issueDateLabel = issueDateObj.toLocaleDateString("en-IN", {
            month: "short", day: "numeric", year: "numeric",
        });
        const expiryDateLabel = expiryDateObj?.toLocaleDateString("en-IN", {
            month: "short", day: "numeric", year: "numeric",
        });
        const parsedAmount = parseFloat(amount);
        onAdd({
            id: `VC-${String(Math.floor(Math.random() * 900) + 100)}`,
            creditNo: `VCRD-2024-${String(Math.floor(Math.random() * 900) + 100)}`,
            vendor,
            creditNoteRef: creditNoteRef || undefined,
            linkedBill: linkedBill || undefined,
            issueDate: issueDateObj.toISOString(),
            issueDateLabel,
            expiryDate: expiryDateObj?.toISOString(),
            expiryDateLabel,
            amount: parsedAmount,
            amountUsed: 0,
            reason,
            status: deriveStatus(parsedAmount, 0, expiryDateObj?.toISOString()),
            notes: notes || undefined,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                    <div>
                        <h3 className="text-[15px] font-semibold text-zinc-900">Add Vendor Credit</h3>
                        <p className="text-[12px] text-zinc-500 mt-0.5">Record a new credit from a vendor</p>
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
                            placeholder="e.g. DLF Properties Ltd."
                            className={FIELD}
                            value={vendor}
                            onChange={(e) => setVendor(e.target.value)}
                        />
                    </div>

                    {/* Credit Note Ref + Linked Bill */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                                Credit Note Ref <span className="normal-case font-normal text-zinc-400">(optional)</span>
                            </label>
                            <input
                                placeholder="e.g. CN-DLF-441"
                                className={FIELD}
                                value={creditNoteRef}
                                onChange={(e) => setCreditNoteRef(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                                Linked Bill <span className="normal-case font-normal text-zinc-400">(optional)</span>
                            </label>
                            <input
                                placeholder="e.g. RB-001"
                                className={FIELD}
                                value={linkedBill}
                                onChange={(e) => setLinkedBill(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Amount + Reason */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                                Credit Amount (₹)
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
                                Reason
                            </label>
                            <select
                                className={SELECT}
                                value={reason}
                                onChange={(e) => setReason(e.target.value as CreditReason)}
                            >
                                {REASONS.map((r) => <option key={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Issue Date + Expiry Date */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                                Issue Date
                            </label>
                            <input
                                type="date"
                                className={FIELD}
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                                Expiry Date <span className="normal-case font-normal text-zinc-400">(optional)</span>
                            </label>
                            <input
                                type="date"
                                className={FIELD}
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                            />
                        </div>
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
                            Add Credit
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
export default function VendorCredits() {
    const [credits, setCredits] = useState<VendorCredit[]>(initialCredits);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [selectedReason, setSelectedReason] = useState("All");
    const [showAddModal, setShowAddModal] = useState(false);
    const [applyTarget, setApplyTarget] = useState<VendorCredit | null>(null);

    const filtered = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return credits.filter((c) =>
            (
                c.vendor.toLowerCase().includes(q) ||
                c.creditNo.toLowerCase().includes(q) ||
                (c.creditNoteRef?.toLowerCase().includes(q) ?? false) ||
                (c.linkedBill?.toLowerCase().includes(q) ?? false)
            ) &&
            (selectedStatus === "All" || c.status === selectedStatus) &&
            (selectedReason === "All" || c.reason === selectedReason)
        );
    }, [credits, searchQuery, selectedStatus, selectedReason]);

    // Stats
    const openCredits = credits.filter((c) => c.status === "Open" || c.status === "Partially Used");
    const totalAvailable = openCredits.reduce((s, c) => s + (c.amount - c.amountUsed), 0);
    const totalApplied = credits.reduce((s, c) => s + c.amountUsed, 0);
    const openCount = openCredits.length;
    const expiringSoon = credits.filter((c) => getExpirySeverity(c) === "soon").length;

    const handleApply = (id: string, applyAmount: number, billRef: string) => {
        setCredits(credits.map((c) => {
            if (c.id !== id) return c;
            const newUsed = c.amountUsed + applyAmount;
            return {
                ...c,
                amountUsed: newUsed,
                linkedBill: billRef || c.linkedBill,
                status: deriveStatus(c.amount, newUsed, c.expiryDate),
            };
        }));
        setApplyTarget(null);
    };

    const handleAdd = (credit: VendorCredit) => {
        setCredits([credit, ...credits]);
        setShowAddModal(false);
    };

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
            <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">

                {/* Page header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">Vendor Credits</h1>
                        <p className="text-[13px] text-zinc-500 mt-0.5">
                            Track credits owed to you by vendors and apply them against bills.
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
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Credit
                        </button>
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Available"
                        value={fmt(Math.round(totalAvailable))}
                        delta={8.2}
                        sub="Unused credit balance"
                    />
                    <StatCard
                        label="Total Applied"
                        value={fmt(Math.round(totalApplied))}
                        sub="Credits used against bills"
                    />
                    <StatCard
                        label="Open Credits"
                        value={String(openCount)}
                        sub="Active or partially used"
                    />
                    <StatCard
                        label="Expiring Soon"
                        value={String(expiringSoon)}
                        delta={expiringSoon > 0 ? -expiringSoon * 10 : undefined}
                        sub="Within the next 14 days"
                    />
                </div>

                {/* Table card */}
                <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

                    {/* Toolbar */}
                    <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <h2 className="text-[14px] font-semibold text-zinc-900">Credit Register</h2>
                            <p className="text-[12px] text-zinc-500">
                                {filtered.length} credit{filtered.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Search */}
                            <div className="relative w-56">
                                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Vendor, credit no., ref..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
                                />
                            </div>

                            {/* Reason filter */}
                            <div className="relative">
                                <select
                                    value={selectedReason}
                                    onChange={(e) => setSelectedReason(e.target.value)}
                                    className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer"
                                >
                                    <option value="All">All Reasons</option>
                                    {REASONS.map((r) => <option key={r}>{r}</option>)}
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
                                    ["Credit", ""],
                                    ["Vendor", ""],
                                    ["Reason", ""],
                                    ["Linked Bill", ""],
                                    ["Issue Date", ""],
                                    ["Expiry", ""],
                                    ["Credit Amount", "text-right"],
                                    ["Balance Remaining", ""],
                                    ["Status", ""],
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
                            {filtered.map((credit) => {
                                const expiry = getExpirySeverity(credit);
                                return (
                                    <tr
                                        key={credit.id}
                                        className={cn(
                                            "transition-colors cursor-pointer group",
                                            expiry === "soon"
                                                ? "bg-amber-50/40 hover:bg-amber-50/70"
                                                : expiry === "expired"
                                                    ? "bg-red-50/20 hover:bg-red-50/40"
                                                    : "hover:bg-zinc-50/70",
                                        )}
                                    >
                                        {/* Credit No */}
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                                                    <Tag className="w-3.5 h-3.5 text-zinc-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-medium text-zinc-900">{credit.creditNo}</p>
                                                    {credit.creditNoteRef && (
                                                        <p className="text-[11px] font-mono text-zinc-400">{credit.creditNoteRef}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Vendor */}
                                        <td className="px-5 py-3 text-[13px] text-zinc-700 font-medium">
                                            {credit.vendor}
                                        </td>

                                        {/* Reason */}
                                        <td className="px-5 py-3">
                                            <ReasonBadge reason={credit.reason} />
                                        </td>

                                        {/* Linked Bill */}
                                        <td className="px-5 py-3">
                                            {credit.linkedBill ? (
                                                <span className="text-[12px] font-mono text-zinc-500 bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded">
                                                    {credit.linkedBill}
                                                </span>
                                            ) : (
                                                <span className="text-zinc-300 text-[13px]">—</span>
                                            )}
                                        </td>

                                        {/* Issue Date */}
                                        <td className="px-5 py-3 text-[13px] text-zinc-500 whitespace-nowrap">
                                            {credit.issueDateLabel}
                                        </td>

                                        {/* Expiry */}
                                        <td className="px-5 py-3">
                                            {credit.expiryDateLabel ? (
                                                <div className="flex items-center gap-1.5">
                                                    {expiry === "soon" && (
                                                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                                    )}
                                                    <span className={cn(
                                                        "text-[13px] whitespace-nowrap",
                                                        expiry === "soon" ? "text-amber-600 font-semibold" :
                                                            expiry === "expired" ? "text-red-500 font-semibold" :
                                                                "text-zinc-500",
                                                    )}>
                                                        {credit.expiryDateLabel}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-zinc-300 text-[13px]">—</span>
                                            )}
                                        </td>

                                        {/* Credit Amount */}
                                        <td className="px-5 py-3 text-right font-mono text-[13px] font-semibold text-zinc-900 tabular-nums">
                                            {fmt(credit.amount)}
                                        </td>

                                        {/* Balance Remaining */}
                                        <td className="px-5 py-3">
                                            <BalanceBar amount={credit.amount} amountUsed={credit.amountUsed} />
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-3">
                                            <StatusPill status={credit.status} />
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {(credit.status === "Open" || credit.status === "Partially Used") && (
                                                    <button
                                                        onClick={() => setApplyTarget(credit)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium text-[#5B5FEF] border border-[#5B5FEF]/20 bg-[#5B5FEF]/5 rounded-lg hover:bg-[#5B5FEF]/10 transition-colors whitespace-nowrap"
                                                    >
                                                        Apply
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
                                    <td colSpan={10} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Tag className="w-6 h-6 text-zinc-200" />
                                            <p className="text-[13px] text-zinc-400">No vendor credits match your filters.</p>
                                            <button
                                                onClick={() => {
                                                    setSearchQuery("");
                                                    setSelectedStatus("All");
                                                    setSelectedReason("All");
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
                                    {filtered.length} credit{filtered.length !== 1 ? "s" : ""}
                                </span>
                                {expiringSoon > 0 && (
                                    <span className="text-[12px] text-amber-600 font-medium">
                                        {expiringSoon} expiring soon
                                    </span>
                                )}
                            </div>
                            <span className="text-[13px] font-semibold text-zinc-900 tabular-nums font-mono">
                                Available balance:{" "}
                                {fmt(Math.round(
                                    filtered
                                        .filter((c) => c.status === "Open" || c.status === "Partially Used")
                                        .reduce((s, c) => s + (c.amount - c.amountUsed), 0)
                                ))}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {showAddModal && (
                <AddCreditModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} />
            )}

            {applyTarget && (
                <ApplyCreditModal
                    credit={applyTarget}
                    onClose={() => setApplyTarget(null)}
                    onApply={handleApply}
                />
            )}
        </div>
    );
}