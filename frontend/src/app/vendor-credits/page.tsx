"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
    UploadCloud,
    FileText,
    ArrowLeft,
    Trash2,
    Settings,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types & Configs
// ---------------------------------------------------------------------------
type CreditStatus = "Draft" | "Open" | "Refunded" | "Void" | "Partially Used" | "Fully Used" | "Expired";
type CreditReason =
    | "Return"
    | "Overpayment"
    | "Discount"
    | "Price Adjustment"
    | "Other";

interface CreditItem {
    id: string;
    itemDetails: string;
    account: string;
    quantity: number;
    rate: number;
    taxRate: number; // e.g. 18 for 18% GST
    amount: number;
}

interface VendorCredit {
    id: string;
    creditNo: string;
    vendor: string;
    clientId: number;
    creditNoteRef?: string;
    linkedBill?: string;
    issueDate: string; // ISO
    issueDateLabel: string;
    expiryDate?: string;
    expiryDateLabel?: string;
    amount: number;
    amountUsed: number;
    reason: CreditReason;
    status: CreditStatus;
    notes?: string;
    
    // Advanced fields
    orderNumber?: string;
    subject?: string;
    accountsPayable?: string;
    reverseCharge?: boolean;
    items?: CreditItem[];
    subTotal?: number;
    discountPct?: number;
    discountAmount?: number;
    tds?: string;
    tcs?: string;
    adjustment?: number;
    total?: number;
}

interface Vendor {
    id: number;
    name: string;
    custom_id: string;
}

const STATUS_CONFIG: Record<
    CreditStatus,
    { dot: string; text: string; bg: string }
> = {
    "Draft": { dot: "bg-zinc-400", text: "text-zinc-600", bg: "bg-zinc-100" },
    "Open": { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
    "Partially Used": { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" },
    "Fully Used": { dot: "bg-zinc-400", text: "text-zinc-600", bg: "bg-zinc-100" },
    "Expired": { dot: "bg-red-400", text: "text-red-700", bg: "bg-red-50" },
    "Refunded": { dot: "bg-indigo-500", text: "text-indigo-700", bg: "bg-indigo-50" },
    "Void": { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
};

const REASONS: CreditReason[] = [
    "Return", "Overpayment", "Discount", "Price Adjustment", "Other",
];

// Helper to read cookie values in browser
function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
}

// Dynamically resolve API URL using current browser hostname
const getApiUrl = (path: string) => {
    if (typeof window !== "undefined") {
        const hostname = window.location.hostname;
        return `http://${hostname}:8888${path}`;
    }
    return `http://localhost:8888${path}`;
};

function fmt(n: number) {
    return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function VendorCredits() {
    const router = useRouter();

    // Views
    const [view, setView] = useState<"list" | "create">("list");

    // Data lists
    const [credits, setCredits] = useState<VendorCredit[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [debugError, setDebugError] = useState<string | null>(null);

    // List view filters
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [selectedReason, setSelectedReason] = useState("All");

    // Form inputs state
    const [formVendorId, setFormVendorId] = useState("");
    const [formCreditNo, setFormCreditNo] = useState("");
    const [formOrderNo, setFormOrderNo] = useState("");
    const [formCreditDate, setFormCreditDate] = useState("");
    const [formSubject, setFormSubject] = useState("");
    const [formAccountsPayable, setFormAccountsPayable] = useState("Accounts Payable");
    const [formReverseCharge, setFormReverseCharge] = useState(false);
    const [formNotes, setFormNotes] = useState("");
    const [attachments, setAttachments] = useState<File[]>([]);

    // Item Table state
    const [items, setItems] = useState<CreditItem[]>([
        {
            id: "item-1",
            itemDetails: "",
            account: "Cost of Goods Sold",
            quantity: 1,
            rate: 0,
            taxRate: 0,
            amount: 0,
        }
    ]);

    // Summary Adjustments
    const [discountPct, setDiscountPct] = useState<number>(0);
    const [tdsRate, setTdsRate] = useState<string>(""); // Selection e.g. "1", "2", "10" or empty
    const [tcsRate, setTcsRate] = useState<string>(""); // Selection e.g. "0.1" or empty
    const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);

    // Fetch lists from backend
    const fetchData = async () => {
        setLoading(true);
        setDebugError(null);
        const token = (typeof window !== "undefined" ? localStorage.getItem("token") : null) || getCookie("token");

        try {
            // 1. Fetch vendor list
            const vRes = await fetch(getApiUrl("/api/client/list?type=vendor"), {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const vData = await vRes.json();
            if (vData.success) {
                setVendors(vData.clients || vData.data || []);
            }

            // 2. Fetch credits list
            const cRes = await fetch(getApiUrl("/api/vendor-credits"), {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const cData = await cRes.json();
            if (cData.success && cData.vendorCredits) {
                const mapped: VendorCredit[] = cData.vendorCredits.map((item: any) => {
                    const issueDateObj = new Date(item.date);
                    return {
                        id: String(item.id),
                        creditNo: item.credit_number,
                        vendor: item.client_name || "Unknown Vendor",
                        clientId: item.client_id,
                        creditNoteRef: item.reason || "",
                        issueDate: item.date,
                        issueDateLabel: issueDateObj.toLocaleDateString("en-IN", {
                            month: "short", day: "numeric", year: "numeric",
                        }),
                        amount: parseFloat(item.amount) || 0,
                        amountUsed: parseFloat(item.amount) - (parseFloat(item.balance) || 0),
                        reason: (item.reason || "Other") as CreditReason,
                        status: (item.status || "Open") as CreditStatus,
                        notes: item.notes || "",
                        orderNumber: item.order_number || "",
                        subject: item.subject || "",
                        accountsPayable: item.accounts_payable || "Accounts Payable",
                        reverseCharge: !!item.reverse_charge,
                        subTotal: parseFloat(item.sub_total) || 0,
                        discountPct: parseFloat(item.discount_pct) || 0,
                        discountAmount: parseFloat(item.discount_amount) || 0,
                        tds: item.tds || "",
                        tcs: item.tcs || "",
                        adjustment: parseFloat(item.adjustment) || 0,
                        total: parseFloat(item.total) || 0,
                    };
                });
                setCredits(mapped);
            }
        } catch (err: any) {
            setDebugError("Could not retrieve vendor credits from API backend. Falling back to local data.\nError: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Calculate totals dynamically
    const subTotal = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    }, [items]);

    const discountAmount = useMemo(() => {
        return (subTotal * (discountPct || 0)) / 100;
    }, [subTotal, discountPct]);

    const afterDiscount = subTotal - discountAmount;

    const taxAmount = useMemo(() => {
        // Calculate tax based on items
        return items.reduce((sum, item) => {
            const itemBase = (item.quantity * item.rate);
            const itemDisc = itemBase * (discountPct || 0) / 100;
            return sum + ((itemBase - itemDisc) * (item.taxRate || 0)) / 100;
        }, 0);
    }, [items, discountPct]);

    const tdsAmount = useMemo(() => {
        if (!tdsRate) return 0;
        const rate = parseFloat(tdsRate) || 0;
        return (afterDiscount * rate) / 100;
    }, [afterDiscount, tdsRate]);

    const tcsAmount = useMemo(() => {
        if (!tcsRate) return 0;
        const rate = parseFloat(tcsRate) || 0;
        return (afterDiscount * rate) / 100;
    }, [afterDiscount, tcsRate]);

    const total = useMemo(() => {
        return Math.max(0, afterDiscount + taxAmount - tdsAmount + tcsAmount + (adjustmentAmount || 0));
    }, [afterDiscount, taxAmount, tdsAmount, tcsAmount, adjustmentAmount]);

    // Handle opening of creation form
    const openCreateForm = () => {
        const nextNum = `VCRD-${Date.now().toString().slice(-6)}`;
        setFormCreditNo(nextNum);
        setFormCreditDate(new Date().toISOString().split("T")[0]);
        setFormVendorId("");
        setFormOrderNo("");
        setFormSubject("");
        setFormAccountsPayable("Accounts Payable");
        setFormReverseCharge(false);
        setFormNotes("");
        setAttachments([]);
        setDiscountPct(0);
        setTdsRate("");
        setTcsRate("");
        setAdjustmentAmount(0);
        setItems([
            {
                id: "item-1",
                itemDetails: "",
                account: "Cost of Goods Sold",
                quantity: 1,
                rate: 0,
                taxRate: 0,
                amount: 0,
            }
        ]);
        setView("create");
    };

    // Item row editing helpers
    const addItemRow = () => {
        setItems([
            ...items,
            {
                id: `item-${Date.now()}`,
                itemDetails: "",
                account: "Cost of Goods Sold",
                quantity: 1,
                rate: 0,
                taxRate: 0,
                amount: 0,
            }
        ]);
    };

    const removeItemRow = (id: string) => {
        if (items.length === 1) return;
        setItems(items.filter((item) => item.id !== id));
    };

    const updateItemField = (id: string, field: keyof CreditItem, val: any) => {
        setItems(items.map((item) => {
            if (item.id !== id) return item;
            const updated = { ...item, [field]: val };
            if (field === "quantity" || field === "rate") {
                updated.amount = updated.quantity * updated.rate;
            }
            return updated;
        }));
    };

    // Attachment uploading
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const list = Array.from(e.target.files).filter((f) => f.size / (1024 * 1024) <= 10);
            if (attachments.length + list.length > 5) {
                alert("You can upload a maximum of 5 files.");
                return;
            }
            setAttachments([...attachments, ...list]);
        }
    };
    const removeAttachment = (idx: number) => setAttachments(attachments.filter((_, i) => i !== idx));

    // Submit form handler
    const handleSubmitCredit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formVendorId) {
            alert("Please select a vendor.");
            return;
        }

        const selectedVendor = vendors.find((v) => v.id === parseInt(formVendorId));
        if (!selectedVendor) return;

        const dateObj = new Date(formCreditDate);
        const dateLabel = dateObj.toLocaleDateString("en-IN", {
            month: "short", day: "numeric", year: "numeric",
        });

        const payload = {
            credit_number: formCreditNo,
            client_id: selectedVendor.id,
            bill_id: null,
            date: formCreditDate,
            amount: total,
            balance: total,
            status: "Open",
            reason: "Return", // Default category fallback
            order_number: formOrderNo,
            subject: formSubject,
            accounts_payable: formAccountsPayable,
            reverse_charge: formReverseCharge,
            items: items.map((item) => ({
                details: item.itemDetails,
                account: item.account,
                quantity: item.quantity,
                rate: item.rate,
                tax_rate: item.taxRate,
                amount: item.quantity * item.rate
            })),
            sub_total: subTotal,
            discount_pct: discountPct,
            discount_amount: discountAmount,
            tds: tdsRate ? `${tdsRate}%` : "",
            tcs: tcsRate ? `${tcsRate}%` : "",
            adjustment: adjustmentAmount,
            total: total,
            notes: formNotes,
            attachments: attachments.map((f) => ({ name: f.name, size: f.size }))
        };

        const token = (typeof window !== "undefined" ? localStorage.getItem("token") : null) || getCookie("token");

        try {
            const response = await fetch(getApiUrl("/api/vendor-credits"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });
            const resData = await response.json();
            if (resData.success) {
                await fetchData();
            } else {
                // local fallback state if API fails
                setCredits([
                    {
                        id: `VC-${Date.now()}`,
                        creditNo: formCreditNo,
                        vendor: selectedVendor.name,
                        clientId: selectedVendor.id,
                        issueDate: formCreditDate,
                        issueDateLabel: dateLabel,
                        amount: total,
                        amountUsed: 0,
                        reason: "Return",
                        status: "Open",
                        notes: formNotes || undefined,
                        orderNumber: formOrderNo || undefined,
                        subject: formSubject || undefined,
                    },
                    ...credits
                ]);
            }
        } catch (err) {
            // fallback local push
            setCredits([
                {
                    id: `VC-${Date.now()}`,
                    creditNo: formCreditNo,
                    vendor: selectedVendor.name,
                    clientId: selectedVendor.id,
                    issueDate: formCreditDate,
                    issueDateLabel: dateLabel,
                    amount: total,
                    amountUsed: 0,
                    reason: "Return",
                    status: "Open",
                    notes: formNotes || undefined,
                    orderNumber: formOrderNo || undefined,
                    subject: formSubject || undefined,
                },
                ...credits
            ]);
        }

        setView("list");
    };

    // Filter vendor credits logic
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

    // Stats calculations
    const openCredits = credits.filter((c) => c.status === "Open" || c.status === "Partially Used");
    const totalAvailable = openCredits.reduce((s, c) => s + (c.amount - c.amountUsed), 0);
    const totalApplied = credits.reduce((s, c) => s + c.amountUsed, 0);
    const openCount = openCredits.length;

    // Export helper
    const handleExportCSV = () => {
        const headers = ["Credit No", "Vendor", "Issue Date", "Amount", "Balance Remaining", "Status"];
        const rows = filtered.map((c) => [
            c.creditNo, c.vendor, c.issueDateLabel, c.amount.toFixed(2), (c.amount - c.amountUsed).toFixed(2), c.status
        ]);
        const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "vendor-credits.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // RENDER: CREATE FORM SCREEN
    // ─────────────────────────────────────────────────────────────────────────────
    if (view === "create") {
        return (
            <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased text-zinc-800">
                <div className="max-w-[960px] mx-auto px-6 py-8 space-y-6">

                    {/* Header bar */}
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => setView("list")}
                                className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <div>
                                <h1 className="text-[20px] font-semibold text-zinc-900 tracking-tight">New Vendor Credits</h1>
                                <p className="text-[12px] text-zinc-500">Record a credit note received from your vendor or supplier</p>
                            </div>
                        </div>
                        <span className="text-[11px] font-semibold text-[#5B5FEF] bg-[#5B5FEF]/10 px-3 py-1 rounded-full">Credit Note</span>
                    </div>

                    <form onSubmit={handleSubmitCredit} className="space-y-6">

                        {/* Primary Details Row */}
                        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* Vendor Name */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">
                                    Vendor Name <span className="text-red-500">*</span>
                                </label>
                                <select required value={formVendorId} onChange={(e) => setFormVendorId(e.target.value)}
                                    className="w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 cursor-pointer text-zinc-800 transition-colors">
                                    <option value="">Select Vendor</option>
                                    {vendors.map((v) => (<option key={v.id} value={v.id}>{v.name} ({v.custom_id})</option>))}
                                </select>
                            </div>

                            {/* Credit Note# */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">
                                    Credit Note# <span className="text-red-500">*</span>
                                </label>
                                <input type="text" required value={formCreditNo} onChange={(e) => setFormCreditNo(e.target.value)}
                                    className="w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 text-zinc-800 transition-colors font-mono" />
                            </div>

                            {/* Order Number */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Order Number</label>
                                <input type="text" placeholder="e.g. PO-88319" value={formOrderNo} onChange={(e) => setFormOrderNo(e.target.value)}
                                    className="w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 text-zinc-800 transition-colors" />
                            </div>

                            {/* Vendor Credit Date */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">
                                    Vendor Credit Date <span className="text-red-500">*</span>
                                </label>
                                <input type="date" required value={formCreditDate} onChange={(e) => setFormCreditDate(e.target.value)}
                                    className="w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 text-zinc-800 transition-colors" />
                            </div>

                            {/* Subject */}
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Subject</label>
                                <input type="text" maxLength={250} placeholder="Enter a subject within 250 characters" value={formSubject} onChange={(e) => setFormSubject(e.target.value)}
                                    className="w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 text-zinc-800 transition-colors" />
                            </div>

                            {/* Accounts Payable */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Accounts Payable</label>
                                <select value={formAccountsPayable} onChange={(e) => setFormAccountsPayable(e.target.value)}
                                    className="w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 cursor-pointer text-zinc-800 transition-colors">
                                    <option value="Accounts Payable">Accounts Payable (21000)</option>
                                    <option value="Trade Creditors">Trade Creditors (21100)</option>
                                </select>
                            </div>

                            {/* Reverse Charge checkbox */}
                            <div className="flex items-center pt-6">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <div className="relative mt-0.5">
                                        <input type="checkbox" checked={formReverseCharge} onChange={(e) => setFormReverseCharge(e.target.checked)} className="sr-only peer" />
                                        <div className="w-9 h-5 bg-zinc-200 peer-checked:bg-[#5B5FEF] rounded-full transition-colors" />
                                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-semibold text-zinc-850">Reverse Charge</p>
                                        <p className="text-[11px] text-zinc-400 mt-0.5">This transaction is applicable for reverse charge</p>
                                    </div>
                                </label>
                            </div>

                        </div>

                        {/* Item Table Card */}
                        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50/50">
                                <h3 className="text-[14px] font-semibold text-zinc-900">Item Table</h3>
                                <p className="text-[12px] text-zinc-450">List products, rate reductions, or items returned for credits</p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[700px]">
                                    <thead>
                                        <tr className="border-b border-zinc-200 bg-zinc-50/30">
                                            <th className="px-5 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Item Details</th>
                                            <th className="px-5 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wide w-[200px]">Account</th>
                                            <th className="px-5 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wide text-right w-[100px]">Quantity</th>
                                            <th className="px-5 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wide text-right w-[130px]">Rate</th>
                                            <th className="px-5 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wide w-[120px]">Tax</th>
                                            <th className="px-5 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wide text-right w-[120px]">Amount</th>
                                            <th className="px-4 py-3 w-[50px]"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((row, idx) => (
                                            <tr key={row.id} className="border-b border-zinc-100 hover:bg-zinc-50/30 transition-colors">
                                                {/* Item Details */}
                                                <td className="px-5 py-3">
                                                    <input type="text" placeholder="Product details or credit description..." required
                                                        value={row.itemDetails} onChange={(e) => updateItemField(row.id, "itemDetails", e.target.value)}
                                                        className="w-full px-2.5 py-1.5 text-[13px] border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-[#5B5FEF]" />
                                                </td>

                                                {/* Account */}
                                                <td className="px-5 py-3">
                                                    <select value={row.account} onChange={(e) => updateItemField(row.id, "account", e.target.value)}
                                                        className="w-full px-2.5 py-1.5 text-[13px] border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-[#5B5FEF] cursor-pointer bg-white">
                                                        <option value="Cost of Goods Sold">Cost of Goods Sold</option>
                                                        <option value="Inventory Asset">Inventory Asset</option>
                                                        <option value="Office Supplies">Office Supplies</option>
                                                        <option value="Rent Expense">Rent Expense</option>
                                                        <option value="Consulting Expense">Consulting Expense</option>
                                                    </select>
                                                </td>

                                                {/* Quantity */}
                                                <td className="px-5 py-3 text-right">
                                                    <input type="number" required min={0} step="1"
                                                        value={row.quantity} onChange={(e) => updateItemField(row.id, "quantity", parseInt(e.target.value) || 0)}
                                                        className="w-full px-2 py-1.5 text-right text-[13px] border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-[#5B5FEF]" />
                                                </td>

                                                {/* Rate */}
                                                <td className="px-5 py-3 text-right">
                                                    <input type="number" required min={0} step="0.01"
                                                        value={row.rate || ""} onChange={(e) => updateItemField(row.id, "rate", parseFloat(e.target.value) || 0)}
                                                        className="w-full px-2 py-1.5 text-right text-[13px] border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-[#5B5FEF]" />
                                                </td>

                                                {/* Tax selection */}
                                                <td className="px-5 py-3">
                                                    <select value={row.taxRate} onChange={(e) => updateItemField(row.id, "taxRate", parseInt(e.target.value) || 0)}
                                                        className="w-full px-2.5 py-1.5 text-[13px] border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-[#5B5FEF] cursor-pointer bg-white">
                                                        <option value="0">GST 0%</option>
                                                        <option value="5">GST 5%</option>
                                                        <option value="12">GST 12%</option>
                                                        <option value="18">GST 18%</option>
                                                        <option value="28">GST 28%</option>
                                                    </select>
                                                </td>

                                                {/* Calculated amount */}
                                                <td className="px-5 py-3 text-right font-mono text-[13px] font-semibold text-zinc-700">
                                                    {(row.quantity * row.rate).toFixed(2)}
                                                </td>

                                                {/* Action row delete */}
                                                <td className="px-4 py-3 text-center">
                                                    <button type="button" disabled={items.length === 1} onClick={() => removeItemRow(row.id)}
                                                        className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-red-500 disabled:opacity-30 disabled:pointer-events-none transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Table controls */}
                            <div className="px-5 py-3 border-t border-zinc-100 flex justify-between items-center bg-zinc-50/10">
                                <button type="button" onClick={addItemRow}
                                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#5B5FEF] hover:text-[#4a4ed8] hover:underline transition-colors">
                                    <Plus className="w-3.5 h-3.5" />
                                    Add another line
                                </button>
                                <div className="text-[12px] text-zinc-450">
                                    Total Items: {items.length}
                                </div>
                            </div>
                        </div>

                        {/* Calculations summary and note blocks */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Calculation Metrics Summary */}
                            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                                <h3 className="text-[14px] font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Calculation Metrics</h3>
                                
                                {/* Sub Total */}
                                <div className="flex justify-between items-center py-1 border-b border-zinc-50 text-[13px]">
                                    <span className="text-zinc-500 font-medium">Sub Total</span>
                                    <span className="font-mono font-semibold text-zinc-900">{subTotal.toFixed(2)}</span>
                                </div>

                                {/* Discount */}
                                <div className="flex justify-between items-center py-1 border-b border-zinc-50 text-[13px] gap-4">
                                    <span className="text-zinc-500 font-medium flex items-center gap-1 shrink-0">
                                        Discount
                                        <div className="flex items-center border border-zinc-200 rounded px-1 text-[11px] bg-zinc-50">
                                            <input type="number" min={0} max={100} value={discountPct || ""} onChange={(e) => setDiscountPct(parseFloat(e.target.value) || 0)}
                                                className="w-8 border-0 bg-transparent py-0.5 text-center focus:outline-none font-mono" />
                                            <span>%</span>
                                        </div>
                                    </span>
                                    <span className="font-mono font-semibold text-zinc-650">- {discountAmount.toFixed(2)}</span>
                                </div>

                                {/* Tax calculation */}
                                <div className="flex justify-between items-center py-1 border-b border-zinc-50 text-[13px]">
                                    <span className="text-zinc-500 font-medium">GST Tax Amount</span>
                                    <span className="font-mono font-semibold text-zinc-700">+ {taxAmount.toFixed(2)}</span>
                                </div>

                                {/* TDS selector */}
                                <div className="flex justify-between items-center py-1 border-b border-zinc-50 text-[13px] gap-2">
                                    <span className="text-zinc-500 font-medium flex items-center gap-1 shrink-0">
                                        TDS
                                        <select value={tdsRate} onChange={(e) => setTdsRate(e.target.value)}
                                            className="ml-1 border border-zinc-200 rounded px-1 py-0.5 text-[11px] bg-white cursor-pointer focus:outline-none">
                                            <option value="">No TDS</option>
                                            <option value="1">1% (Contract)</option>
                                            <option value="2">2% (Services)</option>
                                            <option value="10">10% (Prof.)</option>
                                        </select>
                                    </span>
                                    <span className="font-mono font-semibold text-zinc-650">- {tdsAmount.toFixed(2)}</span>
                                </div>

                                {/* TCS selector */}
                                <div className="flex justify-between items-center py-1 border-b border-zinc-50 text-[13px] gap-2">
                                    <span className="text-zinc-500 font-medium flex items-center gap-1 shrink-0">
                                        TCS
                                        <select value={tcsRate} onChange={(e) => setTcsRate(e.target.value)}
                                            className="ml-1 border border-zinc-200 rounded px-1 py-0.5 text-[11px] bg-white cursor-pointer focus:outline-none">
                                            <option value="">No TCS</option>
                                            <option value="0.1">0.1%</option>
                                            <option value="0.75">0.75%</option>
                                            <option value="1.0">1.0%</option>
                                        </select>
                                    </span>
                                    <span className="font-mono font-semibold text-zinc-700">+ {tcsAmount.toFixed(2)}</span>
                                </div>

                                {/* Adjustment */}
                                <div className="flex justify-between items-center py-1 border-b border-zinc-50 text-[13px] gap-4">
                                    <span className="text-zinc-500 font-medium shrink-0">Adjustment</span>
                                    <input type="number" step="0.01" placeholder="0.00" value={adjustmentAmount || ""} onChange={(e) => setAdjustmentAmount(parseFloat(e.target.value) || 0)}
                                        className="w-24 px-2 py-0.5 text-right font-mono text-[13px] border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-[#5B5FEF]" />
                                </div>

                                {/* Total */}
                                <div className="flex justify-between items-center py-2 bg-zinc-50 px-3 rounded-lg text-[14px] font-bold">
                                    <span className="text-zinc-900">Total</span>
                                    <span className="font-mono text-[#5B5FEF] tabular-nums">{fmt(total)}</span>
                                </div>

                            </div>

                            {/* Notes and descriptions */}
                            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                                <h3 className="text-[14px] font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Notes</h3>
                                <textarea rows={5} placeholder="Add any details, remarks, or client-visible notes..."
                                    value={formNotes} onChange={(e) => setFormNotes(e.target.value)}
                                    className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 text-zinc-800 resize-none font-sans" />
                            </div>

                        </div>

                        {/* File Attachments upload section */}
                        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                            <h3 className="text-[14px] font-semibold text-zinc-900">Attach File(s) to Vendor Credits</h3>
                            <div className="border-2 border-dashed border-zinc-200 rounded-xl p-6 flex flex-col items-center justify-center bg-zinc-50/50 hover:bg-zinc-50 cursor-pointer transition-colors relative">
                                <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                <UploadCloud className="w-8 h-8 text-zinc-400 mb-2" />
                                <p className="text-[13px] font-medium text-zinc-700">Drag & Drop files here or click to browse</p>
                                <p className="text-[11px] text-zinc-400 mt-1">You can upload a maximum of 5 files, 10MB each</p>
                            </div>

                            {attachments.length > 0 && (
                                <div className="space-y-2 pt-2">
                                    {attachments.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-zinc-400" />
                                                <span className="text-[13px] text-zinc-700 truncate max-w-[200px]">{file.name}</span>
                                                <span className="text-[11px] text-zinc-400 font-mono">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                            </div>
                                            <button type="button" onClick={() => removeAttachment(idx)}
                                                className="p-1 hover:bg-zinc-200 rounded text-zinc-400 hover:text-zinc-650 transition-colors">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Action buttons footer */}
                        <div className="flex items-center gap-3 pt-2 justify-end">
                            <button type="button" onClick={() => setView("list")}
                                className="px-5 py-2.5 text-[13px] font-semibold text-zinc-700 border border-zinc-200 bg-white rounded-lg hover:bg-zinc-50 transition-colors shadow-xs">
                                Cancel
                            </button>
                            <button type="submit"
                                className="px-6 py-2.5 text-[13px] font-semibold text-white bg-[#5B5FEF] hover:bg-[#4a4ed8] rounded-lg transition-colors shadow-sm">
                                Save Credit Note
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // RENDER: PAYMENTS MADE LEDGER LIST VIEW
    // ─────────────────────────────────────────────────────────────────────────────
    return (
        <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased text-zinc-800">
            <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">

                {/* Debug info */}
                {debugError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-[12px] text-red-700 font-mono whitespace-pre-wrap shadow-xs">
                        <strong>API Diagnostics Warning:</strong>
                        <p className="mt-1">{debugError}</p>
                    </div>
                )}

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
                            onClick={handleExportCSV}
                            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-700 border border-zinc-200 bg-white hover:bg-zinc-50 px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                        <button
                            onClick={openCreateForm}
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
                        label="Total Credit Registered"
                        value={String(credits.length)}
                        sub="All recorded entries"
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

                            {/* Status filter */}
                            <div className="relative">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer"
                                >
                                    <option value="All">All Status</option>
                                    <option value="Open">Open</option>
                                    <option value="Partially Used">Partially Used</option>
                                    <option value="Fully Used">Fully Used</option>
                                    <option value="Expired">Expired</option>
                                    <option value="Refunded">Refunded</option>
                                    <option value="Void">Void</option>
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
                                    ["Credit No", ""],
                                    ["Vendor", ""],
                                    ["Subject", ""],
                                    ["Issue Date", ""],
                                    ["Credit Amount", "text-right"],
                                    ["Balance Remaining", "text-right"],
                                    ["Status", ""],
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
                                return (
                                    <tr
                                        key={credit.id}
                                        className="transition-colors hover:bg-zinc-50/70"
                                    >
                                        {/* Credit No */}
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                                                    <Tag className="w-3.5 h-3.5 text-zinc-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-medium text-zinc-900">{credit.creditNo}</p>
                                                    {credit.orderNumber && (
                                                        <p className="text-[11px] font-mono text-zinc-400">Ord: {credit.orderNumber}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Vendor */}
                                        <td className="px-5 py-3 text-[13px] text-zinc-700 font-medium">
                                            {credit.vendor}
                                        </td>

                                        {/* Subject */}
                                        <td className="px-5 py-3 text-[13px] text-zinc-500 max-w-[200px] truncate">
                                            {credit.subject || "—"}
                                        </td>

                                        {/* Issue Date */}
                                        <td className="px-5 py-3 text-[13px] text-zinc-500 whitespace-nowrap">
                                            {credit.issueDateLabel}
                                        </td>

                                        {/* Credit Amount */}
                                        <td className="px-5 py-3 text-right font-mono text-[13px] font-semibold text-zinc-900 tabular-nums">
                                            {fmt(credit.amount)}
                                        </td>

                                        {/* Balance Remaining */}
                                        <td className="px-5 py-3 text-right font-mono text-[13px] font-semibold text-emerald-600 tabular-nums">
                                            {fmt(credit.amount - credit.amountUsed)}
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-3">
                                            <StatusPill status={credit.status} />
                                        </td>
                                    </tr>
                                );
                            })}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Tag className="w-6 h-6 text-zinc-200" />
                                            <p className="text-[13px] text-zinc-400">No vendor credits match your filters.</p>
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

                    {/* Footer */}
                    {filtered.length > 0 && (
                        <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                            <span className="text-[12px] text-zinc-400">
                                {filtered.length} credit{filtered.length !== 1 ? "s" : ""}
                            </span>
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
        </div>
    );
}

function StatCard({
    label, value, sub,
}: {
    label: string; value: string; sub?: string;
}) {
    return (
        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 flex flex-col gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200">
            <span className="text-[13px] font-medium text-zinc-500">{label}</span>
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