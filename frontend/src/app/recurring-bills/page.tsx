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
    Receipt,
    Pause,
    Play,
    RefreshCw,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Frequency = "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Yearly";
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
    client_id?: number;
    raw_next_date?: string;
    other_details?: any;
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
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    Paused: {
        dot: "bg-amber-400",
        text: "text-amber-700",
        bg: "bg-amber-50",
        icon: <PauseCircle className="w-3.5 h-3.5" />,
    },
    Ended: {
        dot: "bg-zinc-400",
        text: "text-zinc-600",
        bg: "bg-zinc-100",
        icon: <XCircle className="w-3.5 h-3.5" />,
    },
};

const FREQ_CONFIG: Record<Frequency, { bg: string; text: string }> = {
    Daily: { bg: "bg-purple-50", text: "text-purple-700" },
    Weekly: { bg: "bg-blue-50", text: "text-blue-700" },
    Monthly: { bg: "bg-indigo-50", text: "text-indigo-700" },
    Quarterly: { bg: "bg-cyan-50", text: "text-cyan-700" },
    Yearly: { bg: "bg-zinc-100", text: "text-zinc-600" },
};

const FREQUENCIES: Frequency[] = ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"];
const STATUSES: BillStatus[] = ["Active", "Paused", "Ended"];

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
        case "Yearly": return amount / 12;
    }
}

function getDueSeverity(isoDate: string, status: BillStatus): "overdue" | "soon" | "normal" {
    if (status !== "Active") return "normal";
    const today = new Date();
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
// Page
// ---------------------------------------------------------------------------
export default function RecurringBills() {
    const router = useRouter();
    const [bills, setBills] = useState<RecurringBill[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [loading, setLoading] = useState(true);
    const [selectedBill, setSelectedBill] = useState<RecurringBill | null>(null);

    const fetchBills = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setLoading(false);
                return;
            }
            const res = await fetch("http://localhost:8888/api/recurring-bills/", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.recurringBills) {
                const mapped = data.recurringBills.map((b: any) => {
                    const rawDetails = b.other_details ? (typeof b.other_details === 'string' ? JSON.parse(b.other_details) : b.other_details) : {};
                    return {
                        id: String(b.id),
                        name: rawDetails.profile_name || `Template ${b.id}`,
                        vendor: b.client_name || "—",
                        category: "Supplier Contract",
                        amount: parseFloat(b.amount) || 0,
                        frequency: (b.frequency === "Yearly" ? "Yearly" : b.frequency) as Frequency,
                        nextDueDate: b.next_date || "",
                        nextDueDateLabel: b.next_date ? new Date(b.next_date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "—",
                        startDate: rawDetails.start_date ? new Date(rawDetails.start_date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "—",
                        paymentTerms: rawDetails.payment_terms || "Due on Receipt",
                        paymentMethod: "Bank Transfer",
                        status: b.is_active ? "Active" : "Paused",
                        client_id: b.client_id,
                        raw_next_date: b.next_date,
                        other_details: rawDetails
                    };
                });
                setBills(mapped);
            }
        } catch (err) {
            console.error("Failed to load recurring bills:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

    const toggleStatus = async (bill: RecurringBill) => {
        try {
            const token = localStorage.getItem("token");
            const nextStatus = bill.status === "Active" ? false : true;
            const res = await fetch(`http://localhost:8888/api/recurring-bills/${bill.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    client_id: bill.client_id,
                    amount: bill.amount,
                    frequency: bill.frequency,
                    next_date: bill.raw_next_date,
                    is_active: nextStatus,
                    other_details: bill.other_details
                })
            });
            const data = await res.json();
            if (data.success) {
                fetchBills();
            }
        } catch (err) {
            console.error("Failed to toggle template status:", err);
        }
    };

    const handleDeleteSuccess = () => {
        setSelectedBill(null);
        fetchBills();
    };

    const filtered = bills.filter((b) => {
        const q = searchQuery.toLowerCase();
        return (
            (
                b.name.toLowerCase().includes(q) ||
                b.vendor.toLowerCase().includes(q) ||
                b.id.toLowerCase().includes(q)
            ) &&
            (selectedStatus === "All" || b.status === selectedStatus)
        );
    });

    const activeBills = bills.filter((b) => b.status === "Active");
    const monthlyPayable = activeBills.reduce((s, b) => s + toMonthly(b.amount, b.frequency), 0);
    const activeCount = activeBills.length;
    
    const today = new Date();
    const dueThisWeek = activeBills.filter((b) => {
        if (!b.nextDueDate) return false;
        const diff = (new Date(b.nextDueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
    }).length;

    const overdueCount = activeBills.filter((b) => {
        if (!b.nextDueDate) return false;
        const diff = (new Date(b.nextDueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diff < 0;
    }).length;

    const filteredMonthlyPayable = filtered
        .filter((b) => b.status === "Active")
        .reduce((s, b) => s + toMonthly(b.amount, b.frequency), 0);

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
            <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">

                {/* Page header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">Recurring Bills</h1>
                        <p className="text-[13px] text-zinc-500 mt-0.5">
                            Manage all repeating vendor bills and templates.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push("/recurring-bills/new")}
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
                        sub="Across all active templates"
                    />
                    <StatCard
                        label="Active Templates"
                        value={String(activeCount)}
                        sub={`${bills.filter((b) => b.status === "Paused").length} paused`}
                    />
                    <StatCard
                        label="Due This Week"
                        value={String(dueThisWeek)}
                        sub="Upcoming runs in 7 days"
                    />
                    <StatCard
                        label="Overdue Runs"
                        value={String(overdueCount)}
                        sub="Templates behind schedule"
                    />
                </div>

                {/* Table card */}
                <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

                    {/* Toolbar */}
                    <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <h2 className="text-[14px] font-semibold text-zinc-900">Templates Register</h2>
                            <p className="text-[12px] text-zinc-500">
                                {filtered.length} template{filtered.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Search */}
                            <div className="relative w-56">
                                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search templates or vendor..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
                                />
                            </div>

                            {/* Status filter */}
                            <div className="relative">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer text-zinc-700"
                                >
                                    <option value="All">All Status</option>
                                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                                    {[
                                        ["Bill Profile", ""],
                                        ["Frequency", ""],
                                        ["Next Run Date", ""],
                                        ["Payment Terms", ""],
                                        ["Template Total", "text-right"],
                                        ["Status", ""],
                                        ["", ""],
                                    ].map(([h, cls], i) => (
                                        <th
                                            key={i}
                                            className={cn(
                                                "px-6 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wide",
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
                                            onClick={() => setSelectedBill(bill)}
                                            className={cn(
                                                "transition-colors cursor-pointer group",
                                                severity === "soon"
                                                    ? "bg-amber-50/40 hover:bg-amber-50/70"
                                                    : severity === "overdue"
                                                        ? "bg-red-50/30 hover:bg-red-50/60"
                                                        : "hover:bg-zinc-50/70",
                                            )}
                                        >
                                            {/* Bill profile name + vendor */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                                                        <Receipt className="w-3.5 h-3.5 text-zinc-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-semibold text-zinc-800">{bill.name}</p>
                                                        <p className="text-[12px] text-zinc-400">{bill.vendor || "—"}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Frequency */}
                                            <td className="px-6 py-4">
                                                <FreqBadge freq={bill.frequency} />
                                            </td>

                                            {/* Next due */}
                                            <td className="px-6 py-4">
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
                                            <td className="px-6 py-4 text-[13px] text-zinc-500">{bill.paymentTerms}</td>

                                            {/* Amount */}
                                            <td className="px-6 py-4 text-right font-mono text-[13px] font-semibold text-zinc-950 tabular-nums">
                                                {fmt(bill.amount)}
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <StatusPill status={bill.status} />
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center gap-1">
                                                    {bill.status !== "Ended" && (
                                                        <button
                                                            onClick={() => toggleStatus(bill)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 border border-zinc-200 hover:border-zinc-300 bg-white rounded-lg transition-all shadow-sm active:scale-95"
                                                        >
                                                            {bill.status === "Active" ? (
                                                                <><Pause className="w-3 h-3 text-zinc-400" /> Pause</>
                                                            ) : (
                                                                <><Play className="w-3 h-3 text-zinc-400" /> Resume</>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Receipt className="w-6 h-6 text-zinc-200" />
                                                <p className="text-[13px] text-zinc-400">No templates match your filters.</p>
                                                <button
                                                    onClick={() => {
                                                        setSearchQuery("");
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
                    </div>

                    {/* Footer */}
                    {filtered.length > 0 && (
                        <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                            <span className="text-[12px] text-zinc-400">
                                {filtered.length} template{filtered.length !== 1 ? "s" : ""}
                            </span>
                            <span className="text-[13px] font-semibold text-zinc-900 tabular-nums font-mono">
                                Monthly payable: {fmt(Math.round(filteredMonthlyPayable))}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Viewer Details Modal */}
            {selectedBill && (
                <RecurringBillDetailsModal
                    bill={selectedBill}
                    onClose={() => setSelectedBill(null)}
                    onDeleteSuccess={handleDeleteSuccess}
                />
            )}

            {/* Loading Spinner */}
            {loading && (
                <div className="fixed inset-0 bg-[#FAFAFA]/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="w-6 h-6 text-zinc-500 animate-spin" />
                        <p className="text-[13px] text-zinc-500">Loading templates...</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Recurring Bill Details Modal
// ---------------------------------------------------------------------------
interface DetailsModalProps {
    bill: RecurringBill;
    onClose: () => void;
    onDeleteSuccess: () => void;
}

function RecurringBillDetailsModal({ bill, onClose, onDeleteSuccess }: DetailsModalProps) {
    const [deleting, setDeleting] = useState(false);
    const rawDetails = bill.other_details || {};
    const items = rawDetails.items || [];

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this recurring bill template?")) return;
        setDeleting(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8888/api/recurring-bills/${bill.id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                onDeleteSuccess();
            } else {
                alert(data.message || "Failed to delete template");
            }
        } catch (err) {
            console.error(err);
            alert("Error deleting template");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-[800px] my-8 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-[16px] font-bold text-zinc-900">Recurring Bill Template</h3>
                            <span className="font-mono text-xs text-zinc-500">#{bill.id}</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Status: {bill.status}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto flex-grow">
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Vendor</p>
                            <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">{bill.vendor}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Profile Name</p>
                            <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">{bill.name}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Repeat Every</p>
                            <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">{bill.frequency}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Start Date</p>
                            <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">{bill.startDate || "—"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Ends On</p>
                            <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">{rawDetails.never_expires ? "Never Expires" : (rawDetails.end_date || "—")}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">A/P Account</p>
                            <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">{rawDetails.ap_account || "Accounts Payable"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Payment Terms</p>
                            <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">{bill.paymentTerms || "Due on Receipt"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Reverse Charge</p>
                            <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">{rawDetails.reverse_charge ? "Yes" : "No"}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div>
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Line Items Table</h4>
                        <div className="border border-zinc-200 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-200 bg-zinc-50/50">
                                        <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500">Details</th>
                                        <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 w-32">Account</th>
                                        <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 w-16 text-right">Qty</th>
                                        <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 w-24 text-right">Rate</th>
                                        <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 w-20 text-center">Tax</th>
                                        <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 w-28 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {items.map((item: any, i: number) => (
                                        <tr key={i} className="hover:bg-zinc-50/20">
                                            <td className="px-4 py-2 text-[13px] text-zinc-800 font-medium">{item.description}</td>
                                            <td className="px-4 py-2 text-[13px] text-zinc-600">{item.account || "—"}</td>
                                            <td className="px-4 py-2 text-[13px] text-zinc-600 font-mono text-right tabular-nums">{parseFloat(item.quantity).toFixed(2)}</td>
                                            <td className="px-4 py-2 text-[13px] text-zinc-600 font-mono text-right tabular-nums">₹{parseFloat(item.rate).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                            <td className="px-4 py-2 text-[13px] text-zinc-600 text-center">{item.tax_rate}%</td>
                                            <td className="px-4 py-2 text-[13px] font-semibold text-zinc-800 font-mono text-right tabular-nums">₹{parseFloat(item.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-6 text-center text-xs text-zinc-400 italic">No line items mapped.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pricing Summary */}
                    <div className="flex justify-end pt-2">
                        <div className="w-64 bg-zinc-50 p-4 border border-zinc-100 rounded-xl space-y-2 text-xs">
                            <div className="flex justify-between text-zinc-500">
                                <span>Sub Total</span>
                                <span className="font-mono">₹{parseFloat(bill.amount as any).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-zinc-500">
                                <span>Discount ({rawDetails.discount_val || "0"}{rawDetails.discount_type || "%"})</span>
                                <span className="font-mono">- ₹{(rawDetails.discount_type === "%" ? (parseFloat(bill.amount as any) * (parseFloat(rawDetails.discount_val) || 0)) / 100 : (parseFloat(rawDetails.discount_val) || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-zinc-500">
                                <span>TDS ({rawDetails.tds_rate || "0"}%)</span>
                                <span className="font-mono">- ₹{((parseFloat(bill.amount as any) * (parseFloat(rawDetails.tds_rate) || 0)) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-zinc-500">
                                <span>Adjustment</span>
                                <span className="font-mono">₹{parseFloat(rawDetails.adjustment || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between font-bold text-zinc-900 border-t border-zinc-200 pt-2 text-sm">
                                <span>Grand Total</span>
                                <span className="font-mono text-[#5B5FEF]">₹{parseFloat(bill.amount as any).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Notes</h4>
                        <div className="p-3 bg-zinc-50 rounded-lg text-xs text-zinc-600 border border-zinc-100 min-h-[60px] whitespace-pre-wrap">
                            {rawDetails.notes || "—"}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between flex-shrink-0">
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                    >
                        {deleting ? "Deleting..." : "Delete Template"}
                    </button>
                    
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}