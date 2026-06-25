"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  PageHeader, StatCard, SectionCard, StatusBadge,
  SearchBar, FilterSelect, FAB, Modal, FormField, inputCls, selectCls,
} from "@/components/ui/page-shell";

interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  type: "Primary" | "Billing" | "Support";
  balance: number;
  status: "Paid" | "Overdue" | "Draft";
  imageUrl?: string;
  iconName?: string;
}

const initialVendors: Vendor[] = [
  { id: "VND-001", name: "Global Logistics Co.", contactPerson: "Sarah Jenkins", type: "Primary", balance: 12450.0, status: "Paid", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTQmFLuaum4bXhnKJYAFHOpfwFYh4PpdbQy-lEGIh-l4CYsP7DLih2POZP7l6aKyVtY4rDUG3FiCVBGTof_VobzSx8e6goWdnNVNTEci1nSr6LNvELBBANzImnb4rioOsLgQo2VT__GKb_ycSJ7Wvs0DuK-400Z3HA7atENn01Ma6cs5uO4QyfYgYrhQbXNyo9TZtz5RCpqy_irFwKcRtmMUcvm4qlnXTZJT4_CrZvYvlJydytEGfFnXEQeLhboVxxpWOwIOH1WNo" },
  { id: "VND-002", name: "TechSystems Inc.", contactPerson: "Marcus Thorne", type: "Billing", balance: 4200.5, status: "Overdue", iconName: "apartment" },
  { id: "VND-003", name: "Creative Solutions", contactPerson: "Elena Rossi", type: "Primary", balance: 0.0, status: "Draft", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYYLlYJEe7QtN14co-vFOOV8E-oE4R9s7r-oZR8suX31-6TBy6Krwa-LbgmiA8U6FqrE3oMxoN45Xtj2vG4-OZC5W0tfQ5u_VhcCGDxIB793Z8glWK8AqPfZwPh4rBFTVDwJqTVYiBKyt1dw9AWzhOmP2-VcTLJp__6LlrD_GDis_6bVqzOhiz9EMUtIFc1YVFSqc3yHX8_Qtn31nnjoiVSS2Sd-O0la8BJRCVRDOsgep4iIrTTBYjVzSNzi963pJkEIE7pyU9XNg" },
  { id: "VND-004", name: "Swift Delivery LLC", contactPerson: "Jason Bourne", type: "Primary", balance: 8900.0, status: "Paid", iconName: "local_shipping" },
  { id: "VND-005", name: "Cloud Services Ltd.", contactPerson: "Anita Desai", type: "Support", balance: 1250.0, status: "Draft", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCdItTQ2abMon1tzQSgEbt1YwIXVUTBSRKIdl1_PjXaHk_BrlJ7jV7ZNEITxWXJ5VfDTmiTeGdXAh-O7gs3K-iYouL1pUEPdlNA_BTV6xZdeAcoZWEVz6z9D3s5bEqriqsXEt7NvUat4J3IxFjF_93lBwmqfsLofNb26FHreuHHixNIFCLLjenfeRlUc2vbbmCeyLkWqxDldTT_1CH-g4DNjwkaCOeYoVbnkT0E8U5JKV_4J47TxKnAfVnd9NGC7iFVbvmwUsHlLY" },
];

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newId, setNewId] = useState("VND-006");
  const [newName, setNewName] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newType, setNewType] = useState<Vendor["type"]>("Primary");
  const [newBalance, setNewBalance] = useState("");
  const [newStatus, setNewStatus] = useState<Vendor["status"]>("Paid");

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newContact) return;
    const newVendor: Vendor = {
      id: newId, name: newName, contactPerson: newContact,
      type: newType, balance: newBalance ? parseFloat(newBalance) : 0,
      status: newStatus, iconName: "storefront",
    };
    setVendors([newVendor, ...vendors]);
    setShowCreateModal(false);
    setNewId("VND-" + String(vendors.length + 6).padStart(3, "0"));
    setNewName(""); setNewContact(""); setNewType("Primary"); setNewBalance(""); setNewStatus("Paid");
  };

  const filtered = vendors.filter((v) => {
    const q = searchQuery.toLowerCase();
    return (
      (v.name.toLowerCase().includes(q) || v.contactPerson.toLowerCase().includes(q)) &&
      (selectedStatus === "All" || v.status === selectedStatus)
    );
  });

  const totalPayables = vendors.reduce((s, v) => s + v.balance, 0);
  const overduePayables = vendors.filter((v) => v.status === "Overdue").reduce((s, v) => s + v.balance, 0);

  const typeColors: Record<Vendor["type"], string> = {
    Primary: "bg-primary/10 text-primary",
    Billing: "bg-secondary/10 text-secondary",
    Support: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6">
      <PageHeader
        title="Vendors"
        subtitle="Manage supplier relationships, track payables, and monitor overdue bills."
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[17px]">add</span>
            New Vendor
          </button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Vendors" value={String(vendors.length)} icon="storefront" trend={{ label: "Active relationships", up: true }} />
        <StatCard label="Total Payables" value={`₹${totalPayables.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="payments" trend={{ label: "Across all vendors", up: null }} />
        <StatCard label="Overdue Payables" value={`₹${overduePayables.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="warning" iconColor="text-error" trend={{ label: "Needs immediate attention", up: false }} />
      </div>

      {/* Vendor Grid */}
      <SectionCard
        title="Vendor Directory"
        subtitle={`${filtered.length} vendors`}
        actions={
          <div className="flex items-center gap-2">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search vendors..." />
            <FilterSelect value={selectedStatus} onChange={setSelectedStatus} options={["All", "Paid", "Overdue", "Draft"]} />
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((vendor) => (
            <div
              key={vendor.id}
              className="flex items-center justify-between p-4 rounded-xl border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center relative shrink-0">
                  {vendor.imageUrl ? (
                    <Image src={vendor.imageUrl} alt={vendor.name} fill sizes="40px" className="object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {vendor.iconName || "storefront"}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm text-on-surface">{vendor.name}</p>
                  <p className="text-[11px] text-on-surface-variant">
                    {vendor.contactPerson} &bull;{" "}
                    <span className={cn("font-semibold", typeColors[vendor.type].split(" ").find(c => c.startsWith("text-")))}>
                      {vendor.type}
                    </span>
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-sm text-on-surface font-mono">
                  ₹{vendor.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <StatusBadge status={vendor.status} />
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 py-16 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[40px] block mb-2 opacity-30">storefront</span>
              <p className="text-sm font-semibold">No vendors match your filter.</p>
            </div>
          )}
        </div>
      </SectionCard>

      <FAB label="New Vendor" onClick={() => setShowCreateModal(true)} />

      {showCreateModal && (
        <Modal title="Create New Vendor" onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreateVendor} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Vendor ID">
                <input className={inputCls} required value={newId} onChange={(e) => setNewId(e.target.value)} />
              </FormField>
              <FormField label="Type">
                <select className={selectCls} value={newType} onChange={(e) => setNewType(e.target.value as Vendor["type"])}>
                  <option value="Primary">Primary</option>
                  <option value="Billing">Billing</option>
                  <option value="Support">Support</option>
                </select>
              </FormField>
            </div>
            <FormField label="Vendor Name">
              <input className={inputCls} required placeholder="e.g. Acme Corp" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </FormField>
            <FormField label="Contact Person">
              <input className={inputCls} required placeholder="e.g. John Doe" value={newContact} onChange={(e) => setNewContact(e.target.value)} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Opening Balance (₹)">
                <input type="number" step="0.01" placeholder="0.00" className={inputCls} value={newBalance} onChange={(e) => setNewBalance(e.target.value)} />
              </FormField>
              <FormField label="Status">
                <select className={selectCls} value={newStatus} onChange={(e) => setNewStatus(e.target.value as Vendor["status"])}>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Draft">Draft</option>
                </select>
              </FormField>
            </div>
            <div className="pt-4 border-t border-outline-variant flex justify-end gap-3">
              <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-outline-variant rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">Create Vendor</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
