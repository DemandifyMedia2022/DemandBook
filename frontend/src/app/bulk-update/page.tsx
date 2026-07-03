"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  ChevronDown,
  Filter,
  RefreshCw,
  SlidersHorizontal,
  CheckSquare,
  Square,
  AlertCircle,
  TrendingUp,
  Tag,
  Calendar,
  X,
  CheckCircle2,
  Info
} from "lucide-react";

interface Account {
  id: number;
  account_code: string;
  account_name: string;
  account_type: string;
}

interface Client {
  id: number;
  name: string;
  custom_id: string;
  type: string;
}

interface Transaction {
  id: number;
  journal_id: number;
  account_id: number;
  debit: number;
  credit: number;
  description: string;
  contact_id: number | null;
  journal_number: string;
  journal_date: string;
  journal_status: "Draft" | "Posted";
  journal_currency: string;
  account_name: string;
  account_code: string;
  contact_name: string | null;
}

const FIELD = "w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-zinc-800 placeholder:text-zinc-400";
const SELECT = "w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-zinc-800 cursor-pointer appearance-none";

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

export default function BulkUpdate() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Filters
  const [filterAccount, setFilterAccount] = useState("");
  const [filterContact, setFilterContact] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  // Grid Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Bulk Edit actions
  const [newAccount, setNewAccount] = useState("");
  const [newContact, setNewContact] = useState(""); // empty string = no change, "null" = clear contact, numeric = client ID

  // Search input within filtered list
  const [searchQuery, setSearchQuery] = useState("");

  // Load selection details
  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const loadOptions = async () => {
      try {
        const aRes = await fetch(getApiUrl("/api/accountant/chart-of-accounts"), { headers });
        const aData = await aRes.json();
        if (aData.success) {
          setAccounts(aData.accounts || []);
        }

        const cRes = await fetch(getApiUrl("/api/client/list"), { headers });
        const cData = await cRes.json();
        if (cData.success) {
          setContacts(cData.clients || []);
        }
      } catch (e) {
        console.error("Failed to load select list details:", e);
      }
    };

    loadOptions();
  }, []);

  const handleFetchTransactions = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSelectedIds([]);

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const queryParts: string[] = [];
    if (filterAccount) queryParts.push(`account_id=${filterAccount}`);
    if (filterContact) queryParts.push(`contact_id=${filterContact}`);
    if (startDate) queryParts.push(`start_date=${startDate}`);
    if (endDate) queryParts.push(`end_date=${endDate}`);
    if (minAmount) queryParts.push(`min_amount=${minAmount}`);
    if (maxAmount) queryParts.push(`max_amount=${maxAmount}`);

    const queryString = queryParts.length > 0 ? "?" + queryParts.join("&") : "";

    try {
      const res = await fetch(getApiUrl(`/api/accountant/bulk-update/transactions${queryString}`), { headers });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error("Failed to fetch bulk transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilterAccount("");
    setFilterContact("");
    setStartDate("");
    setEndDate("");
    setMinAmount("");
    setMaxAmount("");
    setTransactions([]);
    setSelectedIds([]);
  };

  // Toggle selection
  const handleToggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const q = searchQuery.toLowerCase();
      return (
        t.journal_number.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        t.account_name.toLowerCase().includes(q) ||
        t.account_code.toLowerCase().includes(q)
      );
    });
  }, [transactions, searchQuery]);

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map(t => t.id));
    }
  };

  const handleApplyBulkUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    if (newAccount === "" && newContact === "") {
      alert("Please select a new Account or Contact to update.");
      return;
    }

    setUpdating(true);
    const token = localStorage.getItem("token");

    const payload: any = {
      entry_ids: selectedIds
    };

    if (newAccount !== "") payload.new_account_id = parseInt(newAccount);
    if (newContact !== "") {
      payload.new_contact_id = newContact === "null" ? null : parseInt(newContact);
    }

    try {
      const res = await fetch(getApiUrl("/api/accountant/bulk-update/execute"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        // Reset bulk fields and reload
        setNewAccount("");
        setNewContact("");
        setSelectedIds([]);
        alert("Transactions updated successfully.");
        handleFetchTransactions();
      } else {
        alert(data.message || "Failed to execute bulk update.");
      }
    } catch (err) {
      console.error("Bulk update execute error:", err);
      alert("Connection error running bulk update.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-[24px] font-bold text-zinc-900 tracking-tight">Bulk Update</h1>
        <p className="text-[13px] text-zinc-500 mt-1">Reclassify ledger account and contact assignments in bulk</p>
      </div>

      {/* Main Grid: Filter Pane + Results Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left column: Filter Pane */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5 lg:col-span-1">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
            <Filter className="w-4 h-4 text-zinc-500" />
            <h2 className="text-[14px] font-bold text-zinc-900">Filter Transactions</h2>
          </div>

          <form onSubmit={handleFetchTransactions} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Account</label>
              <div className="relative">
                <select
                  className={SELECT}
                  value={filterAccount}
                  onChange={(e) => setFilterAccount(e.target.value)}
                >
                  <option value="">Select Account</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_code} - {acc.account_name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Contact</label>
              <div className="relative">
                <select
                  className={SELECT}
                  value={filterContact}
                  onChange={(e) => setFilterContact(e.target.value)}
                >
                  <option value="">Select Contact</option>
                  <option value="null">Unassigned (No Contact)</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type === "customer" ? "Customer" : "Vendor"})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Date range */}
            <div className="space-y-2 border-t border-zinc-50 pt-3">
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Date Range</label>
              <div className="grid grid-cols-1 gap-2">
                <input
                  type="date"
                  className={FIELD}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <div className="text-center text-[11px] text-zinc-400 font-medium">to</div>
                <input
                  type="date"
                  className={FIELD}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Amount range */}
            <div className="space-y-2 border-t border-zinc-50 pt-3">
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Total Amount Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className={FIELD}
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                />
                <span className="text-zinc-400 text-xs">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  className={FIELD}
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 flex gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 px-3 py-2 text-[13px] font-medium text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors text-center"
              >
                Reset
              </button>
              <button
                type="submit"
                className="flex-1 px-3 py-2 text-[13px] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors text-center shadow-sm"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Right column: Results & Selection table */}
        <div className="lg:col-span-3 space-y-4">
          {/* Header block with search filter */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-[14px] font-bold text-zinc-900">Transaction Entries List</h2>
              <p className="text-[12.5px] text-zinc-500 mt-0.5">
                {transactions.length === 0
                  ? "Select filters on the left and click search"
                  : `${filteredTransactions.length} of ${transactions.length} matching lines shown`}
              </p>
            </div>

            {transactions.length > 0 && (
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Quick search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>
            )}
          </div>

          {/* Entries list table */}
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                    <th className="p-4 w-12 text-center">
                      {transactions.length > 0 && (
                        <button
                          type="button"
                          onClick={handleToggleSelectAll}
                          className="text-zinc-500 hover:text-zinc-700 flex items-center justify-center mx-auto"
                        >
                          {selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0 ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Journal #</th>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3 text-right">Debit</th>
                    <th className="px-4 py-3 text-right">Credit</th>
                    <th className="px-4 py-3 w-16 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-[13px]">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="p-12 text-center text-zinc-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-zinc-300" />
                        Fetching transactions...
                      </td>
                    </tr>
                  ) : filteredTransactions.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => handleToggleSelect(t.id)}
                      className={cn(
                        "hover:bg-zinc-50/40 transition-colors cursor-pointer select-none",
                        selectedIds.includes(t.id) ? "bg-zinc-50/80" : ""
                      )}
                    >
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(t.id)}
                          className="text-zinc-400 hover:text-zinc-700 flex items-center justify-center mx-auto"
                        >
                          {selectedIds.includes(t.id) ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-500 whitespace-nowrap">{fmtDate(t.journal_date)}</td>
                      <td className="px-4 py-3.5 font-semibold text-zinc-900 whitespace-nowrap">{t.journal_number}</td>
                      <td className="px-4 py-3.5 text-zinc-700 font-medium">
                        <span className="text-[11px] font-bold text-zinc-400 bg-zinc-100 px-1 py-0.5 rounded font-mono mr-1.5">
                          {t.account_code}
                        </span>
                        {t.account_name}
                      </td>
                      <td className="px-4 py-3.5 text-zinc-500 truncate max-w-40" title={t.description}>
                        {t.description || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-zinc-600 whitespace-nowrap">
                        {t.contact_name ? (
                          <span className="inline-flex items-center gap-1">
                            <Tag className="w-3 h-3 text-zinc-400" />
                            {t.contact_name}
                          </span>
                        ) : (
                          <span className="text-zinc-400 italic">No Contact</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-zinc-950 tabular-nums">
                        {t.debit > 0 ? fmt(t.debit, t.journal_currency) : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-zinc-950 tabular-nums">
                        {t.credit > 0 ? fmt(t.credit, t.journal_currency) : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={cn(
                          "px-1.5 py-0.2 rounded text-[10px] font-bold",
                          t.journal_status === "Posted"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        )}>
                          {t.journal_status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {filteredTransactions.length === 0 && !loading && (
                    <tr>
                      <td colSpan={9} className="p-12 text-center text-zinc-400">
                        {transactions.length === 0
                          ? "Set filters on the left and click 'Search' to load transaction entries."
                          : "No entries match your search keyword."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bulk Reclassify Drawer (Bottom overlay) */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-zinc-200 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] py-4 px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 z-40",
          selectedIds.length > 0 ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-white text-[15px] font-bold shadow-sm">
            {selectedIds.length}
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-zinc-900">Transaction Lines Selected</h4>
            <p className="text-[11px] text-zinc-500">Select target classifications below to update in bulk</p>
          </div>
        </div>

        <form onSubmit={handleApplyBulkUpdate} className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Target Account select */}
          <div className="relative w-full sm:w-56">
            <select
              className={SELECT}
              value={newAccount}
              onChange={(e) => setNewAccount(e.target.value)}
            >
              <option value="">Reclassify Account (No change)</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_code} - {acc.account_name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Target Contact select */}
          <div className="relative w-full sm:w-56">
            <select
              className={SELECT}
              value={newContact}
              onChange={(e) => setNewContact(e.target.value)}
            >
              <option value="">Reclassify Contact (No change)</option>
              <option value="null">Unassign Contact (Set Empty)</option>
              {contacts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-2 text-[13px] font-medium text-zinc-700 hover:bg-zinc-50 border border-zinc-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating || (newAccount === "" && newContact === "")}
              className="px-4 py-2 text-[13px] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              {updating ? "Updating..." : "Apply Bulk Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
