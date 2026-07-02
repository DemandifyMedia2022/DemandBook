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
    CreditCard,
    Download,
    CheckCheck,
    X,
    UploadCloud,
    FileText,
    ArrowLeft,
    Settings,
    Trash2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types & Configs
// ---------------------------------------------------------------------------
type PaymentStatus = "Paid" | "Pending" | "Failed" | "Cancelled";
type PaymentMethod =
    | "Bank Transfer"
    | "Credit Card"
    | "UPI"
    | "Wire"
    | "ACH"
    | "Cheque"
    | "Cash"
    | "Auto-debit";
type DateRange = "This Month" | "Last Month" | "This Quarter" | "This Year" | "All Time";

interface Payment {
    id: string;
    paymentNo: string;
    vendor: string;
    clientId: number;
    billRef?: string;
    billId?: number;
    paymentDate: string; // ISO or YYYY-MM-DD
    paymentDateLabel: string;
    method: PaymentMethod;
    txnRef?: string;
    amount: number;
    status: PaymentStatus;
    reconciled: boolean;
    notes?: string;
}

interface Vendor {
    id: number;
    custom_id: string;
    name: string;
    company_name?: string;
    balance: number;
}

interface Bill {
    id: number;
    number: string;
    client_id: number;
    amount: number;
    due_date: string;
    status: "Paid" | "Open" | "Overdue";
    created_at: string;
}

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
    "Cash": { bg: "bg-amber-50", text: "text-amber-700" },
    "Auto-debit": { bg: "bg-orange-50", text: "text-orange-700" },
};

const PAYMENT_METHODS: PaymentMethod[] = [
    "Bank Transfer", "Credit Card", "UPI", "Wire", "ACH", "Cheque", "Cash", "Auto-debit",
];
const STATUSES: PaymentStatus[] = ["Paid", "Pending", "Failed", "Cancelled"];
const DATE_RANGES: DateRange[] = ["This Month", "Last Month", "This Quarter", "This Year", "All Time"];

// Mock fallback data in case DB has no entities
const MOCK_VENDORS: Vendor[] = [
    { id: 1, custom_id: "VND-001", name: "Global Logistics Co.", company_name: "Global Logistics Ltd.", balance: 12450.0 },
    { id: 2, custom_id: "VND-002", name: "TechSystems Inc.", company_name: "TechSystems Corp.", balance: 4200.5 },
    { id: 3, custom_id: "VND-003", name: "Creative Solutions", company_name: "Rossi Designs", balance: 0.0 },
];

const MOCK_BILLS: Bill[] = [
    { id: 101, number: "BILL-2024-101", client_id: 1, amount: 15000.0, due_date: "2026-07-15", status: "Open", created_at: "2026-06-15" },
    { id: 102, number: "BILL-2024-102", client_id: 1, amount: 8000.0, due_date: "2026-07-20", status: "Open", created_at: "2026-06-20" },
    { id: 201, number: "BILL-2024-201", client_id: 2, amount: 5000.0, due_date: "2026-07-10", status: "Open", created_at: "2026-06-10" },
];

const MOCK_PAYMENTS: Payment[] = [
    {
        id: "P-001", paymentNo: "PAY-2026-001",
        vendor: "Global Logistics Co.", clientId: 1, billRef: "BILL-2024-101",
        paymentDate: "2026-06-28", paymentDateLabel: "28 Jun 2026", method: "Bank Transfer",
        txnRef: "NEFT-20260628-4521", amount: 9500,
        status: "Paid", reconciled: true,
    },
    {
        id: "P-002", paymentNo: "PAY-2026-002",
        vendor: "TechSystems Inc.", clientId: 2, billRef: "BILL-2024-201",
        paymentDate: "2026-06-29", paymentDateLabel: "29 Jun 2026", method: "Auto-debit",
        txnRef: "AD-20260629-8823", amount: 4200.5,
        status: "Paid", reconciled: true,
    },
];

// Helper formatting functions
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

// ---------------------------------------------------------------------------
// KPI Stat Card Component
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

// Helper to read cookie values in the browser
function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
    return null;
}

// Dynamically resolve API URL using current browser hostname to support LAN / 192.168.x.x configurations
const getApiUrl = (path: string) => {
    if (typeof window !== "undefined") {
        const hostname = window.location.hostname;
        return `http://${hostname}:8888${path}`;
    }
    return `http://localhost:8888${path}`;
};

// ---------------------------------------------------------------------------
// Page Main Component
// ---------------------------------------------------------------------------
export default function PaymentsMade() {
    const router = useRouter();
    
    // Core state
    const [payments, setPayments] = useState<Payment[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [debugError, setDebugError] = useState<string | null>(null);

    // List view filters
    const [view, setView] = useState<"list" | "create">("list");
    const [formTab, setFormTab] = useState<"bill-payment" | "vendor-advance">("bill-payment");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMethod, setSelectedMethod] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [dateRange, setDateRange] = useState<DateRange>("This Month");

    // Form inputs state
    const [formVendorId, setFormVendorId] = useState<string>("");
    const [formPaymentNo, setFormPaymentNo] = useState("");
    const [formPaymentDate, setFormPaymentDate] = useState("");
    const [formPaymentMode, setFormPaymentMode] = useState<PaymentMethod>("Bank Transfer");
    const [formPaidThrough, setFormPaidThrough] = useState("HDFC Bank Account");
    const [formReferenceNo, setFormReferenceNo] = useState("");
    const [formAmountPaid, setFormAmountPaid] = useState<number>(0);
    const [formAmountRefunded, setFormAmountRefunded] = useState<number>(0);
    const [formNotes, setFormNotes] = useState("");
    const [attachments, setAttachments] = useState<File[]>([]);
    
    // Allocation of payments to vendor bills: { [billId]: paymentAmount }
    const [billPayments, setBillPayments] = useState<Record<number, number>>({});
    // Custom payment dates per bill in the list: { [billId]: dateString }
    const [billPaymentDates, setBillPaymentDates] = useState<Record<number, string>>({});

    // ── Vendor Advance form state ──────────────────────────────────────────
    const [vaVendorId, setVaVendorId] = useState("");
    const [vaPaymentNo, setVaPaymentNo] = useState("");
    const [vaDescription, setVaDescription] = useState("");
    const [vaAmountPaid, setVaAmountPaid] = useState<number>(0);
    const [vaReverseCharge, setVaReverseCharge] = useState(false);
    const [vaTds, setVaTds] = useState("");
    const [vaPaymentDate, setVaPaymentDate] = useState("");
    const [vaPaymentMode, setVaPaymentMode] = useState<PaymentMethod>("Bank Transfer");
    const [vaPaidThrough, setVaPaidThrough] = useState("HDFC Bank Account");
    const [vaDepositTo, setVaDepositTo] = useState("");
    const [vaReferenceNo, setVaReferenceNo] = useState("");
    const [vaNotes, setVaNotes] = useState("");
    const [vaAttachments, setVaAttachments] = useState<File[]>([]);

    // Fetch lists from backend
    const fetchData = async () => {
        setLoading(true);
        setDebugError(null);
        const token = (typeof window !== "undefined" ? localStorage.getItem("token") : null) || getCookie("token");
        
        const safeFetch = async (url: string) => {
            try {
                const res = await fetch(url, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) {
                    if (res.status === 401) {
                        return { ok: false, status: 401, error: "401 Unauthorized (Access Token is missing or invalid)" };
                    }
                    const text = await res.text();
                    return { ok: false, status: res.status, error: `Server error ${res.status}: ${text.slice(0, 80)}` };
                }
                const contentType = res.headers.get("content-type") || "";
                if (!contentType.includes("application/json")) {
                    const text = await res.text();
                    return { ok: false, status: res.status, error: `Invalid response format (expected JSON but got ${contentType}): ${text.slice(0, 80)}` };
                }
                const data = await res.json();
                return { ok: true, status: res.status, data };
            } catch (err: any) {
                console.error(`Fetch exception for ${url}:`, err);
                return { ok: false, status: 0, error: err.message || String(err) };
            }
        };

        // 1. Fetch Vendors
        const vendorResult = await safeFetch(getApiUrl("/api/client/list?type=vendor"));
        if (vendorResult.ok && vendorResult.data?.success && vendorResult.data.clients) {
            setVendors(vendorResult.data.clients);
        } else if (vendorResult.error) {
            setDebugError(prev => (prev ? prev + " | " : "") + `Vendors API: ${vendorResult.error}`);
        }

        // 2. Fetch Bills
        const billResult = await safeFetch(getApiUrl("/api/bills/list"));
        if (billResult.ok && billResult.data?.success && billResult.data.bills) {
            setBills(billResult.data.bills);
        } else if (billResult.error) {
            setDebugError(prev => (prev ? prev + " | " : "") + `Bills API: ${billResult.error}`);
        }

        // 3. Fetch Payments Made
        const pmResult = await safeFetch(getApiUrl("/api/payments-made"));
        if (pmResult.ok && pmResult.data?.success && pmResult.data.paymentsMade) {
            const mapped = pmResult.data.paymentsMade.map((p: any) => ({
                id: p.id,
                paymentNo: p.custom_id,
                vendor: p.client_name || p.company_name || "Unknown",
                clientId: p.client_id,
                billRef: p.bill_number,
                billId: p.bill_id,
                paymentDate: p.payment_date,
                paymentDateLabel: new Date(p.payment_date).toLocaleDateString("en-IN", {
                    month: "short", day: "numeric", year: "numeric"
                }),
                method: p.payment_method,
                txnRef: p.reference_number,
                amount: parseFloat(p.amount_paid),
                status: "Paid" as PaymentStatus,
                reconciled: true,
                notes: p.notes,
            }));
            setPayments(mapped);
        } else if (pmResult.error) {
            setDebugError(prev => (prev ? prev + " | " : "") + `Payments API: ${pmResult.error}`);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Generate automatic Payment # on form entry
    const openCreateForm = (tab: "bill-payment" | "vendor-advance" = "bill-payment") => {
        setFormTab(tab);
        const nextNum = `PAY-${Date.now().toString().slice(-6)}`;
        setFormPaymentNo(nextNum);
        setFormPaymentDate(new Date().toISOString().split("T")[0]);
        setFormVendorId("");
        setFormPaymentMode("Bank Transfer");
        setFormPaidThrough("HDFC Bank Account");
        setFormReferenceNo("");
        setFormAmountPaid(0);
        setFormAmountRefunded(0);
        setFormNotes("");
        setBillPayments({});
        setBillPaymentDates({});
        setAttachments([]);
        // reset VA fields too
        const advNum = `ADV-${Date.now().toString().slice(-6)}`;
        setVaPaymentNo(advNum);
        setVaVendorId("");
        setVaDescription("");
        setVaAmountPaid(0);
        setVaReverseCharge(false);
        setVaTds("");
        setVaPaymentDate(new Date().toISOString().split("T")[0]);
        setVaPaymentMode("Bank Transfer");
        setVaPaidThrough("HDFC Bank Account");
        setVaDepositTo("");
        setVaReferenceNo("");
        setVaNotes("");
        setVaAttachments([]);
        setView("create");
    };

    // Open Vendor Advance form (legacy kept for direct calls)
    const openVendorAdvanceForm = () => openCreateForm("vendor-advance");

    // Handle vendor advance file attachments
    const handleVaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const list = Array.from(e.target.files).filter((f) => f.size / (1024 * 1024) <= 10);
            if (vaAttachments.length + list.length > 5) {
                alert("You can upload a maximum of 5 files.");
                return;
            }
            setVaAttachments((prev) => [...prev, ...list]);
        }
    };
    const removeVaAttachment = (idx: number) => setVaAttachments((prev) => prev.filter((_, i) => i !== idx));

    // Submit Vendor Advance
    const handleSubmitVendorAdvance = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vaVendorId) { alert("Please select a vendor."); return; }
        const selectedVendor = vendors.find((v) => v.id === parseInt(vaVendorId));
        if (!selectedVendor) return;
        const dateLabel = new Date(vaPaymentDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
        const payload = {
            custom_id: vaPaymentNo,
            client_id: selectedVendor.id,
            bill_id: null,
            payment_date: vaPaymentDate,
            payment_method: vaPaymentMode,
            amount_paid: vaAmountPaid,
            reference_number: vaReferenceNo,
            notes: vaNotes,
            paid_through: vaPaidThrough,
            amount_refunded: 0,
            attachments: vaAttachments.map((f) => ({ name: f.name, size: f.size })),
            bill_allocations: {},
            description: vaDescription,
            deposit_to: vaDepositTo,
            reverse_charge: vaReverseCharge,
            tds: vaTds,
            type: "vendor_advance",
        };
        const token = (typeof window !== "undefined" ? localStorage.getItem("token") : null) || getCookie("token");
        try {
            const response = await fetch(getApiUrl("/api/payments-made"), {
                method: "POST",
                headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: JSON.stringify(payload),
            });
            const resData = await response.json();
            if (resData.success) { await fetchData(); }
            else {
                setPayments((prev) => [{ id: `ADV-${Date.now()}`, paymentNo: vaPaymentNo, vendor: selectedVendor.name, clientId: selectedVendor.id, paymentDate: vaPaymentDate, paymentDateLabel: dateLabel, method: vaPaymentMode, amount: vaAmountPaid, status: "Paid", reconciled: false, notes: vaNotes || undefined }, ...prev]);
            }
        } catch (err) {
            setPayments((prev) => [{ id: `ADV-${Date.now()}`, paymentNo: vaPaymentNo, vendor: selectedVendor.name, clientId: selectedVendor.id, paymentDate: vaPaymentDate, paymentDateLabel: dateLabel, method: vaPaymentMode, amount: vaAmountPaid, status: "Paid", reconciled: false, notes: vaNotes || undefined }, ...prev]);
        }
        setView("list");
    };

    // Filter bills for selected vendor
    const activeVendorBills = useMemo(() => {
        if (!formVendorId) return [];
        return bills.filter(
            (b) => b.client_id === parseInt(formVendorId) && b.status !== "Paid"
        );
    }, [bills, formVendorId]);

    // Allocation metrics
    const amountUsedForPayments = useMemo(() => {
        return Object.values(billPayments).reduce((sum, val) => sum + (val || 0), 0);
    }, [billPayments]);

    const amountInExcess = useMemo(() => {
        const excess = formAmountPaid - amountUsedForPayments - formAmountRefunded;
        return excess < 0 ? 0 : excess;
    }, [formAmountPaid, amountUsedForPayments, formAmountRefunded]);

    // Handle allocation value changes
    const handleBillAllocationChange = (billId: number, val: string) => {
        const num = parseFloat(val) || 0;
        setBillPayments((prev) => ({
            ...prev,
            [billId]: num,
        }));
    };

    // File attachments handler
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const list = Array.from(e.target.files);
            const filtered = list.filter((f) => {
                const mb = f.size / (1024 * 1024);
                return mb <= 10; // Under 10MB
            });
            
            if (attachments.length + filtered.length > 5) {
                alert("You can upload a maximum of 5 files.");
                return;
            }
            setAttachments((prev) => [...prev, ...filtered]);
        }
    };

    const removeAttachment = (idx: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== idx));
    };

    // Submit Payment Record
    const handleSubmitPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formVendorId) {
            alert("Please select a vendor.");
            return;
        }

        const selectedVendor = vendors.find((v) => v.id === parseInt(formVendorId));
        if (!selectedVendor) return;

        const dateObj = new Date(formPaymentDate);
        const dateLabel = dateObj.toLocaleDateString("en-IN", {
            month: "short", day: "numeric", year: "numeric",
        });

        // Determine primary bill if any allocated
        const firstAllocatedBillId = Object.keys(billPayments).find(
            (k) => billPayments[parseInt(k)] > 0
        );
        const matchedBill = bills.find((b) => b.id === parseInt(firstAllocatedBillId || ""));

        const payload = {
            custom_id: formPaymentNo,
            client_id: selectedVendor.id,
            bill_id: matchedBill ? matchedBill.id : null,
            payment_date: formPaymentDate,
            payment_method: formPaymentMode,
            amount_paid: formAmountPaid,
            reference_number: formReferenceNo,
            notes: formNotes,
            paid_through: formPaidThrough,
            amount_refunded: formAmountRefunded,
            attachments: attachments.map(file => ({ name: file.name, size: file.size })),
            bill_allocations: billPayments,
        };

        const token = (typeof window !== "undefined" ? localStorage.getItem("token") : null) || getCookie("token");
        try {
            const response = await fetch(getApiUrl("/api/payments-made"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });
            const resData = await response.json();
            if (resData.success) {
                // Refresh records from backend
                await fetchData();
            } else {
                // If backend validation failed but we want state persistence
                setPayments((prev) => [
                    {
                        id: `P-${Date.now()}`,
                        paymentNo: formPaymentNo,
                        vendor: selectedVendor.name,
                        clientId: selectedVendor.id,
                        billRef: matchedBill ? matchedBill.number : undefined,
                        paymentDate: formPaymentDate,
                        paymentDateLabel: dateLabel,
                        method: formPaymentMode,
                        txnRef: formReferenceNo || undefined,
                        amount: formAmountPaid,
                        status: "Paid",
                        reconciled: false,
                        notes: formNotes || undefined,
                    },
                    ...prev,
                ]);
            }
        } catch (err) {
            console.error("Database sync issue recording payment, updating client state only.", err);
            // Revert to frontend update
            setPayments((prev) => [
                {
                    id: `P-${Date.now()}`,
                    paymentNo: formPaymentNo,
                    vendor: selectedVendor.name,
                    clientId: selectedVendor.id,
                    billRef: matchedBill ? matchedBill.number : undefined,
                    paymentDate: formPaymentDate,
                    paymentDateLabel: dateLabel,
                    method: formPaymentMode,
                    txnRef: formReferenceNo || undefined,
                    amount: formAmountPaid,
                    status: "Paid",
                    reconciled: false,
                    notes: formNotes || undefined,
                },
                ...prev,
            ]);
        }

        // Return to ledger view
        setView("list");
    };

    // Delete a payment record
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this payment record?")) return;
        
        const token = (typeof window !== "undefined" ? localStorage.getItem("token") : null) || getCookie("token");
        try {
            const res = await fetch(getApiUrl(`/api/payments-made/${id}`), {
                method: "DELETE",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (data.success) {
                await fetchData();
            } else {
                setPayments((prev) => prev.filter((p) => p.id !== id));
            }
        } catch (err) {
            setPayments((prev) => prev.filter((p) => p.id !== id));
        }
    };

    // Filter payments ledger logic
    const filteredPayments = useMemo(() => {
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

    // Calculations for ledger stats
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
    const avgPayment = filteredPayments.length > 0
        ? filteredPayments.reduce((s, p) => s + p.amount, 0) / filteredPayments.length
        : 0;

    const filteredTotal = filteredPayments
        .filter((p) => p.status === "Paid")
        .reduce((s, p) => s + p.amount, 0);

    const toggleReconciled = (id: string) => {
        setPayments(payments.map((p) =>
            p.id === id ? { ...p, reconciled: !p.reconciled } : p,
        ));
    };

    const handleExportCSV = () => {
        const headers = ["Payment No", "Vendor", "Bill Ref", "Date", "Method", "Txn Ref", "Amount", "Status", "Reconciled"];
        const rows = filteredPayments.map((p) => [
            p.paymentNo, p.vendor, p.billRef ?? "", p.paymentDateLabel, p.method, p.txnRef ?? "", p.amount.toFixed(2), p.status, p.reconciled ? "Yes" : "No"
        ]);
        const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "payments-made.csv";
        a.click();
        URL.revokeObjectURL(url);
    };


    // ─────────────────────────────────────────────────────────────────────────────
    // RENDER: UNIFIED PAYMENT FORM (Bill Payment + Vendor Advance tabs)
    // ─────────────────────────────────────────────────────────────────────────────
    if (view === "create") {
        const isVA = formTab === "vendor-advance";
        return (
            <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased text-zinc-800">
                <div className="max-w-[960px] mx-auto px-6 py-8 space-y-6">

                    {/* Header bar */}
                    <div className="flex items-center gap-3 pb-0">
                        <button type="button" onClick={() => setView("list")}
                            className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                            <h1 className="text-[20px] font-semibold text-zinc-900 tracking-tight">Record Payment Made</h1>
                            <p className="text-[12px] text-zinc-500">Record a payment made to your supplier or vendor</p>
                        </div>
                    </div>

                    {/* Tab switcher */}
                    <div className="border-b border-zinc-200 flex gap-0">
                        <button
                            type="button"
                            onClick={() => setFormTab("bill-payment")}
                            className={cn(
                                "px-5 py-3 text-[13px] font-semibold transition-colors border-b-2 -mb-px",
                                formTab === "bill-payment"
                                    ? "border-[#5B5FEF] text-[#5B5FEF]"
                                    : "border-transparent text-zinc-500 hover:text-zinc-800"
                            )}
                        >
                            Bill Payment
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormTab("vendor-advance")}
                            className={cn(
                                "px-5 py-3 text-[13px] font-semibold transition-colors border-b-2 -mb-px",
                                formTab === "vendor-advance"
                                    ? "border-[#5B5FEF] text-[#5B5FEF]"
                                    : "border-transparent text-zinc-500 hover:text-zinc-800"
                            )}
                        >
                            Vendor Advance
                        </button>
                    </div>

                    {/* ── BILL PAYMENT FORM ─────────────────────────────────── */}
                    {formTab === "bill-payment" && (
                    <form onSubmit={handleSubmitPayment} className="space-y-6">
                        {/* Primary Details Row */}
                        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* Vendor Name Selection */}
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

                            {/* Payment Number */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">
                                    Payment # <span className="text-red-500">*</span>
                                </label>
                                <input type="text" required value={formPaymentNo} onChange={(e) => setFormPaymentNo(e.target.value)}
                                    className="w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 text-zinc-800 transition-colors font-mono" />
                            </div>

                            {/* Payment Date */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">
                                    Payment Date (dd/MM/yyyy) <span className="text-red-500">*</span>
                                </label>
                                <input type="date" required value={formPaymentDate} onChange={(e) => setFormPaymentDate(e.target.value)}
                                    className="w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 text-zinc-800 transition-colors" />
                            </div>

                            {/* Payment Mode */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">
                                    Payment Mode <span className="text-red-500">*</span>
                                </label>
                                <select required value={formPaymentMode} onChange={(e) => setFormPaymentMode(e.target.value as PaymentMethod)}
                                    className="w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 cursor-pointer text-zinc-800 transition-colors">
                                    {PAYMENT_METHODS.map((m) => (<option key={m} value={m}>{m}</option>))}
                                </select>
                            </div>

                            {/* Paid Through */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">
                                    Paid Through <span className="text-red-500">*</span>
                                </label>
                                <select required value={formPaidThrough} onChange={(e) => setFormPaidThrough(e.target.value)}
                                    className="w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 cursor-pointer text-zinc-800 transition-colors">
                                    <option value="HDFC Bank Account">HDFC Bank Account</option>
                                    <option value="ICICI Savings Account">ICICI Savings Account</option>
                                    <option value="Cash in Hand">Cash in Hand</option>
                                    <option value="Petty Cash">Petty Cash</option>
                                </select>
                            </div>

                            {/* Reference # */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Reference #</label>
                                <input type="text" placeholder="Enter reference / txn number" value={formReferenceNo} onChange={(e) => setFormReferenceNo(e.target.value)}
                                    className="w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 text-zinc-800 transition-colors" />
                            </div>
                        </div>

                        {/* Unpaid Vendor Bills Table */}
                        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50/50">
                                <h3 className="text-[14px] font-semibold text-zinc-900">Unpaid Bills</h3>
                                <p className="text-[12px] text-zinc-400">Allocate payments to specific vendor bills</p>
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-200 bg-zinc-50/30">
                                        <th className="px-5 py-3 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Date</th>
                                        <th className="px-5 py-3 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Bill#</th>
                                        <th className="px-5 py-3 text-[11px] font-medium text-zinc-400 uppercase tracking-wide text-right">Bill Amount</th>
                                        <th className="px-5 py-3 text-[11px] font-medium text-zinc-400 uppercase tracking-wide text-right">Amount Due</th>
                                        <th className="px-5 py-3 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Payment Made on</th>
                                        <th className="px-5 py-3 text-[11px] font-medium text-zinc-400 uppercase tracking-wide text-right w-[150px]">Payment</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeVendorBills.length > 0 ? (
                                        activeVendorBills.map((bill) => (
                                            <tr key={bill.id} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                                                <td className="px-5 py-3.5 text-[13px] text-zinc-500">
                                                    {new Date(bill.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                </td>
                                                <td className="px-5 py-3.5 text-[13px] font-mono font-medium text-zinc-900">{bill.number}</td>
                                                <td className="px-5 py-3.5 text-[13px] text-right font-mono text-zinc-600">{fmt(bill.amount)}</td>
                                                <td className="px-5 py-3.5 text-[13px] text-right font-mono font-semibold text-zinc-800">{fmt(bill.amount)}</td>
                                                <td className="px-5 py-3.5 text-[13px]">
                                                    <input type="date" value={billPaymentDates[bill.id] || formPaymentDate}
                                                        onChange={(e) => setBillPaymentDates({ ...billPaymentDates, [bill.id]: e.target.value })}
                                                        className="px-2 py-1 text-[12px] bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-[#5B5FEF]" />
                                                </td>
                                                <td className="px-5 py-3.5 text-right">
                                                    <input type="number" placeholder="0.00" step="0.01" min={0} max={bill.amount}
                                                        value={billPayments[bill.id] || ""}
                                                        onChange={(e) => handleBillAllocationChange(bill.id, e.target.value)}
                                                        className="w-full px-2.5 py-1 text-right text-[13px] font-mono border border-zinc-200 rounded focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40" />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-5 py-8 text-center text-zinc-400 text-[13px] font-medium">
                                                There are no bills for this vendor.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <div className="px-5 py-3.5 border-t border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
                                <span className="text-[13px] font-semibold text-zinc-500">Total :</span>
                                <span className="text-[14px] font-mono font-bold text-zinc-900 tabular-nums">{fmt(amountUsedForPayments)}</span>
                            </div>
                        </div>

                        {/* Calculation Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                                <h3 className="text-[14px] font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Calculation Metrics</h3>
                                {([
                                    ["Amount Paid", fmt(formAmountPaid)],
                                    ["Amount used for Payments", fmt(amountUsedForPayments)],
                                    ["Amount Refunded", fmt(formAmountRefunded)],
                                    ["Amount in Excess", fmt(amountInExcess)],
                                ] as [string, string][]).map(([label, val]) => (
                                    <div key={label} className="flex justify-between items-center py-1 border-b border-zinc-50 last:border-0">
                                        <span className="text-[13px] text-zinc-500">{label}</span>
                                        <span className="text-[13px] font-mono font-semibold text-zinc-900 tabular-nums">{val}</span>
                                    </div>
                                ))}
                                <div className="flex flex-col gap-1.5 pt-2">
                                    <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Payment Made <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[13px] font-medium">₹</span>
                                        <input type="number" required min={0} step="0.01" placeholder="0.00"
                                            value={formAmountPaid || ""} onChange={(e) => setFormAmountPaid(parseFloat(e.target.value) || 0)}
                                            className="w-full pl-7 pr-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 text-zinc-800 font-mono" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Amount Refunded</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[13px] font-medium">₹</span>
                                        <input type="number" min={0} step="0.01" placeholder="0.00"
                                            value={formAmountRefunded || ""} onChange={(e) => setFormAmountRefunded(parseFloat(e.target.value) || 0)}
                                            className="w-full pl-7 pr-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 text-zinc-800 font-mono" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                                <h3 className="text-[14px] font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Internal Notes</h3>
                                <label className="text-[13px] font-semibold text-zinc-700">
                                    Notes <span className="normal-case text-zinc-400 font-normal">(Internal use. Not visible to vendor)</span>
                                </label>
                                <textarea rows={3} placeholder="Add descriptive details or audit remarks..."
                                    value={formNotes} onChange={(e) => setFormNotes(e.target.value)}
                                    className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 text-zinc-800 resize-none" />
                            </div>
                        </div>

                        {/* Attachments */}
                        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                            <h3 className="text-[14px] font-semibold text-zinc-900">Attachments</h3>
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
                                                className="p-1 hover:bg-zinc-200 rounded text-zinc-400 hover:text-zinc-600 transition-colors">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Additional Fields tip */}
                        <div className="flex items-start gap-2.5 p-4 bg-[#F5F5FE] border border-[#5B5FEF]/10 rounded-xl text-[12px] text-zinc-500">
                            <Settings className="w-4 h-4 text-[#5B5FEF] shrink-0 mt-0.5" />
                            <div>
                                <span className="font-semibold text-zinc-700">Additional Fields: </span>
                                Start adding custom fields for your payments made by going to Settings &rarr; Purchases &rarr; Payments Made.
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-3 pt-2 justify-end">
                            <button type="button" onClick={() => setView("list")}
                                className="px-5 py-2.5 text-[13px] font-semibold text-zinc-700 border border-zinc-200 bg-white rounded-lg hover:bg-zinc-50 transition-colors shadow-xs">
                                Cancel
                            </button>
                            <button type="submit"
                                className="px-6 py-2.5 text-[13px] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors shadow-sm">
                                Save Payment
                            </button>
                        </div>
                    </form>
                    )}

                    {/* ── VENDOR ADVANCE FORM ──────────────────────────────── */}
                    {formTab === "vendor-advance" && (
                    <form onSubmit={handleSubmitVendorAdvance} className="space-y-6">
                        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-5">

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Vendor Name <span className="text-red-500">*</span></label>
                                <select required value={vaVendorId} onChange={(e) => setVaVendorId(e.target.value)}
                                    className="w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 cursor-pointer text-zinc-800">
                                    <option value="">Select Vendor</option>
                                    {vendors.map((v) => (<option key={v.id} value={v.id}>{v.name} ({v.custom_id})</option>))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Payment # <span className="text-red-500">*</span></label>
                                <input type="text" required value={vaPaymentNo} onChange={(e) => setVaPaymentNo(e.target.value)}
                                    className="w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 text-zinc-800 font-mono" />
                            </div>

                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Description of Supply</label>
                                <input type="text" placeholder="e.g. Advance for raw material supply" value={vaDescription} onChange={(e) => setVaDescription(e.target.value)}
                                    className="w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 text-zinc-800" />
                                <p className="text-[11px] text-zinc-400">Will be displayed on the Payment Voucher</p>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Payment Made <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[13px] font-medium">₹</span>
                                    <input type="number" required min={0} step="0.01" placeholder="0.00"
                                        value={vaAmountPaid || ""} onChange={(e) => setVaAmountPaid(parseFloat(e.target.value) || 0)}
                                        className="w-full pl-7 pr-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 text-zinc-800 font-mono" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">TDS</label>
                                <select value={vaTds} onChange={(e) => setVaTds(e.target.value)}
                                    className="w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 cursor-pointer text-zinc-800">
                                    <option value="">No TDS</option>
                                    <option value="1">1% - Section 194C (Contractors)</option>
                                    <option value="2">2% - Section 194C (Others)</option>
                                    <option value="5">5% - Section 194H (Commission)</option>
                                    <option value="10">10% - Section 194J (Professional)</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Payment Date (dd/MM/yyyy) <span className="text-red-500">*</span></label>
                                <input type="date" required value={vaPaymentDate} onChange={(e) => setVaPaymentDate(e.target.value)}
                                    className="w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 text-zinc-800" />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Payment Mode <span className="text-red-500">*</span></label>
                                <select required value={vaPaymentMode} onChange={(e) => setVaPaymentMode(e.target.value as PaymentMethod)}
                                    className="w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 cursor-pointer text-zinc-800">
                                    {PAYMENT_METHODS.map((m) => (<option key={m} value={m}>{m}</option>))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Paid Through <span className="text-red-500">*</span></label>
                                <select required value={vaPaidThrough} onChange={(e) => setVaPaidThrough(e.target.value)}
                                    className="w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 cursor-pointer text-zinc-800">
                                    <option value="HDFC Bank Account">HDFC Bank Account</option>
                                    <option value="ICICI Savings Account">ICICI Savings Account</option>
                                    <option value="Cash in Hand">Cash in Hand</option>
                                    <option value="Petty Cash">Petty Cash</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Deposit To</label>
                                <input type="text" placeholder="e.g. vendor bank account or account name" value={vaDepositTo} onChange={(e) => setVaDepositTo(e.target.value)}
                                    className="w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 text-zinc-800" />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Reference #</label>
                                <input type="text" placeholder="Enter reference / txn number" value={vaReferenceNo} onChange={(e) => setVaReferenceNo(e.target.value)}
                                    className="w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 text-zinc-800" />
                            </div>

                            <div className="md:col-span-2">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <div className="relative mt-0.5">
                                        <input type="checkbox" checked={vaReverseCharge} onChange={(e) => setVaReverseCharge(e.target.checked)} className="sr-only peer" />
                                        <div className="w-9 h-5 bg-zinc-200 peer-checked:bg-[#5B5FEF] rounded-full transition-colors" />
                                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-semibold text-zinc-800">Reverse Charge</p>
                                        <p className="text-[11px] text-zinc-400 mt-0.5">This transaction is applicable for reverse charge</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-3">
                            <label className="text-[13px] font-semibold text-zinc-700 uppercase tracking-wide">
                                Notes <span className="normal-case text-zinc-400 font-normal">(Internal use. Not visible to vendor)</span>
                            </label>
                            <textarea rows={3} placeholder="Add any internal remarks or advance instructions..."
                                value={vaNotes} onChange={(e) => setVaNotes(e.target.value)}
                                className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 text-zinc-800 resize-none" />
                        </div>

                        {/* Attachments */}
                        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                            <h3 className="text-[14px] font-semibold text-zinc-900">Attachments</h3>
                            <div className="border-2 border-dashed border-zinc-200 rounded-xl p-6 flex flex-col items-center justify-center bg-zinc-50/50 hover:bg-zinc-50 cursor-pointer transition-colors relative">
                                <input type="file" multiple onChange={handleVaFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                <UploadCloud className="w-8 h-8 text-zinc-400 mb-2" />
                                <p className="text-[13px] font-medium text-zinc-700">Drag & Drop files here or click to browse</p>
                                <p className="text-[11px] text-zinc-400 mt-1">You can upload a maximum of 5 files, 10MB each</p>
                            </div>
                            {vaAttachments.length > 0 && (
                                <div className="space-y-2 pt-2">
                                    {vaAttachments.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-zinc-400" />
                                                <span className="text-[13px] text-zinc-700 truncate max-w-[200px]">{file.name}</span>
                                                <span className="text-[11px] text-zinc-400 font-mono">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                            </div>
                                            <button type="button" onClick={() => removeVaAttachment(idx)}
                                                className="p-1 hover:bg-zinc-200 rounded text-zinc-400 hover:text-zinc-600 transition-colors">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Additional Fields tip */}
                        <div className="flex items-start gap-2.5 p-4 bg-[#F5F5FE] border border-[#5B5FEF]/10 rounded-xl text-[12px] text-zinc-500">
                            <Settings className="w-4 h-4 text-[#5B5FEF] shrink-0 mt-0.5" />
                            <div>
                                <span className="font-semibold text-zinc-700">Additional Fields: </span>
                                Start adding custom fields for your payments made by going to Settings &rarr; Purchases &rarr; Payments Made.
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-3 pt-2 justify-end">
                            <button type="button" onClick={() => setView("list")}
                                className="px-5 py-2.5 text-[13px] font-semibold text-zinc-700 border border-zinc-200 bg-white rounded-lg hover:bg-zinc-50 transition-colors shadow-xs">
                                Cancel
                            </button>
                            <button type="submit"
                                className="px-6 py-2.5 text-[13px] font-semibold text-white bg-[#5B5FEF] hover:bg-[#4a4ed8] rounded-lg transition-colors shadow-sm">
                                Save Advance
                            </button>
                        </div>
                    </form>
                    )}

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
                            onClick={handleExportCSV}
                            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-700 border border-zinc-200 bg-white hover:bg-zinc-50 px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                        <button
                            onClick={() => openCreateForm()}
                            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Record Payment
                        </button>
                    </div>
                </div>

                {debugError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-[12px] text-red-700 font-mono whitespace-pre-wrap shadow-xs">
                        <strong>API Diagnostics Warning:</strong>
                        <p className="mt-1">{debugError}</p>
                    </div>
                )}

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

                {/* Table Card */}
                <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

                    {/* Toolbar */}
                    <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <h2 className="text-[14px] font-semibold text-zinc-900">Payment Ledger</h2>
                            <p className="text-[12px] text-zinc-500">
                                {filteredPayments.length} transaction{filteredPayments.length !== 1 ? "s" : ""}
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
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
                                            <p className="text-[13px] text-zinc-400">Loading payment ledger...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPayments.map((payment) => {
                                const statusCfg = STATUS_CONFIG[payment.status];
                                const methodCfg = METHOD_CONFIG[payment.method] || { bg: "bg-zinc-100", text: "text-zinc-700" };
                                return (
                                    <tr
                                        key={payment.id}
                                        className={cn(
                                            "transition-colors cursor-pointer group hover:bg-zinc-50/70",
                                            payment.status === "Failed" && "bg-red-50/10 hover:bg-red-50/20",
                                            payment.status === "Pending" && "bg-amber-50/10 hover:bg-amber-50/20"
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
                                            <span className={cn("inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md", methodCfg.bg, methodCfg.text)}>
                                                {payment.method}
                                            </span>
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
                                            <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full", statusCfg.bg, statusCfg.text)}>
                                                <span className={cn("w-1.5 h-1.5 rounded-full", statusCfg.dot)} />
                                                {payment.status}
                                            </span>
                                        </td>

                                        {/* Reconciled toggle */}
                                        <td className="px-5 py-3 text-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleReconciled(payment.id);
                                                }}
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
                                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(payment.id);
                                                    }}
                                                    className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors"
                                                    title="Delete payment"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {!loading && filteredPayments.length === 0 && (
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

                    {/* Footer Summary */}
                    {!loading && filteredPayments.length > 0 && (
                        <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-[12px] text-zinc-400">
                                    {filteredPayments.length} transaction{filteredPayments.length !== 1 ? "s" : ""}
                                </span>
                                <span className="text-[12px] text-zinc-400">
                                    {filteredPayments.filter((p) => p.reconciled).length} reconciled
                                </span>
                                {filteredPayments.some((p) => p.status === "Failed") && (
                                    <span className="text-[12px] text-red-500 font-medium">
                                        {filteredPayments.filter((p) => p.status === "Failed").length} failed
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
        </div>
    );
}
