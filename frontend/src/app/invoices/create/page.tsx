"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageHeader, SectionCard, FormField, inputCls, selectCls } from "@/components/ui/page-shell";

export default function CreateInvoicePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [invoiceData, setInvoiceData] = useState({
        customerName: "",
        customerEmail: "",
        invoiceDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        currency: "USD",
        paymentTerms: "Net 30",
        referenceNumber: "",
        status: "Draft",
        customerNotes: "",
        termsConditions: "",
        shippingCharges: 0,
        roundOff: 0
    });

    const [items, setItems] = useState([
        { id: Date.now(), description: "", quantity: 1, rate: 0, taxRate: 0, taxAmount: 0, amount: 0, discount: 0 }
    ]);

    const handleItemChange = (id: number, field: string, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                // recalculate
                const baseAmount = updated.quantity * updated.rate;
                const discountAmount = updated.discount || 0;
                const afterDiscount = baseAmount - discountAmount;
                updated.taxAmount = (afterDiscount * (updated.taxRate || 0)) / 100;
                updated.amount = afterDiscount + updated.taxAmount;
                return updated;
            }
            return item;
        }));
    };

    const addItem = () => setItems([...items, { id: Date.now(), description: "", quantity: 1, rate: 0, taxRate: 0, taxAmount: 0, amount: 0, discount: 0 }]);
    const removeItem = (id: number) => setItems(items.filter(item => item.id !== id));

    const subTotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const discountTotal = items.reduce((sum, item) => sum + (item.discount || 0), 0);
    const taxTotal = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
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
            items: items.map(i => ({
                description: i.description,
                quantity: i.quantity,
                rate: i.rate,
                discount: i.discount,
                tax_rate: i.taxRate,
                tax_amount: i.taxAmount,
                amount: i.amount
            }))
        };

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8888/api/invoice`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
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
        <div className="p-6 max-w-[1000px] mx-auto space-y-6 pb-24">
            <PageHeader 
                title="Create Invoice" 
                subtitle="Enter customer, item, and payment details." 
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                <SectionCard title="Customer Information">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Customer Name *">
                            <input required className={inputCls} placeholder="e.g. Acme Corp" value={invoiceData.customerName} onChange={e => setInvoiceData({...invoiceData, customerName: e.target.value})} />
                        </FormField>
                        <FormField label="Customer Email">
                            <input type="email" className={inputCls} placeholder="billing@acme.com" value={invoiceData.customerEmail} onChange={e => setInvoiceData({...invoiceData, customerEmail: e.target.value})} />
                        </FormField>
                    </div>
                </SectionCard>

                <SectionCard title="Invoice Information">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField label="Invoice Date">
                            <input type="date" required className={inputCls} value={invoiceData.invoiceDate} onChange={e => setInvoiceData({...invoiceData, invoiceDate: e.target.value})} />
                        </FormField>
                        <FormField label="Due Date">
                            <input type="date" className={inputCls} value={invoiceData.dueDate} onChange={e => setInvoiceData({...invoiceData, dueDate: e.target.value})} />
                        </FormField>
                        <FormField label="Payment Terms">
                            <select className={selectCls} value={invoiceData.paymentTerms} onChange={e => setInvoiceData({...invoiceData, paymentTerms: e.target.value})}>
                                <option>Due on Receipt</option>
                                <option>Net 15</option>
                                <option>Net 30</option>
                                <option>Net 45</option>
                                <option>Net 60</option>
                            </select>
                        </FormField>
                        <FormField label="Currency">
                            <select className={selectCls} value={invoiceData.currency} onChange={e => setInvoiceData({...invoiceData, currency: e.target.value})}>
                                <option value="USD">USD - US Dollar</option>
                                <option value="INR">INR - Indian Rupee</option>
                                <option value="EUR">EUR - Euro</option>
                            </select>
                        </FormField>
                        <FormField label="Reference Number">
                            <input className={inputCls} placeholder="PO-12345" value={invoiceData.referenceNumber} onChange={e => setInvoiceData({...invoiceData, referenceNumber: e.target.value})} />
                        </FormField>
                        <FormField label="Initial Status">
                            <select className={selectCls} value={invoiceData.status} onChange={e => setInvoiceData({...invoiceData, status: e.target.value})}>
                                <option>Draft</option>
                                <option>Sent</option>
                            </select>
                        </FormField>
                    </div>
                </SectionCard>

                <SectionCard title="Items" noPadding>
                    <div className="overflow-x-auto p-5">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border text-left text-muted-foreground font-semibold">
                                    <th className="pb-3 min-w-[200px]">Item Description</th>
                                    <th className="pb-3 w-24">Qty</th>
                                    <th className="pb-3 w-32">Rate</th>
                                    <th className="pb-3 w-24">Discount</th>
                                    <th className="pb-3 w-24">Tax %</th>
                                    <th className="pb-3 w-32 text-right">Amount</th>
                                    <th className="pb-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={item.id} className="border-b border-border/50">
                                        <td className="py-3 pr-2">
                                            <input required placeholder="Service or Product" className={inputCls} value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} />
                                        </td>
                                        <td className="py-3 pr-2">
                                            <input required type="number" min="1" step="0.01" className={inputCls} value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', Number(e.target.value))} />
                                        </td>
                                        <td className="py-3 pr-2">
                                            <input required type="number" min="0" step="0.01" className={inputCls} value={item.rate} onChange={e => handleItemChange(item.id, 'rate', Number(e.target.value))} />
                                        </td>
                                        <td className="py-3 pr-2">
                                            <input type="number" min="0" step="0.01" className={inputCls} value={item.discount} onChange={e => handleItemChange(item.id, 'discount', Number(e.target.value))} />
                                        </td>
                                        <td className="py-3 pr-2">
                                            <select className={selectCls} value={item.taxRate} onChange={e => handleItemChange(item.id, 'taxRate', Number(e.target.value))}>
                                                <option value={0}>0%</option>
                                                <option value={5}>5%</option>
                                                <option value={12}>12%</option>
                                                <option value={18}>18%</option>
                                                <option value={28}>28%</option>
                                            </select>
                                        </td>
                                        <td className="py-3 text-right font-bold text-foreground">
                                            {item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-3 text-right">
                                            {items.length > 1 && (
                                                <button type="button" onClick={() => removeItem(item.id)} className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-4">
                            <button type="button" onClick={addItem} className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
                                <span className="material-symbols-outlined text-[16px]">add_circle</span> Add another line
                            </button>
                        </div>
                    </div>

                    <div className="p-5 bg-card-container-low flex flex-col md:flex-row justify-between gap-8 border-t border-border">
                        <div className="flex-1 space-y-4">
                            <FormField label="Customer Notes">
                                <textarea className={cn(inputCls, "h-20 resize-none")} placeholder="Thanks for your business." value={invoiceData.customerNotes} onChange={e => setInvoiceData({...invoiceData, customerNotes: e.target.value})} />
                            </FormField>
                            <FormField label="Terms & Conditions">
                                <textarea className={cn(inputCls, "h-20 resize-none")} placeholder="Payment due upon receipt." value={invoiceData.termsConditions} onChange={e => setInvoiceData({...invoiceData, termsConditions: e.target.value})} />
                            </FormField>
                        </div>
                        <div className="w-full md:w-80 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Sub Total</span>
                                <span className="font-semibold text-foreground">{subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </div>
                            {discountTotal > 0 && (
                                <div className="flex justify-between text-sm text-destructive">
                                    <span>Discount</span>
                                    <span>- {discountTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            {taxTotal > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span className="font-semibold text-foreground">{taxTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm items-center">
                                <span className="text-muted-foreground">Shipping Charges</span>
                                <input type="number" className={cn(inputCls, "w-24 h-8 px-2 py-1 text-right")} value={invoiceData.shippingCharges} onChange={e => setInvoiceData({...invoiceData, shippingCharges: Number(e.target.value)})} />
                            </div>
                            <div className="flex justify-between text-sm items-center">
                                <span className="text-muted-foreground">Round Off</span>
                                <input type="number" step="0.01" className={cn(inputCls, "w-24 h-8 px-2 py-1 text-right")} value={invoiceData.roundOff} onChange={e => setInvoiceData({...invoiceData, roundOff: Number(e.target.value)})} />
                            </div>
                            <div className="flex justify-between text-base font-extrabold pt-3 border-t border-border">
                                <span className="text-foreground">Total ({invoiceData.currency})</span>
                                <span className="text-primary">{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                </SectionCard>

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border flex justify-end gap-3 z-50 md:pl-64">
                    <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-lg font-bold text-sm text-muted-foreground hover:bg-card-container transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-lg font-bold text-sm bg-primary text-primary-foreground shadow-sm hover:shadow active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                        {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">save</span>}
                        Save Invoice
                    </button>
                </div>
            </form>
        </div>
    );
}
