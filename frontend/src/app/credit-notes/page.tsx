"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import {
    Search,
    Plus,
    ChevronDown,
    MoreHorizontal,
    ArrowUpRight,
    ArrowDownRight,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    Send,
    Printer,
    Trash2,
    ReceiptText,
    BadgePercent,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type CreditNoteStatus = "Draft" | "Open" | "Applied" | "Voided";
type CreditReason =
    | "Returned Goods"
    | "Price Adjustment"
    | "Duplicate Invoice"
    | "Other";

interface CreditNote {
    id: string;
    customer: string;
    customerId: string;
    invoiceId: string;
    date: string;
    reason: CreditReason;
    status: CreditNoteStatus;
    amount: number;
    balance: number; // remaining unused credit
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const initialCreditNotes: CreditNote[] = [
    {
        id: "CN-0021",
        customer: "Acme Solutions",
        customerId: "CUST-4092",
        invoiceId: "INV-2041",
        date: "2025-06-18",
        reason: "Returned Goods",
        status: "Open",
        amount: 12000,
        balance: 12000,
    },
    {
        id: "CN-0020",
        customer: "Eco Stream Logistics",
        customerId: "CUST-8210",
        invoiceId: "INV-2038",
        date: "2025-06-15",
        reason: "Price Adjustment",
        status: "Applied",
        amount: 4500,
        balance: 0,
    },
    {
        id: "CN-0019",
        customer: "Digital Wave Inc",
        customerId: "CUST-5512",
        invoiceId: "INV-2035",
        date: "2025-06-13",
        reason: "Duplicate Invoice",
        status: "Open",
        amount: 91000,
        balance: 45000,
    },
    {
        id: "CN-0018",
        customer: "FlexTech Systems",
        customerId: "CUST-6390",
        invoiceId: "INV-2031",
        date: "2025-06-11",
        reason: "Returned Goods",
        status: "Draft",
        amount: 6750,
        balance: 6750,
    },
    {
        id: "CN-0017",
        customer: "Blue Tier Tech",
        customerId: "CUST-3912",
        invoiceId: "INV-2028",
        date: "2025-06-09",
        reason: "Other",
        status: "Voided",
        amount: 3300,
        balance: 0,
    },
    {
        id: "CN-0016",
        customer: "Acme Solutions",
        customerId: "CUST-4092",
        invoiceId: "INV-2024",
        date: "2025-06-07",
        reason: "Price Adjustment",
        status: "Applied",
        amount: 8800,
        balance: 0,
    },
    {
        id: "CN-0015",
        customer: "Cloud Harbor",
        customerId: "CUST-2844",
        invoiceId: "INV-2020",
        date: "2025-06-05",
        reason: "Returned Goods",
        status: "Open",
        amount: 5100,
        balance: 2200,
    },
];

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const statusConfig: Record<
    CreditNoteStatus,
    { bg: string; text: string; icon: React.ReactNode }
> = {
    Draft: {
        bg: "bg-zinc-100",
        text: "text-zinc-600",
        icon: <Clock className="w-3 h-3" />,
    },
    Open: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        icon: <ReceiptText className="w-3 h-3" />,
    },
    Applied: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        icon: <CheckCircle2 className="w-3 h-3" />,
    },
    Voided: {
        bg: "bg-red-50",
        text: "text-red-600",
        icon: <XCircle className="w-3 h-3" />,
    },
};

const reasonConfig: Record<CreditReason, { bg: string; text: string }> = {
    "Returned Goods": { bg: "bg-orange-50", text: "text-orange-700" },
    "Price Adjustment": { bg: "bg-purple-50", text: "text-purple-700" },
    "Duplicate Invoice": { bg: "bg-amber-50", text: "text-amber-700" },
    Other: { bg: "bg-zinc-100", text: "text-zinc-600" },
};

const statuses: CreditNoteStatus[] = ["Draft", "Open", "Applied", "Voided"];

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
function StatCard({
    label,
    value,
    delta,
    icon,
}: {
    label: string;
    value: string;
    delta?: number;
    icon?: React.ReactNode;
}) {
    const positive = delta !== undefined && delta >= 0;
    return (
        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 flex flex-col gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-zinc-500 flex items-center gap-1.5">
                    {icon}
                    {label}
                </span>
                {delta !== undefined && (
                    <span
                        className={cn(
                            "inline-flex items-center gap-0.5 text-[12px] font-medium px-1.5 py-0.5 rounded-full",
                            positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                        )}
                    >
                        {positive ? (
                            <ArrowUpRight className="w-3 h-3" />
                        ) : (
                            <ArrowDownRight className="w-3 h-3" />
                        )}
                        {Math.abs(delta)}%
                    </span>
                )}
            </div>
            <span className="text-[26px] font-semibold text-zinc-900 tabular-nums tracking-tight">
                {value}
            </span>
        </div>
    );
}

function StatusBadge({ status }: { status: CreditNoteStatus }) {
    const cfg = statusConfig[status];
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full",
                cfg.bg,
                cfg.text
            )}
        >
            {cfg.icon}
            {status}
        </span>
    );
}

function ReasonBadge({ reason }: { reason: CreditReason }) {
    const cfg = reasonConfig[reason];
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 text-[12px] font-medium px-2 py-1 rounded-full",
                cfg.bg,
                cfg.text
            )}
        >
            {reason}
        </span>
    );
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function CreditNotes() {
    const router = useRouter();
    const [creditNotes] = useState<CreditNote[]>(initialCreditNotes);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<"All" | CreditNoteStatus>("All");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const filtered = creditNotes.filter((cn) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            cn.id.toLowerCase().includes(q) ||
            cn.customer.toLowerCase().includes(q) ||
            cn.invoiceId.toLowerCase().includes(q);
        const matchesStatus = selectedStatus === "All" || cn.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const totalAmount = creditNotes.reduce((s, cn) => s + cn.amount, 0);
    const openAmount = creditNotes
        .filter((cn) => cn.status === "Open")
        .reduce((s, cn) => s + cn.balance, 0);
    const appliedAmount = creditNotes
        .filter((cn) => cn.status === "Applied")
        .reduce((s, cn) => s + cn.amount, 0);
    const voidedCount = creditNotes.filter((cn) => cn.status === "Voided").length;

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
            <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">

                {/* Page header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">
                            Credit Notes
                        </h1>
                        <p className="text-[13px] text-zinc-500 mt-0.5">
                            Manage customer credits and invoice adjustments
                        </p>
                    </div>
                    <button
                        onClick={() => router.push("/credit-notes/create")}
                        className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        New Credit Note
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Issued"
                        value={`₹${totalAmount.toLocaleString("en-IN")}`}
                        delta={4.2}
                        icon={<ReceiptText className="w-3.5 h-3.5 text-zinc-400" />}
                    />
                    <StatCard
                        label="Open Balance"
                        value={`₹${openAmount.toLocaleString("en-IN")}`}
                        icon={<BadgePercent className="w-3.5 h-3.5 text-blue-500" />}
                    />
                    <StatCard
                        label="Applied"
                        value={`₹${appliedAmount.toLocaleString("en-IN")}`}
                        delta={8.1}
                        icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    />
                    <StatCard
                        label="Voided"
                        value={String(voidedCount)}
                        icon={<XCircle className="w-3.5 h-3.5 text-red-400" />}
                    />
                </div>

                {/* Table section */}
                <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

                    {/* Controls */}
                    <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-[14px] font-semibold text-zinc-900">Credit Note List</h2>
                            <p className="text-[12px] text-zinc-500">
                                {filtered.length} credit note{filtered.length !== 1 ? "s" : ""}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Search */}
                            <div className="relative w-56">
                                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search credit notes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
                                />
                            </div>

                            {/* Status filter */}
                            <div className="relative">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) =>
                                        setSelectedStatus(e.target.value as "All" | CreditNoteStatus)
                                    }
                                    className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer"
                                >
                                    <option value="All">All Status</option>
                                    {statuses.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
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
                                    "Credit Note",
                                    "Customer",
                                    "Invoice",
                                    "Date",
                                    "Reason",
                                    "Status",
                                    "Balance",
                                    "Amount",
                                    "",
                                ].map((col) => (
                                    <th
                                        key={col}
                                        className={cn(
                                            "px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide whitespace-nowrap",
                                            col === "" && "text-right"
                                        )}
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filtered.map((cn) => (
                                <tr
                                    key={cn.id}
                                    className="hover:bg-zinc-50/70 transition-colors cursor-pointer"
                                    onClick={() => setOpenMenuId(null)}
                                >
                                    {/* CN ID */}
                                    <td className="px-6 py-3">
                                        <span className="text-[13px] font-semibold text-[#5B5FEF]">
                                            {cn.id}
                                        </span>
                                    </td>

                                    {/* Customer */}
                                    <td className="px-6 py-3">
                                        <div>
                                            <p className="text-[13px] font-medium text-zinc-900">
                                                {cn.customer}
                                            </p>
                                            <p className="text-[12px] text-zinc-400">{cn.customerId}</p>
                                        </div>
                                    </td>

                                    {/* Invoice */}
                                    <td className="px-6 py-3">
                                        <span className="text-[12px] font-medium text-[#5B5FEF] bg-indigo-50 px-2 py-0.5 rounded-full">
                                            {cn.invoiceId}
                                        </span>
                                    </td>

                                    {/* Date */}
                                    <td className="px-6 py-3 text-[13px] text-zinc-600 whitespace-nowrap">
                                        {formatDate(cn.date)}
                                    </td>

                                    {/* Reason */}
                                    <td className="px-6 py-3">
                                        <ReasonBadge reason={cn.reason} />
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-3">
                                        <StatusBadge status={cn.status} />
                                    </td>

                                    {/* Balance */}
                                    <td className="px-6 py-3 font-mono text-[13px] tabular-nums whitespace-nowrap">
                                        {cn.balance > 0 ? (
                                            <span className="text-blue-700 font-medium">
                                                ₹{cn.balance.toLocaleString("en-IN")}
                                            </span>
                                        ) : (
                                            <span className="text-zinc-400">—</span>
                                        )}
                                    </td>

                                    {/* Amount */}
                                    <td className="px-6 py-3 font-mono text-[13px] font-medium text-zinc-900 tabular-nums whitespace-nowrap">
                                        ₹{cn.amount.toLocaleString("en-IN")}
                                    </td>

                                    {/* Actions */}
                                    <td
                                        className="px-6 py-3 text-right relative"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() =>
                                                setOpenMenuId(openMenuId === cn.id ? null : cn.id)
                                            }
                                            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>

                                        {openMenuId === cn.id && (
                                            <div className="absolute right-6 top-10 z-10 bg-white border border-zinc-200 rounded-xl shadow-lg py-1 w-52">
                                                {cn.status === "Open" && (
                                                    <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                        Apply to Invoice
                                                    </button>
                                                )}
                                                <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                                                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                                                    View Invoice
                                                </button>
                                                {cn.status !== "Voided" && cn.status !== "Applied" && (
                                                    <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                                                        <FileText className="w-3.5 h-3.5 text-zinc-400" />
                                                        Edit
                                                    </button>
                                                )}
                                                <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                                                    <Send className="w-3.5 h-3.5 text-[#5B5FEF]" />
                                                    Send to Customer
                                                </button>
                                                <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                                                    <Printer className="w-3.5 h-3.5 text-zinc-400" />
                                                    Download PDF
                                                </button>
                                                {cn.status === "Open" && (
                                                    <button className="w-full text-left px-4 py-2 text-[13px] text-amber-600 hover:bg-amber-50 flex items-center gap-2">
                                                        <XCircle className="w-3.5 h-3.5" />
                                                        Void
                                                    </button>
                                                )}
                                                {cn.status === "Draft" && (
                                                    <button className="w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center">
                                        <p className="text-[13px] text-zinc-400">
                                            No credit notes match your filters.
                                        </p>
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