"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  PageHeader, StatCard, SectionCard, StatusBadge,
  SearchBar, FilterSelect, Th, Td, TableRow, EmptyState, FAB, Modal, FormField, inputCls, selectCls,
} from "@/components/ui/page-shell";

interface Bill {
  number: string;
  vendor: string;
  amount: number;
  dueDate: string;
  paymentMethod: string;
  status: "Overdue" | "Open" | "Paid";
  clearedDate?: string;
}

const initialBills: Bill[] = [
  { number: "BILL-2024-001", vendor: "Stellar Logistics", amount: 12400.0, dueDate: "Oct 12, 2023", paymentMethod: "Bank Transfer", status: "Overdue" },
  { number: "BILL-2024-002", vendor: "CloudNode Services", amount: 1250.5, dueDate: "Oct 28, 2023", paymentMethod: "Credit Card", status: "Open" },
  { number: "BILL-2024-003", vendor: "OfficeHub Co.", amount: 482.0, dueDate: "Oct 20, 2023", paymentMethod: "ACH", status: "Paid", clearedDate: "Oct 20, 2023" },
  { number: "BILL-2024-004", vendor: "Global Ads Agency", amount: 6872.4, dueDate: "Nov 05, 2023", paymentMethod: "Wire", status: "Open" },
  { number: "BILL-2024-005", vendor: "Rapid Courier Ltd", amount: 3200.0, dueDate: "Nov 10, 2023", paymentMethod: "UPI", status: "Open" },
];

export default function Bills() {
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newNumber, setNewNumber] = useState("BILL-2024-006");
  const [newVendor, setNewVendor] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newPaymentMethod, setNewPaymentMethod] = useState("Bank Transfer");
  const [newStatus, setNewStatus] = useState<Bill["status"]>("Open");

  const handleRecordPayment = (billNumber: string) => {
    setBills(bills.map((b) =>
      b.number === billNumber
        ? { ...b, status: "Paid", clearedDate: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) }
        : b
    ));
  };

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor || !newAmount) return;
    setBills([{ number: newNumber, vendor: newVendor, amount: parseFloat(newAmount), dueDate: newDueDate || "—", paymentMethod: newPaymentMethod, status: newStatus }, ...bills]);
    setShowCreateModal(false);
    setNewNumber("BILL-2024-" + String(bills.length + 6).padStart(3, "0"));
    setNewVendor(""); setNewAmount(""); setNewDueDate(""); setNewPaymentMethod("Bank Transfer"); setNewStatus("Open");
  };

  const filtered = bills.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      (b.vendor.toLowerCase().includes(q) || b.number.toLowerCase().includes(q)) &&
      (selectedStatus === "All" || b.status === selectedStatus)
    );
  });

  const totalPayable = bills.filter((b) => b.status !== "Paid").reduce((s, b) => s + b.amount, 0);
  const overdueTotal = bills.filter((b) => b.status === "Overdue").reduce((s, b) => s + b.amount, 0);
  const paidCount = bills.filter((b) => b.status === "Paid").length;

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6">
      <PageHeader
        title="Bills"
        subtitle="Manage vendor bills, track payables, and record payments."
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[17px]">add</span>
            New Bill
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Outstanding Payables" value={`₹${totalPayable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="receipt_long" trend={{ label: `${bills.filter(b => b.status !== "Paid").length} open bills`, up: null }} />
        <StatCard label="Overdue Amount" value={`₹${overdueTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="warning" iconColor="text-error" trend={{ label: "Needs immediate action", up: false }} />
        <StatCard label="Cleared Bills" value={String(paidCount)} icon="check_circle" trend={{ label: "Bills settled this month", up: true }} />
      </div>

      <SectionCard
        title="Bills Register"
        subtitle={`${filtered.length} bills`}
        noPadding
        actions={
          <div className="flex items-center gap-2">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search bills..." />
            <FilterSelect value={selectedStatus} onChange={setSelectedStatus} options={["All", "Open", "Overdue", "Paid"]} />
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr>
                <Th>Bill #</Th>
                <Th>Vendor</Th>
                <Th>Payment Method</Th>
                <Th right>Amount</Th>
                <Th>Due Date</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((bill) => (
                <TableRow key={bill.number}>
                  <Td className="font-mono font-bold text-primary">{bill.number}</Td>
                  <Td className="font-semibold text-on-surface">{bill.vendor}</Td>
                  <Td>
                    <span className="flex items-center gap-1 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[15px]">credit_card</span>
                      {bill.paymentMethod}
                    </span>
                  </Td>
                  <Td className="text-right font-bold font-mono text-on-surface">
                    ₹{bill.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </Td>
                  <Td className={cn(bill.status === "Overdue" ? "text-error font-bold" : "text-on-surface-variant")}>
                    {bill.clearedDate ? <span className="text-green-600">Cleared {bill.clearedDate}</span> : bill.dueDate}
                  </Td>
                  <Td><StatusBadge status={bill.status} /></Td>
                  <Td>
                    {bill.status !== "Paid" && (
                      <button
                        onClick={() => handleRecordPayment(bill.number)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">payments</span>
                        Record Payment
                      </button>
                    )}
                  </Td>
                </TableRow>
              ))}
              {filtered.length === 0 && <EmptyState icon="receipt_long" message="No bills match the filter." colSpan={7} />}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <FAB label="New Bill" onClick={() => setShowCreateModal(true)} />

      {showCreateModal && (
        <Modal title="Record New Bill" onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreateBill} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Bill Number">
                <input className={inputCls} required value={newNumber} onChange={(e) => setNewNumber(e.target.value)} />
              </FormField>
              <FormField label="Status">
                <select className={selectCls} value={newStatus} onChange={(e) => setNewStatus(e.target.value as Bill["status"])}>
                  <option value="Open">Open</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Paid">Paid</option>
                </select>
              </FormField>
            </div>
            <FormField label="Vendor Name">
              <input className={inputCls} required placeholder="e.g. Acme Supplies" value={newVendor} onChange={(e) => setNewVendor(e.target.value)} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Amount (₹)">
                <input type="number" step="0.01" required placeholder="0.00" className={inputCls} value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
              </FormField>
              <FormField label="Due Date">
                <input className={inputCls} placeholder="Nov 30, 2023" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
              </FormField>
            </div>
            <FormField label="Payment Method">
              <select className={selectCls} value={newPaymentMethod} onChange={(e) => setNewPaymentMethod(e.target.value)}>
                {["Bank Transfer", "Credit Card", "ACH", "Wire", "UPI", "Cash"].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </FormField>
            <div className="pt-4 border-t border-outline-variant flex justify-end gap-3">
              <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-outline-variant rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">Create Bill</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
