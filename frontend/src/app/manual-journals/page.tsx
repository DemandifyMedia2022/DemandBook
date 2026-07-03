"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  X,
  FileText,
  Trash2,
  Eye,
  Calendar,
  Layers,
  ArrowLeft,
  Download,
  AlertCircle
} from "lucide-react";

interface JournalEntry {
  id: number;
  journal_id: number;
  account_id: number;
  account_name: string;
  account_code: string;
  debit: number;
  credit: number;
  description: string;
  contact_name?: string;
}

interface JournalAttachment {
  id: number;
  file_name: string;
  file_data: string; // Base64 encoding
}

interface Journal {
  id: number;
  journal_number: string;
  date: string;
  reference: string;
  notes: string;
  status: "Draft" | "Posted";
  reverse_date?: string;
  publish_reverse: boolean;
  reporting_method: string;
  currency: string;
  total_amount: number;
}

const getApiUrl = (path: string) => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    return `http://${hostname}:8888${path}`;
  }
  return `http://localhost:8888${path}`;
};

function fmt(n: number, currency: string = "INR") {
  const symbol = currency === "INR" ? "₹" : "$";
  return symbol + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function fmtDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ManualJournals() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [journalDetails, setJournalDetails] = useState<{
    entries: JournalEntry[];
    attachments: JournalAttachment[];
  } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const res = await fetch(getApiUrl("/api/accountant/journals"), { headers });
      const data = await res.json();
      if (data.success) {
        setJournals(data.journals);
      }
    } catch (e) {
      console.error("Failed to load journals:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleViewDetails = async (journal: Journal) => {
    setSelectedJournal(journal);
    setLoadingDetails(true);
    setJournalDetails(null);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const res = await fetch(getApiUrl(`/api/accountant/journals/${journal.id}`), { headers });
      const data = await res.json();
      if (data.success) {
        setJournalDetails({
          entries: data.entries || [],
          attachments: data.attachments || []
        });
      }
    } catch (e) {
      console.error("Failed to fetch journal details:", e);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDeleteJournal = async (id: number) => {
    if (!confirm("Are you sure you want to delete this journal? This action will reverse its updates to ledger balances if it was posted.")) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(getApiUrl(`/api/accountant/journals/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        if (selectedJournal?.id === id) {
          setSelectedJournal(null);
          setJournalDetails(null);
        }
        loadData();
      } else {
        alert(data.message || "Failed to delete manual journal.");
      }
    } catch (e) {
      console.error("Error deleting journal:", e);
    }
  };

  const filteredJournals = useMemo(() => {
    return journals.filter((j) => {
      const q = searchQuery.toLowerCase();
      return (
        j.journal_number.toLowerCase().includes(q) ||
        (j.reference && j.reference.toLowerCase().includes(q)) ||
        (j.notes && j.notes.toLowerCase().includes(q))
      );
    });
  }, [journals, searchQuery]);

  return (
    <div className="p-6 space-y-6">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-zinc-900 tracking-tight">Manual Journals</h1>
          <p className="text-[13px] text-zinc-500 mt-1">Create and manage double-entry accounting journal vouchers</p>
        </div>
        <Link
          href="/manual-journals/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Journal
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Table List Column */}
        <div className={cn("bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)] xl:col-span-2", selectedJournal ? "xl:col-span-2" : "xl:col-span-3")}>
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-[14px] font-semibold text-zinc-900">Recent Journal Vouchers</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">{filteredJournals.length} record{filteredJournals.length !== 1 ? "s" : ""} found</p>
            </div>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Journal# or Reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/40">
                  {["Date", "Journal #", "Reference", "Reporting Method", "Currency", "Amount", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredJournals.map((j) => (
                  <tr
                    key={j.id}
                    onClick={() => handleViewDetails(j)}
                    className={cn(
                      "hover:bg-zinc-50/50 transition-colors cursor-pointer group",
                      selectedJournal?.id === j.id ? "bg-zinc-50/80" : ""
                    )}
                  >
                    <td className="px-6 py-3.5 text-[13px] text-zinc-500 whitespace-nowrap">{fmtDate(j.date)}</td>
                    <td className="px-6 py-3.5 font-semibold text-zinc-900 text-[13px]">{j.journal_number}</td>
                    <td className="px-6 py-3.5 text-[13px] text-zinc-600 truncate max-w-40">{j.reference || "—"}</td>
                    <td className="px-6 py-3.5 text-[13px] text-zinc-500">{j.reporting_method}</td>
                    <td className="px-6 py-3.5 text-[13px] text-zinc-500">{j.currency}</td>
                    <td className="px-6 py-3.5 font-mono text-[13px] font-semibold text-zinc-950">{fmt(j.total_amount, j.currency)}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold",
                          j.status === "Posted"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                            : "bg-amber-50 text-amber-700 border border-amber-200/50"
                        )}
                      >
                        {j.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(j);
                        }}
                        className="p-1 hover:bg-zinc-100 rounded text-zinc-500 hover:text-zinc-700 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteJournal(j.id);
                        }}
                        className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-red-600 transition-colors"
                        title="Delete Journal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredJournals.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-[13px] text-zinc-400">
                      No manual journals found. Click "Create New Journal" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Journal Details Panel */}
        {selectedJournal && (
          <div className="bg-white border border-zinc-200 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col xl:col-span-1">
            {/* Details Header */}
            <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-bold text-zinc-900">Journal Details</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">#{selectedJournal.journal_number}</p>
              </div>
              <button
                onClick={() => setSelectedJournal(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="p-8 text-center text-[13px] text-zinc-400">Loading details...</div>
            ) : (
              <div className="p-5 space-y-6 overflow-y-auto max-h-[70vh]">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 border-b border-zinc-100 pb-5 text-[13px]">
                  <div>
                    <span className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wide mb-0.5">Date</span>
                    <span className="font-medium text-zinc-950">{fmtDate(selectedJournal.date)}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wide mb-0.5">Reference</span>
                    <span className="font-medium text-zinc-950 truncate block">{selectedJournal.reference || "—"}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wide mb-0.5">Reporting Method</span>
                    <span className="font-medium text-zinc-950">{selectedJournal.reporting_method}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wide mb-0.5">Currency</span>
                    <span className="font-medium text-zinc-950">{selectedJournal.currency}</span>
                  </div>
                  {selectedJournal.reverse_date && (
                    <div className="col-span-2 pt-2 border-t border-zinc-50">
                      <span className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wide mb-0.5">Reverse Date</span>
                      <span className="font-medium text-zinc-950 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        {fmtDate(selectedJournal.reverse_date)}
                        {selectedJournal.publish_reverse && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-semibold border border-blue-100">
                            Publish on Date
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedJournal.notes && (
                  <div className="border-b border-zinc-100 pb-5">
                    <span className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wide mb-1">Notes</span>
                    <p className="text-[12.5px] text-zinc-600 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 max-h-24 overflow-y-auto whitespace-pre-line">
                      {selectedJournal.notes}
                    </p>
                  </div>
                )}

                {/* Ledger entries table */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Voucher Entries</h4>
                  <div className="border border-zinc-200 rounded-lg overflow-hidden text-[12px]">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-200">
                          <th className="px-3 py-2 text-zinc-500 font-semibold">Account / Desc</th>
                          <th className="px-3 py-2 text-zinc-500 font-semibold text-right">Debit</th>
                          <th className="px-3 py-2 text-zinc-500 font-semibold text-right">Credit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {journalDetails?.entries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-zinc-50/30">
                            <td className="px-3 py-2.5">
                              <span className="font-semibold text-zinc-900 block">
                                {entry.account_code} - {entry.account_name}
                              </span>
                              {entry.description && (
                                <span className="text-zinc-500 block mt-0.5 text-[11px] truncate max-w-40">{entry.description}</span>
                              )}
                              {entry.contact_name && (
                                <span className="inline-flex items-center text-[10px] bg-zinc-100 text-zinc-600 px-1 py-0.2 rounded font-semibold mt-1">
                                  Contact: {entry.contact_name}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono text-zinc-950 tabular-nums">
                              {entry.debit > 0 ? fmt(entry.debit, selectedJournal.currency) : "—"}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono text-zinc-950 tabular-nums">
                              {entry.credit > 0 ? fmt(entry.credit, selectedJournal.currency) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-zinc-50/50 font-semibold border-t border-zinc-200 text-zinc-900">
                          <td className="px-3 py-2">Total</td>
                          <td className="px-3 py-2 text-right font-mono tabular-nums">
                            {fmt(journalDetails?.entries.reduce((s, e) => s + Number(e.debit), 0) || 0, selectedJournal.currency)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono tabular-nums">
                            {fmt(journalDetails?.entries.reduce((s, e) => s + Number(e.credit), 0) || 0, selectedJournal.currency)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Attachments Section */}
                {journalDetails?.attachments && journalDetails.attachments.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Attachments</h4>
                    <div className="flex flex-col gap-1.5">
                      {journalDetails.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center justify-between p-2 text-[12px] border border-zinc-100 rounded-lg hover:bg-zinc-50 transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate pr-4">
                            <FileText className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                            <span className="truncate font-medium text-zinc-700">{att.file_name}</span>
                          </div>
                          <a
                            href={att.file_data}
                            download={att.file_name}
                            className="p-1 hover:bg-zinc-200/60 rounded text-zinc-500 hover:text-zinc-700 transition-colors"
                            title="Download Attachment"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
