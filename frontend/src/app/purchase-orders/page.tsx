"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  PageHeader, StatCard, SectionCard, StatusBadge,
  SearchBar, FilterSelect, Th, Td, TableRow, EmptyState, FAB, Modal, FormField, inputCls, selectCls,
} from "@/components/ui/page-shell";

interface PO {
  number: string;
  vendor: string;
  items: number;
  total: number;
  deliveryDate: string;
  status: "Approved" | "Pending" | "Draft" | "Rejected";
  createdDate: string;
}

const initialPOs: PO[] = [
  { number: "PO-2024-041", vendor: "Stellar Logistics", items: 12, total: 48200.0, deliveryDate: "Nov 10, 2023", status: "Approved", createdDate: "Oct 18, 2023" },
  { number: "PO-2024-042", vendor: "TechSystems Inc.", items: 4, total: 12450.0, deliveryDate: "Nov 15, 2023", status: "Pending", createdDate: "Oct 20, 2023" },
  { number: "PO-2024-043", vendor: "OfficeHub Co.", items: 7, total: 3600.0, deliveryDate: "Nov 02, 2023", status: "Draft", createdDate: "Oct 22, 2023" },
  { number: "PO-2024-040", vendor: "Swift Delivery LLC", items: 3, total: 9800.0, deliveryDate: "Oct 28, 2023", status: "Approved", createdDate: "Oct 12, 2023" },
  { number: "PO-2024-039", vendor: "Cloud Services Ltd.", items: 1, total: 1250.0, deliveryDate: "Oct 25, 2023", status: "Rejected", createdDate: "Oct 10, 2023" },
];

export default function PurchaseOrders() {
  const [pos, setPOs] = useState<PO[]>(initialPOs);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newNumber, setNewNumber] = useState("PO-2024-044");
  const [newVendor, setNewVendor] = useState("");
  const [newItems, setNewItems] = useState("");
  const [newTotal, setNewTotal] = useState("");
  const [newDelivery, setNewDelivery] = useState("");
  const [newStatus, setNewStatus] = useState<PO["status"]>("Draft");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor || !newTotal) return;
    setPOs([{ number: newNumber, vendor: newVendor, items: parseInt(newItems) || 1, total: parseFloat(newTotal), deliveryDate: newDelivery || "—", status: newStatus, createdDate: "Today" }, ...pos]);
    setShowCreateModal(false);
    setNewVendor(""); setNewItems(""); setNewTotal(""); setNewDelivery(""); setNewStatus("Draft");
  };

  const filtered = pos.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (p.vendor.toLowerCase().includes(q) || p.number.toLowerCase().includes(q)) && (selectedStatus === "All" || p.status === selectedStatus);
  });

  const approvedTotal = pos.filter((p) => p.status === "Approved").reduce((s, p) => s + p.total, 0);
  const pendingTotal = pos.filter((p) => p.status === "Pending").reduce((s, p) => s + p.total, 0);

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6">
      <PageHeader
        title="Purchase Orders"
        subtitle="Create and track purchase orders with vendors across all your operations."
        actions={
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-sm">
            <span className="material-symbols-outlined text-[17px]">add</span>
            New PO
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total POs" value={String(pos.length)} icon="shopping_cart" trend={{ label: "This financial year", up: null }} />
        <StatCard label="Approved Value" value={`₹${approvedTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="check_circle" trend={{ label: `${pos.filter(p => p.status === "Approved").length} orders approved`, up: true }} />
        <StatCard label="Pending Approval" value={`₹${pendingTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="hourglass_top" trend={{ label: `${pos.filter(p => p.status === "Pending").length} awaiting review`, up: null }} />
      </div>

      <SectionCard title="Purchase Orders" subtitle={`${filtered.length} orders`} noPadding
        actions={
          <div className="flex items-center gap-2">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search POs..." />
            <FilterSelect value={selectedStatus} onChange={setSelectedStatus} options={["All", "Approved", "Pending", "Draft", "Rejected"]} />
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr>
                <Th>PO Number</Th>
                <Th>Vendor</Th>
                <Th>Items</Th>
                <Th right>Total Value</Th>
                <Th>Delivery Date</Th>
                <Th>Status</Th>
                <Th>Created</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((po) => (
                <TableRow key={po.number}>
                  <Td className="font-mono font-bold text-primary">{po.number}</Td>
                  <Td className="font-semibold text-on-surface">{po.vendor}</Td>
                  <Td>
                    <span className="flex items-center gap-1 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[15px]">inventory_2</span>
                      {po.items} items
                    </span>
                  </Td>
                  <Td className="text-right font-bold font-mono text-on-surface">₹{po.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Td>
                  <Td className="text-on-surface-variant">{po.deliveryDate}</Td>
                  <Td><StatusBadge status={po.status} /></Td>
                  <Td className="text-on-surface-variant text-xs">{po.createdDate}</Td>
                </TableRow>
              ))}
              {filtered.length === 0 && <EmptyState icon="shopping_cart" message="No purchase orders found." colSpan={7} />}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <FAB label="New PO" onClick={() => setShowCreateModal(true)} />

      {showCreateModal && (
        <Modal title="Create Purchase Order" onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreate} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="PO Number"><input className={inputCls} value={newNumber} onChange={(e) => setNewNumber(e.target.value)} /></FormField>
              <FormField label="Status">
                <select className={selectCls} value={newStatus} onChange={(e) => setNewStatus(e.target.value as PO["status"])}>
                  <option value="Draft">Draft</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                </select>
              </FormField>
            </div>
            <FormField label="Vendor Name"><input className={inputCls} required placeholder="e.g. Acme Corp" value={newVendor} onChange={(e) => setNewVendor(e.target.value)} /></FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Number of Items"><input type="number" className={inputCls} placeholder="1" value={newItems} onChange={(e) => setNewItems(e.target.value)} /></FormField>
              <FormField label="Total Value (₹)"><input type="number" step="0.01" required placeholder="0.00" className={inputCls} value={newTotal} onChange={(e) => setNewTotal(e.target.value)} /></FormField>
            </div>
            <FormField label="Expected Delivery Date"><input className={inputCls} placeholder="Nov 30, 2023" value={newDelivery} onChange={(e) => setNewDelivery(e.target.value)} /></FormField>
            <div className="pt-4 border-t border-outline-variant flex justify-end gap-3">
              <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-outline-variant rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">Create PO</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
