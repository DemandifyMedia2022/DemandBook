"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  PageHeader, StatCard, SectionCard, StatusBadge,
  SearchBar, FilterSelect, Th, Td, TableRow, EmptyState, FAB
} from "@/components/ui/page-shell";

interface Invoice {
  id: number;
  number: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  balance: number;
  due_date: string;
  status: "Draft" | "Sent" | "Viewed" | "Partial" | "Paid" | "Overdue" | "Cancelled";
  created_at: string;
}

export default function Invoices() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Summary stats
  const [summary, setSummary] = useState({
      totalReceivables: 0,
      overdueTotal: 0,
      paidTotal: 0,
      overdueCount: 0,
      paidCount: 0
  });

  const fetchInvoices = async () => {
    setLoading(true);
    try {
        const queryParams = new URLSearchParams();
        if (selectedStatus !== "All") queryParams.append("status", selectedStatus);
        if (searchQuery) queryParams.append("q", searchQuery);

        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8888/api/invoice?${queryParams.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await res.json();
        if (data.success) {
            setInvoices(data.invoices);
        }
    } catch (error) {
        console.error("Failed to fetch invoices", error);
    } finally {
        setLoading(false);
    }
  };

  const fetchSummary = async () => {
      try {
          const token = localStorage.getItem("token");
          const res = await fetch(`http://localhost:8888/api/invoice/summary`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
              setSummary(data);
          }
      } catch (error) {
          console.error("Failed to fetch summary", error);
      }
  };

  useEffect(() => {
      fetchSummary();
  }, []);

  useEffect(() => {
      const delayDebounceFn = setTimeout(() => {
          fetchInvoices();
      }, 300);

      return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedStatus]);

  const handleSelectAll = (checked: boolean) => setSelectedInvoices(checked ? invoices.map((i) => i.id) : []);
  const handleSelectRow = (checked: boolean, id: number) =>
    setSelectedInvoices(checked ? [...selectedInvoices, id] : selectedInvoices.filter((n) => n !== id));

  const handleExportCSV = () => {
      if (!invoices || invoices.length === 0) {
          alert("No invoices to export");
          return;
      }
      
      const headers = ["Invoice #", "Customer", "Date", "Due Date", "Amount", "Balance", "Status"];
      const rows = invoices.map((i: any) => [
          i.number,
          `"${i.customer_name}"`,
          new Date(i.invoice_date).toLocaleDateString(),
          new Date(i.due_date).toLocaleDateString(),
          i.amount,
          i.balance,
          i.status
      ]);
      
      const csvContent = [
          headers.join(","),
          ...rows.map(row => row.join(","))
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `invoices_export_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6">
      <PageHeader
        title="Invoices"
        subtitle="Track receivables, manage invoice statuses and follow up on overdue amounts."
        actions={
          <div className="flex items-center gap-2">
            <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-xs font-semibold text-muted-foreground hover:bg-card-container transition-colors">
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              Export
            </button>
            <button
              onClick={() => router.push("/invoices/create")}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-[17px]">add</span>
              New Invoice
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Receivables" value={`₹${summary.totalReceivables.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="account_balance_wallet" trend={{ label: "+4.2% from last month", up: true }} />
        <StatCard label="Overdue" value={`₹${summary.overdueTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="warning" iconColor="text-destructive" trend={{ label: `${summary.overdueCount} invoices past due`, up: false }} />
        <StatCard label="Paid This Month" value={`₹${summary.paidTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="check_circle" trend={{ label: `${summary.paidCount} payments cleared`, up: true }} />
        <StatCard label="Avg. Collection" value="18 Days" icon="schedule" trend={{ label: "−2 days from average", up: true }} />
      </div>

      <SectionCard
        title="Invoice Register"
        subtitle={loading ? "Loading invoices..." : `Showing ${invoices.length} invoices`}
        noPadding
        actions={
          <div className="flex items-center gap-2">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search invoices..." />
            <FilterSelect value={selectedStatus} onChange={setSelectedStatus} options={["All", "Paid", "Overdue", "Partial", "Sent", "Draft"]} />
            <button className="p-2 rounded-lg border border-border hover:bg-card-container text-muted-foreground transition-colors" title="Print">
              <span className="material-symbols-outlined text-[18px]">print</span>
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px]">
            <thead>
              <tr>
                <Th>
                  <input type="checkbox" className="rounded cursor-pointer" checked={selectedInvoices.length === invoices.length && invoices.length > 0} onChange={(e) => handleSelectAll(e.target.checked)} />
                </Th>
                <Th>Invoice #</Th>
                <Th>Customer</Th>
                <Th right>Amount</Th>
                <Th>Due Date</Th>
                <Th>Status</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <TableRow key={inv.id} onClick={() => router.push(`/invoices/${inv.id}`)}>
                  <Td>
                    <input type="checkbox" className="rounded cursor-pointer" checked={selectedInvoices.includes(inv.id)} onChange={(e) => handleSelectRow(e.target.checked, inv.id)} onClick={(e) => e.stopPropagation()} />
                  </Td>
                  <Td className="font-mono font-bold text-primary">{inv.number}</Td>
                  <Td>
                    <p className="font-bold text-foreground">{inv.customer_name}</p>
                    <p className="text-[11px] text-muted-foreground">{inv.customer_email}</p>
                  </Td>
                  <Td className="text-right">
                    <p className="font-bold text-foreground">₹{Number(inv.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                    {inv.balance !== undefined && <p className="text-[10px] text-muted-foreground">Bal: ₹{Number(inv.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>}
                  </Td>
                  <Td className={cn(inv.status === "Overdue" ? "text-destructive font-bold" : "text-muted-foreground")}>{new Date(inv.due_date).toLocaleDateString()}</Td>
                  <Td><StatusBadge status={inv.status} /></Td>
                  <Td>
                    <button className="p-1 rounded hover:bg-card-container text-muted-foreground hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                    </button>
                  </Td>
                </TableRow>
              ))}
              {invoices.length === 0 && !loading && <EmptyState icon="description" message="No invoices match the filter." colSpan={7} />}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-card-container-low">
          <span className="text-xs text-muted-foreground">1 – {invoices.length} of {invoices.length}</span>
          <div className="flex items-center gap-1">
            <button disabled className="p-1.5 rounded hover:bg-card-container text-muted-foreground disabled:opacity-30 transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button disabled className="p-1.5 rounded hover:bg-card-container text-muted-foreground disabled:opacity-30 transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </SectionCard>

      <FAB label="New Invoice" onClick={() => router.push("/invoices/create")} />
    </div>
  );
}
