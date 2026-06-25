"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  PageHeader, StatCard, SectionCard, StatusBadge,
  SearchBar, FilterSelect, Th, Td, TableRow, EmptyState, FAB
} from "@/components/ui/page-shell";

interface Customer {
  id: string;
  name: string;
  avatarInitials: string;
  status: "Active" | "Inactive";
  balance: number;
  email: string;
  phone: string;
}

const initialCustomers: Customer[] = [
  { id: "CUST-4092", name: "Acme Solutions", avatarInitials: "AS", status: "Active", balance: 12450.0, email: "john.doe@acme.com", phone: "+91 98765 43210" },
  { id: "CUST-3912", name: "Blue Tier Tech", avatarInitials: "BT", status: "Active", balance: 4200.5, email: "sarah@bluetier.io", phone: "+91 91234 56789" },
  { id: "CUST-2844", name: "Cloud Harbor", avatarInitials: "CH", status: "Inactive", balance: 0.0, email: "billing@charbor.com", phone: "+91 80001 11222" },
  { id: "CUST-5512", name: "Digital Wave Inc", avatarInitials: "DW", status: "Active", balance: 1120.0, email: "mark@digitalwave.io", phone: "+91 77777 12345" },
  { id: "CUST-8210", name: "Eco Stream Logistics", avatarInitials: "ES", status: "Active", balance: 52000.0, email: "admin@ecostream.log", phone: "+91 88884 56789" },
  { id: "CUST-6390", name: "FlexTech Systems", avatarInitials: "FS", status: "Active", balance: 7800.0, email: "info@flextech.in", phone: "+91 99990 11100" },
  { id: "CUST-7104", name: "GlobalMart Retail", avatarInitials: "GM", status: "Inactive", balance: 320.0, email: "pay@globalmart.in", phone: "+91 80080 08080" },
];

export default function Customers() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortOrder, setSortOrder] = useState<"none" | "asc" | "desc">("none");

  const toggleSort = () => setSortOrder((s) => s === "none" ? "asc" : s === "asc" ? "desc" : "none");

  let processed = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) &&
      (selectedStatus === "All" || c.status === selectedStatus)
    );
  });
  if (sortOrder === "asc") processed = [...processed].sort((a, b) => a.name.localeCompare(b.name));
  if (sortOrder === "desc") processed = [...processed].sort((a, b) => b.name.localeCompare(a.name));

  const totalReceivables = customers.reduce((s, c) => s + c.balance, 0);
  const activeCount = customers.filter((c) => c.status === "Active").length;

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6">
      <PageHeader
        title="Customers"
        subtitle="Manage your customer relationships and outstanding receivables."
        actions={
          <button
            onClick={() => router.push("/customers/new")}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[17px]">add</span>
            New Customer
          </button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Customers" value={String(customers.length + 1279)} icon="groups" trend={{ label: "+12% from last month", up: true }} />
        <StatCard label="Total Receivables" value={`₹${totalReceivables.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="account_balance_wallet" trend={{ label: "15 Overdue payments", up: null }} iconColor="text-error" />
        <StatCard label="Active Customers" value={String(activeCount + 847)} icon="autorenew" trend={{ label: "98% Retention rate", up: true }} />
      </div>

      {/* Table */}
      <SectionCard
        title="Customer Directory"
        subtitle={`${processed.length} customers`}
        noPadding
        actions={
          <div className="flex items-center gap-2">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search customers..." />
            <FilterSelect value={selectedStatus} onChange={setSelectedStatus} options={["All", "Active", "Inactive"]} />
            <button
              onClick={toggleSort}
              className="flex items-center gap-1 px-2.5 py-1.5 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors text-xs font-semibold border border-outline-variant"
            >
              <span className="material-symbols-outlined text-[16px]">sort_by_alpha</span>
              {sortOrder === "none" ? "Sort" : sortOrder === "asc" ? "A→Z" : "Z→A"}
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr>
                <Th>Customer</Th>
                <Th>Status</Th>
                <Th right>Outstanding Balance</Th>
                <Th>Contact</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {processed.map((cust) => (
                <TableRow key={cust.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {cust.avatarInitials}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface text-sm">{cust.name}</p>
                        <p className="text-[11px] text-on-surface-variant">{cust.id}</p>
                      </div>
                    </div>
                  </Td>
                  <Td><StatusBadge status={cust.status} /></Td>
                  <Td className={cn("text-right font-bold font-mono", cust.balance > 0 && "text-error")}>
                    ₹{cust.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </Td>
                  <Td>
                    <p className="text-xs text-on-surface">{cust.email}</p>
                    <p className="text-[11px] text-on-surface-variant">{cust.phone}</p>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <a href={`tel:${cust.phone}`} title="Call" className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[17px]">call</span>
                      </a>
                      <a href={`mailto:${cust.email}`} title="Email" className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[17px]">mail</span>
                      </a>
                    </div>
                  </Td>
                </TableRow>
              ))}
              {processed.length === 0 && <EmptyState icon="person_search" message="No customers match your filters." colSpan={5} />}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <FAB label="New Customer" onClick={() => router.push("/customers/new")} />
    </div>
  );
}
