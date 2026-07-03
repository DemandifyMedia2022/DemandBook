"use client";

import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
    Search,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    ChevronDown,
    X,
    FileText,
    Download,
    Send,
    CheckCircle2,
    XCircle,
    Clock,
    Trash2,
    AlertCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type QuoteStatus = "Draft" | "Sent" | "Accepted" | "Declined" | "Expired";

interface LineItem {
    id: string;
    description: string;
    hsnSac: string;          // HSN/SAC code, required for GST docs
    qty: number;
    unitPrice: number;
    discountPct: number;     // per-line discount
    taxPct: number;          // combined GST % (we'll split into CGST/SGST or IGST at calc time)
}

interface Quote {
    id: string;
    quoteNo: string;
    customerId: string;      // FK to Customer — replaces free-text `customer`
    customer: string;        // denormalized display name, kept in sync with customerId
    billingAddress: string;
    shippingAddress: string;
    placeOfSupply: string;   // state code, drives CGST+SGST vs IGST
    subject: string;
    referenceNumber?: string;
    salesperson?: string;
    quoteDate: string;
    quoteDateLabel: string;
    expiryDate: string;
    expiryDateLabel: string;
    currency: string;
    lineItems: LineItem[];
    discountPct: number;     // overall discount, applied after line-level discounts
    shippingCharges: number;
    roundOff: number;
    amount?: number;         // backend-calculated total, used when lineItems aren't loaded (e.g. list view)
    notes?: string;
    terms?: string;
    status: QuoteStatus;
    convertedToInvoiceId?: string; // tracks quote → invoice lifecycle
    attachments?: string[];        // file names/URLs for now
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<
    QuoteStatus,
    { dot: string; text: string; bg: string; icon: React.ReactNode }
> = {
    Draft: { dot: "bg-zinc-400", text: "text-zinc-600", bg: "bg-zinc-100", icon: <FileText className="w-3 h-3" /> },
    Sent: { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50", icon: <Send className="w-3 h-3" /> },
    Accepted: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", icon: <CheckCircle2 className="w-3 h-3" /> },
    Declined: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50", icon: <XCircle className="w-3 h-3" /> },
    Expired: { dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50", icon: <Clock className="w-3 h-3" /> },
};

const STATUSES: QuoteStatus[] = ["Draft", "Sent", "Accepted", "Declined", "Expired"];

const DATE_RANGES = ["This Month", "Last Month", "This Quarter", "This Year", "All Time"];

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const today = new Date();

function makeQuoteDate(daysAgo: number) {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return {
        quoteDate: d.toISOString(),
        quoteDateLabel: d.toLocaleDateString("en-IN", {
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

function calcLineAmount(l: LineItem): number {
    const base = l.qty * l.unitPrice;
    const afterLineDiscount = base * (1 - l.discountPct / 100);
    return afterLineDiscount * (1 + l.taxPct / 100);
}

function calcTotal(
    lineItems: LineItem[],
    discountPct: number,
    shippingCharges = 0,
    roundOff = 0,
    backendAmount?: number,
): number {
    if (backendAmount !== undefined) return backendAmount;
    const subtotal = lineItems.reduce((s, l) => s + calcLineAmount(l), 0);
    const afterOverallDiscount = subtotal * (1 - discountPct / 100);
    return afterOverallDiscount + shippingCharges + roundOff;
}
const initialQuotes: Quote[] = [
    {
        id: "Q-001", quoteNo: "QUO-2024-001",
        customerId: "CUST-1001", customer: "Infosys Ltd.",
        billingAddress: "Electronics City, Bengaluru 560100",
        shippingAddress: "Electronics City, Bengaluru 560100",
        placeOfSupply: "29-Karnataka",
        subject: "Annual SaaS Subscription — Nexa Workspace",
        referenceNumber: "PO-INFY-8821",
        salesperson: "Aarav Shah",
        ...makeQuoteDate(5), ...makeExpiryDate(25),
        currency: "INR",
        lineItems: [
            { id: "l1", description: "Nexa Workspace — Enterprise (50 seats)", hsnSac: "998314", qty: 50, unitPrice: 2400, discountPct: 0, taxPct: 18 },
            { id: "l2", description: "Onboarding & Setup", hsnSac: "998313", qty: 1, unitPrice: 25000, discountPct: 0, taxPct: 18 },
        ],
        discountPct: 10, shippingCharges: 0, roundOff: 0, status: "Sent",
        notes: "Pricing valid for 30 days from issue date.",
        terms: "Payment due within 30 days of invoice.",
    },
    {
        id: "Q-002", quoteNo: "QUO-2024-002",
        customerId: "CUST-1002", customer: "Wipro Technologies",
        billingAddress: "Sarjapur Road, Bengaluru 560035",
        shippingAddress: "Sarjapur Road, Bengaluru 560035",
        placeOfSupply: "29-Karnataka",
        subject: "CRM Module Implementation",
        referenceNumber: "PO-WIPRO-4471",
        salesperson: "Aarav Shah",
        ...makeQuoteDate(12), ...makeExpiryDate(18),
        currency: "INR",
        lineItems: [
            { id: "l1", description: "CRM Module License (100 seats)", hsnSac: "998314", qty: 100, unitPrice: 1800, discountPct: 0, taxPct: 18 },
            { id: "l2", description: "Custom Integration — Salesforce", hsnSac: "998313", qty: 1, unitPrice: 85000, discountPct: 0, taxPct: 18 },
            { id: "l3", description: "Training Sessions (10 hrs)", hsnSac: "999293", qty: 10, unitPrice: 5000, discountPct: 0, taxPct: 18 },
        ],
        discountPct: 5, shippingCharges: 0, roundOff: 0, status: "Accepted",
        notes: "Includes 1 year of support.",
    },
    {
        id: "Q-003", quoteNo: "QUO-2024-003",
        customerId: "CUST-1003", customer: "TCS Digital",
        billingAddress: "Hinjewadi, Pune 411057",
        shippingAddress: "Hinjewadi, Pune 411057",
        placeOfSupply: "27-Maharashtra",
        subject: "HR & Payroll Module — Pilot",
        salesperson: "Priya Nair",
        ...makeQuoteDate(2), ...makeExpiryDate(28),
        currency: "INR",
        lineItems: [
            { id: "l1", description: "HR Module License (25 seats)", hsnSac: "998314", qty: 25, unitPrice: 1200, discountPct: 0, taxPct: 18 },
        ],
        discountPct: 0, shippingCharges: 0, roundOff: 0, status: "Draft",
    },
    {
        id: "Q-004", quoteNo: "QUO-2024-004",
        customerId: "CUST-1004", customer: "HCL Technologies",
        billingAddress: "Sector 126, Noida 201304",
        shippingAddress: "Sector 126, Noida 201304",
        placeOfSupply: "09-Uttar Pradesh",
        subject: "Mail & Calendar Suite",
        referenceNumber: "PO-HCL-2290",
        salesperson: "Priya Nair",
        ...makeQuoteDate(20), ...makeExpiryDate(5),
        currency: "INR",
        lineItems: [
            { id: "l1", description: "Mail & Calendar — Business (200 seats)", hsnSac: "998314", qty: 200, unitPrice: 800, discountPct: 0, taxPct: 18 },
        ],
        discountPct: 15, shippingCharges: 0, roundOff: 0, status: "Sent",
        notes: "Expiring soon — follow up required.",
    },
    {
        id: "Q-005", quoteNo: "QUO-2024-005",
        customerId: "CUST-1005", customer: "Tech Mahindra",
        billingAddress: "Magarpatta, Pune 411013",
        shippingAddress: "Magarpatta, Pune 411013",
        placeOfSupply: "27-Maharashtra",
        subject: "Vault Security Module",
        salesperson: "Aarav Shah",
        ...makeQuoteDate(35), ...makeExpiryDate(-5),
        currency: "INR",
        lineItems: [
            { id: "l1", description: "Vault Module License (50 seats)", hsnSac: "998314", qty: 50, unitPrice: 1500, discountPct: 0, taxPct: 18 },
            { id: "l2", description: "Security Audit & Setup", hsnSac: "998313", qty: 1, unitPrice: 40000, discountPct: 0, taxPct: 18 },
        ],
        discountPct: 0, shippingCharges: 0, roundOff: 0, status: "Expired",
    },
    {
        id: "Q-006", quoteNo: "QUO-2024-006",
        customerId: "CUST-1006", customer: "Mphasis Ltd.",
        billingAddress: "Airoli, Navi Mumbai 400708",
        shippingAddress: "Airoli, Navi Mumbai 400708",
        placeOfSupply: "27-Maharashtra",
        subject: "Full Nexa Platform — Enterprise",
        referenceNumber: "PO-MPH-5567",
        salesperson: "Priya Nair",
        ...makeQuoteDate(40), ...makeExpiryDate(-10),
        currency: "INR",
        lineItems: [
            { id: "l1", description: "Nexa Platform — Full Suite (500 seats)", hsnSac: "998314", qty: 500, unitPrice: 3200, discountPct: 0, taxPct: 18 },
            { id: "l2", description: "Dedicated Support (12 months)", hsnSac: "998313", qty: 12, unitPrice: 15000, discountPct: 0, taxPct: 18 },
        ],
        discountPct: 20, shippingCharges: 0, roundOff: 0, status: "Declined",
        notes: "Customer went with a competitor.",
    },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmt(n: number) {
    return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function getExpirySeverity(q: Quote): "expired" | "soon" | "normal" {
    if (q.status === "Accepted" || q.status === "Declined") return "normal";
    const diff =
        (new Date(q.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "expired";
    if (diff <= 7) return "soon";
    return "normal";
}

function isInRange(isoDate: string, range: string): boolean {
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
            return Math.floor(d.getMonth() / 3) === q && d.getFullYear() === now.getFullYear();
        }
        case "This Year":
            return d.getFullYear() === now.getFullYear();
        default:
            return true;
    }
}

function newLineItem(): LineItem {
    return {
        id: crypto.randomUUID(),
        description: "",
        hsnSac: "",
        qty: 1,
        unitPrice: 0,
        discountPct: 0,
        taxPct: 18,
    };
}

function exportCSV(quotes: Quote[]) {
    const headers = ["Quote No", "Customer", "Subject", "Date", "Expiry", "Amount", "Status"];
    const rows = quotes.map((q) => [
        q.quoteNo, q.customer, q.subject, q.quoteDateLabel, q.expiryDateLabel,
        calcTotal(q.lineItems, q.discountPct).toFixed(2), q.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "quotes.csv"; a.click();
    URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function StatCard({ label, value, delta, sub }: {
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

function StatusPill({ status }: { status: QuoteStatus }) {
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

// ---------------------------------------------------------------------------
// Create Quote Modal
// ---------------------------------------------------------------------------
const FIELD =
    "w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 transition-colors text-zinc-800 placeholder:text-zinc-400";
const SELECT = cn(FIELD, "appearance-none cursor-pointer");

function CreateQuoteModal({ onClose, onAdd }: {
    onClose: () => void;
    onAdd: (q: Quote) => void;
}) {
    const [customerId, setCustomerId] = useState("");
    const [customer, setCustomer] = useState("");
    const [billingAddress, setBillingAddress] = useState("");
    const [shippingAddress, setShippingAddress] = useState("");
    const [placeOfSupply, setPlaceOfSupply] = useState("");
    const [subject, setSubject] = useState("");
    const [referenceNumber, setReferenceNumber] = useState("");
    const [salesperson, setSalesperson] = useState("");
    const [quoteDate, setQuoteDate] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [currency, setCurrency] = useState("INR");
    const [discountPct, setDiscountPct] = useState("0");
    const [shippingCharges, setShippingCharges] = useState("0");
    const [roundOff, setRoundOff] = useState("0");
    const [notes, setNotes] = useState("");
    const [terms, setTerms] = useState("");
    const [lineItems, setLineItems] = useState<LineItem[]>([newLineItem()]);

    const [attachments, setAttachments] = useState<File[]>([]);

    const [realCustomers, setRealCustomers] = useState<any[]>([]);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:8888/api/client/list?type=customer", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                console.log("Customers API response:", data); // temporary - so we can see the real shape
                if (data.success) {
                    setRealCustomers(data.clients || data.customers || []);
                }
            } catch (error) {
                console.error("Failed to fetch customers:", error);
            }
        };
        fetchCustomers();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments((prev) => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const subtotal = lineItems.reduce((s, l) => s + l.qty * l.unitPrice * (1 - l.discountPct / 100), 0);
    const tax = lineItems.reduce((s, l) => s + l.qty * l.unitPrice * (1 - l.discountPct / 100) * (l.taxPct / 100), 0);
    const discount = (subtotal + tax) * (parseFloat(discountPct || "0") / 100);
    const total = subtotal + tax - discount + parseFloat(shippingCharges || "0") + parseFloat(roundOff || "0");

    const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
        setLineItems(lineItems.map((l) => l.id === id ? { ...l, [field]: value } : l));
    };
    const removeItem = (id: string) => setLineItems(lineItems.filter((l) => l.id !== id));
    const addItem = () => setLineItems([...lineItems, newLineItem()]);

    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerId || !subject) return;
        setSubmitting(true);

        const qDateObj = quoteDate ? new Date(quoteDate) : today;
        const expDateObj = expiryDate ? new Date(expiryDate) : new Date(today.getTime() + 30 * 864e5);

        // Build the payload to match the backend's expected snake_case fields
        const payload = {
            client_id: customerId,
            subject,
            reference_number: referenceNumber || undefined,
            sales_person_id: undefined, // TODO: wire to a real user picker later; backend defaults to null
            billing_address: billingAddress,
            shipping_address: shippingAddress || billingAddress,
            place_of_supply: placeOfSupply,
            quote_date: qDateObj.toISOString().split("T")[0],
            expiry_date: expDateObj.toISOString().split("T")[0],
            currency,
            shipping_charges: parseFloat(shippingCharges || "0"),
            round_off: parseFloat(roundOff || "0"),
            discount_total: 0, // overall discount is recalculated server-side from items + discountPct below
            status: "Draft",
            customer_notes: notes || undefined,
            terms_conditions: terms || undefined,
            items: lineItems.map((l) => ({
                description: l.description,
                hsn_sac: l.hsnSac,
                quantity: l.qty,
                unit: "pcs",
                rate: l.unitPrice,
                discount_pct: l.discountPct,
                tax_rate: l.taxPct,
            })),
        };

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8888/api/quotes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (data.success) {
                // Map the backend's response shape back into the frontend's Quote type
                const q = data.quote;
                onAdd({
                    id: String(q.id),
                    quoteNo: q.quote_number,
                    customerId: String(q.client_id),
                    customer: q.customer_name || customer,
                    billingAddress: q.billing_address || "",
                    shippingAddress: q.shipping_address || "",
                    placeOfSupply: q.place_of_supply || "",
                    subject: q.subject || "",
                    referenceNumber: q.reference_number || undefined,
                    salesperson: salesperson || undefined,
                    quoteDate: q.quote_date,
                    quoteDateLabel: new Date(q.quote_date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
                    expiryDate: q.expiry_date,
                    expiryDateLabel: q.expiry_date ? new Date(q.expiry_date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "",
                    currency: q.currency,
                    lineItems,
                    discountPct: parseFloat(discountPct || "0"),
                    shippingCharges: parseFloat(q.shipping_charges || "0"),
                    roundOff: parseFloat(q.round_off || "0"),
                    notes: q.customer_notes || undefined,
                    terms: q.terms_conditions || undefined,
                    status: q.status,
                    attachments: attachments.length > 0 ? attachments.map((f) => f.name) : undefined,
                });
            } else {
                alert("Failed to create quote: " + data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Error creating quote");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-[640px] max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 sticky top-0 bg-white z-10">
                    <div>
                        <h3 className="text-[15px] font-semibold text-zinc-900">Create Quote</h3>
                        <p className="text-[12px] text-zinc-500 mt-0.5">Draft a new quote for a customer</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Customer + Subject */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Customer</label>
                            <select
                                required
                                className={SELECT}
                                value={customerId}
                                onChange={(e) => {
                                    const c = realCustomers.find((rc) => String(rc.id) === e.target.value);
                                    setCustomerId(e.target.value);
                                    setCustomer(c?.name ?? c?.display_name ?? "");
                                    setPlaceOfSupply(c?.place_of_supply ?? "");
                                }}
                            >
                                <option value="">Select a customer</option>
                                {realCustomers.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name || c.display_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Subject</label>
                            <input required placeholder="e.g. Annual SaaS Subscription" className={FIELD} value={subject} onChange={(e) => setSubject(e.target.value)} />
                        </div>
                    </div>

                    {/* Reference + Salesperson */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Reference Number</label>
                            <input placeholder="e.g. PO-12345" className={FIELD} value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Salesperson</label>
                            <input placeholder="e.g. Aarav Shah" className={FIELD} value={salesperson} onChange={(e) => setSalesperson(e.target.value)} />
                        </div>
                    </div>

                    {/* Billing + Shipping Address */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Billing Address</label>
                            <textarea rows={2} placeholder="Street, City, State, PIN" className={cn(FIELD, "resize-none")} value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                                Shipping Address <span className="normal-case font-normal text-zinc-400">(optional, defaults to billing)</span>
                            </label>
                            <textarea rows={2} placeholder="Street, City, State, PIN" className={cn(FIELD, "resize-none")} value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} />
                        </div>
                    </div>

                    {/* Place of Supply + Currency */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Place of Supply</label>
                            <input placeholder="e.g. 27-Maharashtra" className={FIELD} value={placeOfSupply} onChange={(e) => setPlaceOfSupply(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Currency</label>
                            <select className={SELECT} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                                <option value="INR">INR — Indian Rupee</option>
                                <option value="USD">USD — US Dollar</option>
                                <option value="EUR">EUR — Euro</option>
                                <option value="GBP">GBP — British Pound</option>
                            </select>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Quote Date</label>
                            <input type="date" className={FIELD} value={quoteDate} onChange={(e) => setQuoteDate(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Expiry Date</label>
                            <input type="date" className={FIELD} value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                        </div>
                    </div>

                    {/* Line items */}
                    <div>
                        <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2">Line Items</label>
                        <div className="border border-zinc-200 rounded-lg overflow-hidden">
                            {/* Line item header */}
                            <div className="grid grid-cols-[1fr_90px_56px_90px_64px_64px_90px_32px] gap-2 px-3 py-2 bg-zinc-50 border-b border-zinc-200">
                                {["Description", "HSN/SAC", "Qty", "Unit Price", "Disc %", "Tax %", "Amount", ""].map((h, i) => (
                                    <span key={i} className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide">{h}</span>
                                ))}
                            </div>

                            {/* Line item rows */}
                            {lineItems.map((item) => (
                                <div key={item.id} className="grid grid-cols-[1fr_90px_56px_90px_64px_64px_90px_32px] gap-2 px-3 py-2 border-b border-zinc-100 last:border-0 items-center">
                                    <input
                                        placeholder="Item description"
                                        className="text-[13px] text-zinc-800 bg-transparent focus:outline-none placeholder:text-zinc-300"
                                        value={item.description}
                                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                                    />
                                    <input
                                        placeholder="HSN/SAC"
                                        className="text-[13px] text-zinc-800 bg-transparent focus:outline-none w-full placeholder:text-zinc-300"
                                        value={item.hsnSac}
                                        onChange={(e) => updateItem(item.id, "hsnSac", e.target.value)}
                                    />
                                    <input
                                        type="number" min={1}
                                        className="text-[13px] text-zinc-800 bg-transparent focus:outline-none text-center w-full"
                                        value={item.qty}
                                        onChange={(e) => updateItem(item.id, "qty", parseFloat(e.target.value) || 1)}
                                    />
                                    <input
                                        type="number" min={0} step="0.01"
                                        className="text-[13px] text-zinc-800 bg-transparent focus:outline-none w-full"
                                        value={item.unitPrice}
                                        onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                                    />
                                    <input
                                        type="number" min={0} max={100}
                                        className="text-[13px] text-zinc-800 bg-transparent focus:outline-none text-center w-full"
                                        value={item.discountPct}
                                        onChange={(e) => updateItem(item.id, "discountPct", parseFloat(e.target.value) || 0)}
                                    />
                                    <input
                                        type="number" min={0} max={100}
                                        className="text-[13px] text-zinc-800 bg-transparent focus:outline-none text-center w-full"
                                        value={item.taxPct}
                                        onChange={(e) => updateItem(item.id, "taxPct", parseFloat(e.target.value) || 0)}
                                    />
                                    <span className="text-[12px] font-mono text-zinc-600 tabular-nums">
                                        {fmt(calcLineAmount(item))}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        disabled={lineItems.length === 1}
                                        className="p-1 rounded hover:bg-red-50 text-zinc-300 hover:text-red-400 transition-colors disabled:opacity-30"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addItem}
                            className="mt-2 text-[12px] text-[#5B5FEF] hover:underline flex items-center gap-1"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add line item
                        </button>
                    </div>

                    {/* Totals + Discount */}
                    <div className="flex justify-end">
                        <div className="w-64 space-y-1.5">
                            <div className="flex justify-between text-[13px] text-zinc-500">
                                <span>Subtotal</span>
                                <span className="font-mono tabular-nums">{fmt(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-[13px] text-zinc-500">
                                <span>Tax</span>
                                <span className="font-mono tabular-nums">{fmt(tax)}</span>
                            </div>
                            <div className="flex items-center justify-between text-[13px] text-zinc-500">
                                <span>Discount (%)</span>
                                <input
                                    type="number" min={0} max={100}
                                    className="w-16 text-right text-[13px] border border-zinc-200 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20"
                                    value={discountPct}
                                    onChange={(e) => setDiscountPct(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center justify-between text-[13px] text-zinc-500">
                                <span>Shipping Charges</span>
                                <input
                                    type="number" min={0} step="0.01"
                                    className="w-20 text-right text-[13px] border border-zinc-200 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20"
                                    value={shippingCharges}
                                    onChange={(e) => setShippingCharges(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center justify-between text-[13px] text-zinc-500">
                                <span>Round Off</span>
                                <input
                                    type="number" step="0.01"
                                    className="w-20 text-right text-[13px] border border-zinc-200 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20"
                                    value={roundOff}
                                    onChange={(e) => setRoundOff(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-between text-[14px] font-semibold text-zinc-900 border-t border-zinc-200 pt-2 mt-1">
                                <span>Total</span>
                                <span className="font-mono tabular-nums">{fmt(total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes + Terms */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                                Notes <span className="normal-case font-normal text-zinc-400">(optional)</span>
                            </label>
                            <textarea rows={3} placeholder="Any additional notes for the customer..." className={cn(FIELD, "resize-none")} value={notes} onChange={(e) => setNotes(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                                Terms & Conditions <span className="normal-case font-normal text-zinc-400">(optional)</span>
                            </label>
                            <textarea rows={3} placeholder="Payment terms, validity, etc..." className={cn(FIELD, "resize-none")} value={terms} onChange={(e) => setTerms(e.target.value)} />
                        </div>
                    </div>


                    {/* Attachments */}
                    <div>
                        <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                            Attachments <span className="normal-case font-normal text-zinc-400">(optional)</span>
                        </label>
                        <div className="border-2 border-dashed border-zinc-200 rounded-lg p-4 text-center hover:bg-zinc-50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <p className="text-[12px] text-zinc-500">Click to upload or drag and drop</p>
                        </div>
                        {attachments.length > 0 && (
                            <div className="mt-2 space-y-1.5">
                                {attachments.map((file, i) => (
                                    <div key={i} className="flex items-center justify-between bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200">
                                        <span className="text-[12px] text-zinc-700 truncate">{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFile(i)}
                                            className="text-zinc-400 hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex items-center gap-2.5">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-[13px] font-medium text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 text-[13px] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 rounded-lg transition-colors shadow-sm">
                            {submitting ? "Saving…" : "Save as Draft"}
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
export default function Quotes() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [dateRange, setDateRange] = useState("This Month");
    const [showModal, setShowModal] = useState(false);

    const fetchQuotes = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8888/api/quotes", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                const mapped: Quote[] = data.quotes.map((q: any) => ({
                    id: String(q.id),
                    quoteNo: q.quote_number,
                    customerId: String(q.client_id),
                    customer: q.customer_name || q.client_name || "",
                    billingAddress: q.billing_address || "",
                    shippingAddress: q.shipping_address || "",
                    placeOfSupply: q.place_of_supply || "",
                    subject: q.subject || "",
                    referenceNumber: q.reference_number || undefined,
                    salesperson: undefined,
                    quoteDate: q.quote_date,
                    quoteDateLabel: new Date(q.quote_date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
                    expiryDate: q.expiry_date,
                    expiryDateLabel: q.expiry_date ? new Date(q.expiry_date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "",
                    currency: q.currency || "INR",
                    lineItems: [],
                    discountPct: 0,
                    shippingCharges: parseFloat(q.shipping_charges || "0"),
                    roundOff: parseFloat(q.round_off || "0"),
                    notes: q.customer_notes || undefined,
                    terms: q.terms_conditions || undefined,
                    status: q.status,
                    convertedToInvoiceId: q.converted_to_invoice_id ? String(q.converted_to_invoice_id) : undefined,
                    amount: parseFloat(q.amount || "0"),
                    attachments: undefined,
                }));
                setQuotes(mapped);
            }
        } catch (error) {
            console.error("Failed to fetch quotes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotes();
    }, []);

    const filtered = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return quotes.filter((qt) =>
            (
                qt.customer.toLowerCase().includes(q) ||
                qt.quoteNo.toLowerCase().includes(q) ||
                qt.subject.toLowerCase().includes(q)
            ) &&
            (selectedStatus === "All" || qt.status === selectedStatus) &&
            isInRange(qt.quoteDate, dateRange)
        );
    }, [quotes, searchQuery, selectedStatus, dateRange]);

    // Stats
    const openQuotes = quotes.filter((q) => q.status === "Sent" || q.status === "Draft");
    const acceptedThisMonth = quotes.filter(
        (q) => q.status === "Accepted" && isInRange(q.quoteDate, "This Month"),
    );
    const pendingCount = quotes.filter((q) => q.status === "Sent").length;
    const totalSent = quotes.filter((q) => q.status !== "Draft").length;
    const totalAccepted = quotes.filter((q) => q.status === "Accepted").length;
    const acceptanceRate = totalSent > 0 ? Math.round((totalAccepted / totalSent) * 100) : 0;

    const totalOpenValue = openQuotes.reduce(
        (s, q) => s + calcTotal(q.lineItems, q.discountPct, q.shippingCharges, q.roundOff, q.amount), 0,
    );
    const acceptedValue = acceptedThisMonth.reduce(
        (s, q) => s + calcTotal(q.lineItems, q.discountPct, q.shippingCharges, q.roundOff, q.amount), 0,
    );

    const updateStatus = (id: string, status: QuoteStatus) => {
        setQuotes(quotes.map((q) => q.id === id ? { ...q, status } : q));
    };

    const handleAdd = (quote: Quote) => {
        setShowModal(false);
        fetchQuotes();
    };


    return (
        <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
            <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">

                {/* Page header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">Quotes</h1>
                        <p className="text-[13px] text-zinc-500 mt-0.5">
                            Create and manage quotes for customers before converting to invoices.
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
                            New Quote
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <StatCard
                        label="Open Quote Value"
                        value={fmt(Math.round(totalOpenValue))}
                        delta={11.2}
                        sub="Draft + sent quotes"
                    />
                    <StatCard
                        label="Accepted This Month"
                        value={fmt(Math.round(acceptedValue))}
                        delta={8.4}
                        sub={`${acceptedThisMonth.length} quote${acceptedThisMonth.length !== 1 ? "s" : ""}`}
                    />
                    <StatCard
                        label="Pending Response"
                        value={String(pendingCount)}
                        sub="Sent, awaiting reply"
                    />
                    <StatCard
                        label="Acceptance Rate"
                        value={`${acceptanceRate}%`}
                        delta={acceptanceRate > 50 ? 3.1 : -5.2}
                        sub="Of all sent quotes"
                    />
                </div>

                {/* Table card */}
                <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

                    {/* Toolbar */}
                    <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <h2 className="text-[14px] font-semibold text-zinc-900">Quote Register</h2>
                            <p className="text-[12px] text-zinc-500">
                                {filtered.length} quote{filtered.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Date range */}
                            <div className="relative">
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
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
                                    placeholder="Customer, quote no., subject..."
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
                                    ["Quote", ""],
                                    ["Customer", ""],
                                    ["Subject", ""],
                                    ["Quote Date", ""],
                                    ["Expiry", ""],
                                    ["Amount", "text-right"],
                                    ["Status", ""],
                                    ["", ""],
                                ].map(([h, cls], i) => (
                                    <th key={i} className={cn(
                                        "px-5 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide", cls,
                                    )}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filtered.map((quote) => {
                                const expiry = getExpirySeverity(quote);
                                const total = calcTotal(quote.lineItems, quote.discountPct, quote.shippingCharges, quote.roundOff, quote.amount);
                                return (
                                    <tr
                                        key={quote.id}
                                        className={cn(
                                            "transition-colors cursor-pointer group",
                                            expiry === "soon"
                                                ? "bg-amber-50/40 hover:bg-amber-50/70"
                                                : expiry === "expired"
                                                    ? "bg-red-50/20 hover:bg-red-50/40"
                                                    : "hover:bg-zinc-50/70",
                                        )}
                                    >
                                        {/* Quote No */}
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                                                    <FileText className="w-3.5 h-3.5 text-zinc-500" />
                                                </div>
                                                <p className="text-[13px] font-medium text-zinc-900">{quote.quoteNo}</p>
                                            </div>
                                        </td>

                                        {/* Customer */}
                                        <td className="px-5 py-3 text-[13px] font-medium text-zinc-700">
                                            {quote.customer}
                                        </td>

                                        {/* Subject */}
                                        <td className="px-5 py-3 text-[13px] text-zinc-500 max-w-[200px] truncate">
                                            {quote.subject}
                                        </td>

                                        {/* Quote Date */}
                                        <td className="px-5 py-3 text-[13px] text-zinc-500 whitespace-nowrap">
                                            {quote.quoteDateLabel}
                                        </td>

                                        {/* Expiry */}
                                        <td className="px-5 py-3">
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
                                                    {quote.expiryDateLabel}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Amount */}
                                        <td className="px-5 py-3 text-right font-mono text-[13px] font-semibold text-zinc-900 tabular-nums">
                                            {fmt(Math.round(total))}
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-3">
                                            <StatusPill status={quote.status} />
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {quote.status === "Draft" && (
                                                    <button
                                                        onClick={() => updateStatus(quote.id, "Sent")}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium text-[#5B5FEF] border border-[#5B5FEF]/20 bg-[#5B5FEF]/5 rounded-lg hover:bg-[#5B5FEF]/10 transition-colors whitespace-nowrap"
                                                    >
                                                        <Send className="w-3 h-3" /> Send
                                                    </button>
                                                )}
                                                {quote.status === "Sent" && (
                                                    <button
                                                        onClick={() => updateStatus(quote.id, "Accepted")}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium text-emerald-700 border border-emerald-200 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap"
                                                    >
                                                        <CheckCircle2 className="w-3 h-3" /> Accept
                                                    </button>
                                                )}
                                                {quote.status === "Accepted" && (
                                                    <button
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium text-zinc-700 border border-zinc-200 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors whitespace-nowrap"
                                                    >
                                                        <FileText className="w-3 h-3" /> Convert
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
                                            <FileText className="w-6 h-6 text-zinc-200" />
                                            <p className="text-[13px] text-zinc-400">No quotes match your filters.</p>
                                            <button
                                                onClick={() => {
                                                    setSearchQuery("");
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
                            <span className="text-[12px] text-zinc-400">
                                {filtered.length} quote{filtered.length !== 1 ? "s" : ""}
                            </span>
                            <span className="text-[13px] font-semibold text-zinc-900 tabular-nums font-mono">
                                Total value:{" "}
                                {fmt(Math.round(filtered.reduce((s, q) => s + calcTotal(q.lineItems, q.discountPct, q.shippingCharges, q.roundOff, q.amount), 0)))}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <CreateQuoteModal onClose={() => setShowModal(false)} onAdd={handleAdd} />
            )}
        </div>
    );
}