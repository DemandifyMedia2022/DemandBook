// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { cn } from "@/lib/utils";
// import { PageHeader, SectionCard, FormField, inputCls, selectCls } from "@/components/ui/page-shell";

// export default function CreateInvoicePage() {
//     const router = useRouter();
//     const [loading, setLoading] = useState(false);

//     const [invoiceData, setInvoiceData] = useState({
//         customerName: "",
//         customerEmail: "",
//         invoiceDate: new Date().toISOString().split("T")[0],
//         dueDate: "",
//         currency: "USD",
//         paymentTerms: "Net 30",
//         referenceNumber: "",
//         status: "Draft",
//         customerNotes: "",
//         termsConditions: "",
//         shippingCharges: 0,
//         roundOff: 0
//     });

//     const [items, setItems] = useState([
//         { id: Date.now(), description: "", quantity: 1, rate: 0, taxRate: 0, taxAmount: 0, amount: 0, discount: 0 }
//     ]);

//     const handleItemChange = (id: number, field: string, value: any) => {
//         setItems(items.map(item => {
//             if (item.id === id) {
//                 const updated = { ...item, [field]: value };
//                 // recalculate
//                 const baseAmount = updated.quantity * updated.rate;
//                 const discountAmount = updated.discount || 0;
//                 const afterDiscount = baseAmount - discountAmount;
//                 updated.taxAmount = (afterDiscount * (updated.taxRate || 0)) / 100;
//                 updated.amount = afterDiscount + updated.taxAmount;
//                 return updated;
//             }
//             return item;
//         }));
//     };

//     const addItem = () => setItems([...items, { id: Date.now(), description: "", quantity: 1, rate: 0, taxRate: 0, taxAmount: 0, amount: 0, discount: 0 }]);
//     const removeItem = (id: number) => setItems(items.filter(item => item.id !== id));

//     const subTotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
//     const discountTotal = items.reduce((sum, item) => sum + (item.discount || 0), 0);
//     const taxTotal = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
//     const grandTotal = subTotal - discountTotal + taxTotal + Number(invoiceData.shippingCharges) + Number(invoiceData.roundOff);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setLoading(true);

//         const payload = {
//             customerName: invoiceData.customerName,
//             customerEmail: invoiceData.customerEmail,
//             invoice_date: invoiceData.invoiceDate,
//             due_date: invoiceData.dueDate,
//             currency: invoiceData.currency,
//             payment_terms: invoiceData.paymentTerms,
//             reference_number: invoiceData.referenceNumber,
//             status: invoiceData.status,
//             customer_notes: invoiceData.customerNotes,
//             terms_conditions: invoiceData.termsConditions,
//             shipping_charges: Number(invoiceData.shippingCharges),
//             round_off: Number(invoiceData.roundOff),
//             items: items.map(i => ({
//                 description: i.description,
//                 quantity: i.quantity,
//                 rate: i.rate,
//                 discount: i.discount,
//                 tax_rate: i.taxRate,
//                 tax_amount: i.taxAmount,
//                 amount: i.amount
//             }))
//         };

//         try {
//             const token = localStorage.getItem("token");
//             const res = await fetch(`http://localhost:8888/api/invoice`, {
//                 method: 'POST',
//                 headers: { 
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: JSON.stringify(payload)
//             });
//             const data = await res.json();
//             if (data.success) {
//                 router.push(`/invoices/${data.invoice.id}`);
//             } else {
//                 alert("Failed to create invoice: " + data.message);
//             }
//         } catch (error) {
//             console.error(error);
//             alert("Error creating invoice");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="p-6 max-w-[1000px] mx-auto space-y-6 pb-24">
//             <PageHeader 
//                 title="Create Invoice" 
//                 subtitle="Enter customer, item, and payment details." 
//             />

//             <form onSubmit={handleSubmit} className="space-y-6">
//                 <SectionCard title="Customer Information">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <FormField label="Customer Name *">
//                             <input required className={inputCls} placeholder="e.g. Acme Corp" value={invoiceData.customerName} onChange={e => setInvoiceData({...invoiceData, customerName: e.target.value})} />
//                         </FormField>
//                         <FormField label="Customer Email">
//                             <input type="email" className={inputCls} placeholder="billing@acme.com" value={invoiceData.customerEmail} onChange={e => setInvoiceData({...invoiceData, customerEmail: e.target.value})} />
//                         </FormField>
//                     </div>
//                 </SectionCard>

//                 <SectionCard title="Invoice Information">
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                         <FormField label="Invoice Date">
//                             <input type="date" required className={inputCls} value={invoiceData.invoiceDate} onChange={e => setInvoiceData({...invoiceData, invoiceDate: e.target.value})} />
//                         </FormField>
//                         <FormField label="Due Date">
//                             <input type="date" className={inputCls} value={invoiceData.dueDate} onChange={e => setInvoiceData({...invoiceData, dueDate: e.target.value})} />
//                         </FormField>
//                         <FormField label="Payment Terms">
//                             <select className={selectCls} value={invoiceData.paymentTerms} onChange={e => setInvoiceData({...invoiceData, paymentTerms: e.target.value})}>
//                                 <option>Due on Receipt</option>
//                                 <option>Net 15</option>
//                                 <option>Net 30</option>
//                                 <option>Net 45</option>
//                                 <option>Net 60</option>
//                             </select>
//                         </FormField>
//                         <FormField label="Currency">
//                             <select className={selectCls} value={invoiceData.currency} onChange={e => setInvoiceData({...invoiceData, currency: e.target.value})}>
//                                 <option value="USD">USD - US Dollar</option>
//                                 <option value="INR">INR - Indian Rupee</option>
//                                 <option value="EUR">EUR - Euro</option>
//                             </select>
//                         </FormField>
//                         <FormField label="Reference Number">
//                             <input className={inputCls} placeholder="PO-12345" value={invoiceData.referenceNumber} onChange={e => setInvoiceData({...invoiceData, referenceNumber: e.target.value})} />
//                         </FormField>
//                         <FormField label="Initial Status">
//                             <select className={selectCls} value={invoiceData.status} onChange={e => setInvoiceData({...invoiceData, status: e.target.value})}>
//                                 <option>Draft</option>
//                                 <option>Sent</option>
//                             </select>
//                         </FormField>
//                     </div>
//                 </SectionCard>

//                 <SectionCard title="Items" noPadding>
//                     <div className="overflow-x-auto p-5">
//                         <table className="w-full text-sm">
//                             <thead>
//                                 <tr className="border-b border-border text-left text-muted-foreground font-semibold">
//                                     <th className="pb-3 min-w-[200px]">Item Description</th>
//                                     <th className="pb-3 w-24">Qty</th>
//                                     <th className="pb-3 w-32">Rate</th>
//                                     <th className="pb-3 w-24">Discount</th>
//                                     <th className="pb-3 w-24">Tax %</th>
//                                     <th className="pb-3 w-32 text-right">Amount</th>
//                                     <th className="pb-3 w-10"></th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {items.map((item, index) => (
//                                     <tr key={item.id} className="border-b border-border/50">
//                                         <td className="py-3 pr-2">
//                                             <input required placeholder="Service or Product" className={inputCls} value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} />
//                                         </td>
//                                         <td className="py-3 pr-2">
//                                             <input required type="number" min="1" step="0.01" className={inputCls} value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', Number(e.target.value))} />
//                                         </td>
//                                         <td className="py-3 pr-2">
//                                             <input required type="number" min="0" step="0.01" className={inputCls} value={item.rate} onChange={e => handleItemChange(item.id, 'rate', Number(e.target.value))} />
//                                         </td>
//                                         <td className="py-3 pr-2">
//                                             <input type="number" min="0" step="0.01" className={inputCls} value={item.discount} onChange={e => handleItemChange(item.id, 'discount', Number(e.target.value))} />
//                                         </td>
//                                         <td className="py-3 pr-2">
//                                             <select className={selectCls} value={item.taxRate} onChange={e => handleItemChange(item.id, 'taxRate', Number(e.target.value))}>
//                                                 <option value={0}>0%</option>
//                                                 <option value={5}>5%</option>
//                                                 <option value={12}>12%</option>
//                                                 <option value={18}>18%</option>
//                                                 <option value={28}>28%</option>
//                                             </select>
//                                         </td>
//                                         <td className="py-3 text-right font-bold text-foreground">
//                                             {item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
//                                         </td>
//                                         <td className="py-3 text-right">
//                                             {items.length > 1 && (
//                                                 <button type="button" onClick={() => removeItem(item.id)} className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
//                                                     <span className="material-symbols-outlined text-[18px]">close</span>
//                                                 </button>
//                                             )}
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                         <div className="mt-4">
//                             <button type="button" onClick={addItem} className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
//                                 <span className="material-symbols-outlined text-[16px]">add_circle</span> Add another line
//                             </button>
//                         </div>
//                     </div>

//                     <div className="p-5 bg-card-container-low flex flex-col md:flex-row justify-between gap-8 border-t border-border">
//                         <div className="flex-1 space-y-4">
//                             <FormField label="Customer Notes">
//                                 <textarea className={cn(inputCls, "h-20 resize-none")} placeholder="Thanks for your business." value={invoiceData.customerNotes} onChange={e => setInvoiceData({...invoiceData, customerNotes: e.target.value})} />
//                             </FormField>
//                             <FormField label="Terms & Conditions">
//                                 <textarea className={cn(inputCls, "h-20 resize-none")} placeholder="Payment due upon receipt." value={invoiceData.termsConditions} onChange={e => setInvoiceData({...invoiceData, termsConditions: e.target.value})} />
//                             </FormField>
//                         </div>
//                         <div className="w-full md:w-80 space-y-3">
//                             <div className="flex justify-between text-sm">
//                                 <span className="text-muted-foreground">Sub Total</span>
//                                 <span className="font-semibold text-foreground">{subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
//                             </div>
//                             {discountTotal > 0 && (
//                                 <div className="flex justify-between text-sm text-destructive">
//                                     <span>Discount</span>
//                                     <span>- {discountTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
//                                 </div>
//                             )}
//                             {taxTotal > 0 && (
//                                 <div className="flex justify-between text-sm">
//                                     <span className="text-muted-foreground">Tax</span>
//                                     <span className="font-semibold text-foreground">{taxTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
//                                 </div>
//                             )}
//                             <div className="flex justify-between text-sm items-center">
//                                 <span className="text-muted-foreground">Shipping Charges</span>
//                                 <input type="number" className={cn(inputCls, "w-24 h-8 px-2 py-1 text-right")} value={invoiceData.shippingCharges} onChange={e => setInvoiceData({...invoiceData, shippingCharges: Number(e.target.value)})} />
//                             </div>
//                             <div className="flex justify-between text-sm items-center">
//                                 <span className="text-muted-foreground">Round Off</span>
//                                 <input type="number" step="0.01" className={cn(inputCls, "w-24 h-8 px-2 py-1 text-right")} value={invoiceData.roundOff} onChange={e => setInvoiceData({...invoiceData, roundOff: Number(e.target.value)})} />
//                             </div>
//                             <div className="flex justify-between text-base font-extrabold pt-3 border-t border-border">
//                                 <span className="text-foreground">Total ({invoiceData.currency})</span>
//                                 <span className="text-primary">{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
//                             </div>
//                         </div>
//                     </div>
//                 </SectionCard>

//                 <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border flex justify-end gap-3 z-50 md:pl-64">
//                     <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-lg font-bold text-sm text-muted-foreground hover:bg-card-container transition-colors">
//                         Cancel
//                     </button>
//                     <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-lg font-bold text-sm bg-primary text-primary-foreground shadow-sm hover:shadow active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
//                         {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">save</span>}
//                         Save Invoice
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// }



"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Plus,
    X,
    Save,
    Loader2,
    ChevronLeft,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Shared field styles
// ---------------------------------------------------------------------------
const FIELD = "w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 transition-colors text-zinc-800 placeholder:text-zinc-400";
const SELECT = cn(FIELD, "appearance-none cursor-pointer");

function Label({ children }: { children: React.ReactNode }) {
    return (
        <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
            {children}
        </label>
    );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="px-6 py-4 border-b border-zinc-100">
                <h2 className="text-[14px] font-semibold text-zinc-900">{title}</h2>
            </div>
            {children}
        </div>
    );
}

function fmt(n: number) {
    return n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface LineItem {
    id: number;
    description: string;
    quantity: number;
    rate: number;
    discount: number;
    taxRate: number;
    taxAmount: number;
    amount: number;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function CreateInvoicePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [invoiceData, setInvoiceData] = useState({
        customerName: "",
        customerEmail: "",
        invoiceDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        currency: "INR",
        paymentTerms: "Net 30",
        referenceNumber: "",
        status: "Draft",
        customerNotes: "",
        termsConditions: "",
        shippingCharges: 0,
        roundOff: 0,
    });

    const [items, setItems] = useState<LineItem[]>([
        { id: Date.now(), description: "", quantity: 1, rate: 0, discount: 0, taxRate: 0, taxAmount: 0, amount: 0 },
    ]);

    const handleItemChange = (id: number, field: string, value: number | string) => {
        setItems(items.map((item) => {
            if (item.id !== id) return item;
            const updated = { ...item, [field]: value };
            const base = updated.quantity * updated.rate;
            const afterDiscount = base - (updated.discount || 0);
            updated.taxAmount = (afterDiscount * (updated.taxRate || 0)) / 100;
            updated.amount = afterDiscount + updated.taxAmount;
            return updated;
        }));
    };

    const addItem = () =>
        setItems([...items, { id: Date.now(), description: "", quantity: 1, rate: 0, discount: 0, taxRate: 0, taxAmount: 0, amount: 0 }]);

    const removeItem = (id: number) => setItems(items.filter((i) => i.id !== id));

    const subTotal = items.reduce((s, i) => s + i.quantity * i.rate, 0);
    const discountTotal = items.reduce((s, i) => s + (i.discount || 0), 0);
    const taxTotal = items.reduce((s, i) => s + (i.taxAmount || 0), 0);
    const grandTotal = subTotal - discountTotal + taxTotal + Number(invoiceData.shippingCharges) + Number(invoiceData.roundOff);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            customerName: invoiceData.customerName,
            customerEmail: invoiceData.customerEmail,
            invoice_date: invoiceData.invoiceDate,
            due_date: invoiceData.dueDate,
            currency: invoiceData.currency,
            payment_terms: invoiceData.paymentTerms,
            reference_number: invoiceData.referenceNumber,
            status: invoiceData.status,
            customer_notes: invoiceData.customerNotes,
            terms_conditions: invoiceData.termsConditions,
            shipping_charges: Number(invoiceData.shippingCharges),
            round_off: Number(invoiceData.roundOff),
            items: items.map((i) => ({
                description: i.description,
                quantity: i.quantity,
                rate: i.rate,
                discount: i.discount,
                tax_rate: i.taxRate,
                tax_amount: i.taxAmount,
                amount: i.amount,
            })),
        };

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8888/api/invoice`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                router.push(`/invoices/${data.invoice.id}`);
            } else {
                alert("Failed to create invoice: " + data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Error creating invoice");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
            <div className="max-w-[1000px] mx-auto px-8 py-8 pb-28 space-y-6">

                {/* Page header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="inline-flex items-center gap-1 text-[12px] text-zinc-400 hover:text-zinc-600 transition-colors"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                Invoices
                            </button>
                        </div>
                        <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">Create Invoice</h1>
                        <p className="text-[13px] text-zinc-500 mt-0.5">Enter customer, item, and payment details.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Customer Information */}
                    <SectionCard title="Customer Information">
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <Label>Customer Name <span className="text-red-400 normal-case font-normal">*</span></Label>
                                <input required className={FIELD} placeholder="e.g. Acme Corp" value={invoiceData.customerName} onChange={(e) => setInvoiceData({ ...invoiceData, customerName: e.target.value })} />
                            </div>
                            <div>
                                <Label>Customer Email</Label>
                                <input type="email" className={FIELD} placeholder="billing@acme.com" value={invoiceData.customerEmail} onChange={(e) => setInvoiceData({ ...invoiceData, customerEmail: e.target.value })} />
                            </div>
                        </div>
                    </SectionCard>

                    {/* Invoice Information */}
                    <SectionCard title="Invoice Details">
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <Label>Invoice Date</Label>
                                <input type="date" required className={FIELD} value={invoiceData.invoiceDate} onChange={(e) => setInvoiceData({ ...invoiceData, invoiceDate: e.target.value })} />
                            </div>
                            <div>
                                <Label>Due Date</Label>
                                <input type="date" className={FIELD} value={invoiceData.dueDate} onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })} />
                            </div>
                            <div>
                                <Label>Payment Terms</Label>
                                <select className={SELECT} value={invoiceData.paymentTerms} onChange={(e) => setInvoiceData({ ...invoiceData, paymentTerms: e.target.value })}>
                                    <option>Due on Receipt</option>
                                    <option>Net 15</option>
                                    <option>Net 30</option>
                                    <option>Net 45</option>
                                    <option>Net 60</option>
                                </select>
                            </div>
                            <div>
                                <Label>Currency</Label>
                                <select className={SELECT} value={invoiceData.currency} onChange={(e) => setInvoiceData({ ...invoiceData, currency: e.target.value })}>
                                    <option value="INR">INR — Indian Rupee</option>
                                    <option value="USD">USD — US Dollar</option>
                                    <option value="EUR">EUR — Euro</option>
                                </select>
                            </div>
                            <div>
                                <Label>Reference Number</Label>
                                <input className={FIELD} placeholder="PO-12345" value={invoiceData.referenceNumber} onChange={(e) => setInvoiceData({ ...invoiceData, referenceNumber: e.target.value })} />
                            </div>
                            <div>
                                <Label>Initial Status</Label>
                                <select className={SELECT} value={invoiceData.status} onChange={(e) => setInvoiceData({ ...invoiceData, status: e.target.value })}>
                                    <option>Draft</option>
                                    <option>Sent</option>
                                </select>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Line Items */}
                    <SectionCard title="Line Items">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px]">
                                <thead>
                                    <tr className="border-b border-zinc-100">
                                        <th className="px-6 py-3 text-left text-[11px] font-medium text-zinc-400 uppercase tracking-wide min-w-[220px]">Description</th>
                                        <th className="px-3 py-3 text-left text-[11px] font-medium text-zinc-400 uppercase tracking-wide w-20">Qty</th>
                                        <th className="px-3 py-3 text-left text-[11px] font-medium text-zinc-400 uppercase tracking-wide w-28">Rate</th>
                                        <th className="px-3 py-3 text-left text-[11px] font-medium text-zinc-400 uppercase tracking-wide w-24">Discount</th>
                                        <th className="px-3 py-3 text-left text-[11px] font-medium text-zinc-400 uppercase tracking-wide w-24">Tax %</th>
                                        <th className="px-6 py-3 text-right text-[11px] font-medium text-zinc-400 uppercase tracking-wide w-32">Amount</th>
                                        <th className="w-10" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {items.map((item) => (
                                        <tr key={item.id} className="group">
                                            <td className="px-6 py-3">
                                                <input
                                                    required
                                                    placeholder="Service or product name"
                                                    className={FIELD}
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <input
                                                    required type="number" min="1" step="0.01"
                                                    className={FIELD}
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))}
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <input
                                                    required type="number" min="0" step="0.01"
                                                    className={FIELD}
                                                    value={item.rate}
                                                    onChange={(e) => handleItemChange(item.id, "rate", Number(e.target.value))}
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <input
                                                    type="number" min="0" step="0.01"
                                                    className={FIELD}
                                                    value={item.discount}
                                                    onChange={(e) => handleItemChange(item.id, "discount", Number(e.target.value))}
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <select
                                                    className={SELECT}
                                                    value={item.taxRate}
                                                    onChange={(e) => handleItemChange(item.id, "taxRate", Number(e.target.value))}
                                                >
                                                    <option value={0}>0%</option>
                                                    <option value={5}>5%</option>
                                                    <option value={12}>12%</option>
                                                    <option value={18}>18%</option>
                                                    <option value={28}>28%</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-3 text-right font-mono text-[13px] font-semibold text-zinc-900 tabular-nums">
                                                {fmt(item.amount)}
                                            </td>
                                            <td className="pr-4 py-3 text-center">
                                                {items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item.id)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-zinc-300 hover:text-red-500"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Add line */}
                        <div className="px-6 py-3 border-t border-zinc-100">
                            <button
                                type="button"
                                onClick={addItem}
                                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#5B5FEF] hover:text-[#4a4ed4] transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add line item
                            </button>
                        </div>

                        {/* Notes + Totals */}
                        <div className="border-t border-zinc-100 px-6 py-6 flex flex-col md:flex-row gap-8 bg-zinc-50/40">

                            {/* Notes */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <Label>Customer Notes</Label>
                                    <textarea
                                        rows={3}
                                        className={cn(FIELD, "resize-none")}
                                        placeholder="Thanks for your business."
                                        value={invoiceData.customerNotes}
                                        onChange={(e) => setInvoiceData({ ...invoiceData, customerNotes: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Terms & Conditions</Label>
                                    <textarea
                                        rows={3}
                                        className={cn(FIELD, "resize-none")}
                                        placeholder="Payment due upon receipt."
                                        value={invoiceData.termsConditions}
                                        onChange={(e) => setInvoiceData({ ...invoiceData, termsConditions: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="w-full md:w-72 space-y-2.5">
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-zinc-500">Sub Total</span>
                                    <span className="font-mono font-semibold text-zinc-900 tabular-nums">{fmt(subTotal)}</span>
                                </div>

                                {discountTotal > 0 && (
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-red-500">Discount</span>
                                        <span className="font-mono font-semibold text-red-500 tabular-nums">− {fmt(discountTotal)}</span>
                                    </div>
                                )}

                                {taxTotal > 0 && (
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-zinc-500">Tax</span>
                                        <span className="font-mono font-semibold text-zinc-900 tabular-nums">{fmt(taxTotal)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-zinc-500">Shipping</span>
                                    <input
                                        type="number"
                                        className="w-24 px-2 py-1 text-[13px] text-right bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 font-mono tabular-nums"
                                        value={invoiceData.shippingCharges}
                                        onChange={(e) => setInvoiceData({ ...invoiceData, shippingCharges: Number(e.target.value) })}
                                    />
                                </div>

                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-zinc-500">Round Off</span>
                                    <input
                                        type="number" step="0.01"
                                        className="w-24 px-2 py-1 text-[13px] text-right bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 font-mono tabular-nums"
                                        value={invoiceData.roundOff}
                                        onChange={(e) => setInvoiceData({ ...invoiceData, roundOff: Number(e.target.value) })}
                                    />
                                </div>

                                <div className="pt-3 border-t border-zinc-200 flex justify-between items-center">
                                    <span className="text-[14px] font-semibold text-zinc-900">Total ({invoiceData.currency})</span>
                                    <span className="font-mono text-[18px] font-bold text-[#5B5FEF] tabular-nums">{fmt(grandTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </SectionCard>
                </form>
            </div>

            {/* Sticky footer */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 px-8 py-4 flex justify-end gap-3 md:pl-64">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-[13px] font-medium text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    form=""
                    disabled={loading}
                    onClick={(e) => {
                        const form = document.querySelector("form");
                        if (form) form.requestSubmit();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Invoice
                </button>
            </div>
        </div>
    );
}