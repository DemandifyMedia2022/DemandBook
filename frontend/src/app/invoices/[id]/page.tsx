"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, SectionCard, StatusBadge, Modal, FormField, inputCls, selectCls } from "@/components/ui/page-shell";

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    
    // Payment form
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
    const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
    const [paymentRef, setPaymentRef] = useState("");
    const [paymentNotes, setPaymentNotes] = useState("");

    const fetchInvoice = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8888/api/invoice/${params.id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store'
            });
            const data = await res.json();
            if (data.success) {
                setInvoice(data.invoice);
            } else {
                alert("Invoice not found");
                router.push('/invoices');
            }
        } catch (error) {
            console.error("Failed to fetch invoice", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoice();
    }, [params.id]);

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8888/api/invoice/${params.id}/payments`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount_received: Number(paymentAmount),
                    payment_date: paymentDate,
                    payment_method: paymentMethod,
                    reference_number: paymentRef,
                    notes: paymentNotes
                })
            });
            const data = await res.json();
            if (data.success) {
                setShowPaymentModal(false);
                fetchInvoice(); // refresh data
            } else {
                alert("Failed to record payment: " + data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Error recording payment");
        }
    };

    const handleSendEmail = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8888/api/invoice/${params.id}/send-email`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                alert(`Invoice successfully sent to ${invoice.customer_email}`);
                fetchInvoice(); // refresh to show status and timeline updates
            } else {
                alert("Failed to send email: " + data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Error sending email");
        }
    };

    if (loading) return <div className="p-10 text-center text-muted-foreground animate-pulse">Loading Invoice...</div>;
    if (!invoice) return null;

    return (
        <div className="p-6 max-w-[1200px] mx-auto space-y-6">
            <PageHeader 
                title={`Invoice ${invoice.number}`}
                subtitle={`For ${invoice.customer_name}`}
                actions={
                    <div className="flex gap-2">
                        <button onClick={() => router.push(`/invoices/edit/${params.id}`)} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-card-container print:hidden">
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            Edit
                        </button>
                        <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-card-container print:hidden">
                            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                            PDF
                        </button>
                        <button onClick={handleSendEmail} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-card-container print:hidden">
                            <span className="material-symbols-outlined text-[16px]">mail</span>
                            Send Email
                        </button>
                        {invoice.balance > 0 && (
                            <button onClick={() => {
                                setPaymentAmount(invoice.balance.toString());
                                setShowPaymentModal(true);
                            }} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-sm transition-all active:scale-95 print:hidden">
                                <span className="material-symbols-outlined text-[17px]">payments</span>
                                Record Payment
                            </button>
                        )}
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: Preview */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-xl shadow-sm p-10 print:shadow-none print:border-none">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h1 className="text-3xl font-extrabold text-foreground tracking-tight">INVOICE</h1>
                                <p className="text-sm font-bold text-muted-foreground mt-1">{invoice.number}</p>
                                <div className="mt-2"><StatusBadge status={invoice.status} /></div>
                            </div>
                            <div className="text-right">
                                <h3 className="font-bold text-foreground text-lg">DemandBooks SaaS</h3>
                                <p className="text-sm text-muted-foreground mt-1">123 Business Avenue<br/>Tech Park, TP 400101<br/>contact@demandbooks.io</p>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-border">
                            <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Bill To</h4>
                                <p className="font-bold text-foreground text-base">{invoice.customer_name}</p>
                                <p className="text-sm text-muted-foreground mt-1">{invoice.customer_email}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground mb-1">Invoice Date:</p>
                                    <p className="font-semibold text-foreground">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1">Due Date:</p>
                                    <p className="font-semibold text-foreground">{new Date(invoice.due_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1">Terms:</p>
                                    <p className="font-semibold text-foreground">{invoice.payment_terms || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1">Reference:</p>
                                    <p className="font-semibold text-foreground">{invoice.reference_number || '—'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <table className="w-full text-sm mb-8">
                            <thead>
                                <tr className="border-b-2 border-border text-left text-muted-foreground font-semibold">
                                    <th className="py-2">Description</th>
                                    <th className="py-2 text-right">Qty</th>
                                    <th className="py-2 text-right">Rate</th>
                                    <th className="py-2 text-right">Tax</th>
                                    <th className="py-2 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item: any) => (
                                    <tr key={item.id} className="border-b border-border/50">
                                        <td className="py-3 font-medium text-foreground">{item.description}</td>
                                        <td className="py-3 text-right text-muted-foreground">{item.quantity} {item.unit}</td>
                                        <td className="py-3 text-right text-muted-foreground">{Number(item.rate).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                        <td className="py-3 text-right text-muted-foreground">{Number(item.tax_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                        <td className="py-3 text-right font-bold text-foreground">{Number(item.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-64 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Sub Total</span>
                                    <span className="font-semibold text-foreground">{Number(invoice.sub_total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                </div>
                                {Number(invoice.discount_total) > 0 && (
                                    <div className="flex justify-between text-sm text-destructive">
                                        <span>Discount</span>
                                        <span>- {Number(invoice.discount_total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                {Number(invoice.tax_total) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Tax</span>
                                        <span className="font-semibold text-foreground">{Number(invoice.tax_total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                {Number(invoice.shipping_charges) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span className="font-semibold text-foreground">{Number(invoice.shipping_charges).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-extrabold py-3 border-t-2 border-border">
                                    <span className="text-foreground">Total ({invoice.currency})</span>
                                    <span className="text-primary">{Number(invoice.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold bg-card-container-low p-2 rounded">
                                    <span className="text-muted-foreground">Balance Due</span>
                                    <span className="text-destructive">{Number(invoice.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Timeline & Payments */}
                <div className="space-y-6 print:hidden">
                    {invoice.payments && invoice.payments.length > 0 && (
                        <SectionCard title="Payment History">
                            <div className="space-y-4">
                                {invoice.payments.map((payment: any) => (
                                    <div key={payment.id} className="flex justify-between items-center pb-4 border-b border-border/50 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-bold text-sm text-foreground">{Number(payment.amount_received).toLocaleString("en-IN", { minimumFractionDigits: 2 })} {invoice.currency}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(payment.payment_date).toLocaleDateString()} via {payment.payment_method}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-green-600 text-xl">check_circle</span>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    <SectionCard title="Activity Timeline">
                        <div className="relative pl-4 border-l-2 border-border space-y-6">
                            {invoice.activity.map((log: any) => (
                                <div key={log.id} className="relative">
                                    <div className="absolute -left-[23px] top-0 w-3 h-3 bg-primary rounded-full ring-4 ring-card" />
                                    <p className="font-bold text-xs text-foreground">{log.action}</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">{log.remarks}</p>
                                    <p className="text-[10px] text-muted-foreground/70 mt-1">{new Date(log.timestamp).toLocaleString()} • {log.user_name || 'System'}</p>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <Modal title="Record Payment" onClose={() => setShowPaymentModal(false)}>
                    <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
                        <div className="p-3 bg-card-container-low rounded-lg flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-muted-foreground">Outstanding Balance</span>
                            <span className="font-bold text-destructive">{Number(invoice.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })} {invoice.currency}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Amount Received">
                                <input type="number" step="0.01" required max={invoice.balance} className={inputCls} value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} />
                            </FormField>
                            <FormField label="Payment Date">
                                <input type="date" required className={inputCls} value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
                            </FormField>
                        </div>
                        
                        <FormField label="Payment Method">
                            <select className={selectCls} value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                                <option>Bank Transfer</option>
                                <option>Cash</option>
                                <option>Credit Card</option>
                                <option>UPI</option>
                                <option>Cheque</option>
                            </select>
                        </FormField>

                        <FormField label="Reference Number">
                            <input className={inputCls} placeholder="Transaction ID, Cheque No" value={paymentRef} onChange={e => setPaymentRef(e.target.value)} />
                        </FormField>

                        <div className="pt-4 border-t border-border flex justify-end gap-3">
                            <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm font-semibold text-muted-foreground">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors">Record Payment</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
