"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  FileText,
  X,
  AlertTriangle,
  ChevronDown,
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

const FIELD = "w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-zinc-800 placeholder:text-zinc-400";
const SELECT = "w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-zinc-800 cursor-pointer appearance-none";

const getApiUrl = (path: string) => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    return `http://${hostname}:8888${path}`;
  }
  return `http://localhost:8888${path}`;
};

export default function NewManualJournal() {
  const router = useRouter();

  // Accounts & Contacts
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Client[]>([]);

  // Journal details
  const [date, setDate] = useState("");
  const [reverseDate, setReverseDate] = useState("");
  const [publishReverse, setPublishReverse] = useState(false);
  const [journalNumber, setJournalNumber] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [reportingMethod, setReportingMethod] = useState("Accrual and Cash");
  const [currency, setCurrency] = useState("INR");
  const [status, setStatus] = useState<"Draft" | "Posted">("Draft");

  // Grid/Voucher entries
  const [entries, setEntries] = useState<Array<{
    account_id: string;
    description: string;
    contact_id: string;
    debit: string;
    credit: string;
  }>>([
    { account_id: "", description: "", contact_id: "", debit: "", credit: "" },
    { account_id: "", description: "", contact_id: "", debit: "", credit: "" }
  ]);

  // File Upload Attachments
  const [attachments, setAttachments] = useState<Array<{ file_name: string; file_data: string }>>([]);

  const [saving, setSaving] = useState(false);

  // Initialize values
  useEffect(() => {
    // Generate default date and journal number
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    setJournalNumber(`JN-${Math.floor(10000 + Math.random() * 90000)}`);

    // Fetch accounts and clients/contacts
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const loadData = async () => {
      try {
        // Fetch accounts
        const aRes = await fetch(getApiUrl("/api/accountant/chart-of-accounts"), { headers });
        const aData = await aRes.json();
        if (aData.success) {
          setAccounts(aData.accounts || []);
        }

        // Fetch unified customer/vendor client list
        const cRes = await fetch(getApiUrl("/api/client/list"), { headers });
        const cData = await cRes.json();
        if (cData.success) {
          setContacts(cData.clients || []);
        }
      } catch (e) {
        console.error("Failed to fetch page selection options:", e);
      }
    };

    loadData();
  }, []);

  const handleAddRow = () => {
    setEntries([...entries, { account_id: "", description: "", contact_id: "", debit: "", credit: "" }]);
  };

  const handleRemoveRow = (idx: number) => {
    if (entries.length > 2) {
      setEntries(entries.filter((_, i) => i !== idx));
    }
  };

  const handleEntryChange = (idx: number, field: string, val: string) => {
    const nextEntries = [...entries];
    const item = nextEntries[idx];

    if (field === "debit" && val !== "") {
      // Clear credit if debit is entered (standard single column value logic)
      item.debit = val;
      item.credit = "";
    } else if (field === "credit" && val !== "") {
      // Clear debit if credit is entered
      item.credit = val;
      item.debit = "";
    } else {
      (item as any)[field] = val;
    }

    setEntries(nextEntries);
  };

  // Real-time calculations
  const totalDebit = entries.reduce((s, e) => s + (parseFloat(e.debit) || 0), 0);
  const totalCredit = entries.reduce((s, e) => s + (parseFloat(e.credit) || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);

  // File Upload handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const allowedCount = 5 - attachments.length;
      const filesArr = Array.from(files).slice(0, allowedCount);

      filesArr.forEach(file => {
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Max size is 10MB.`);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachments(prev => [...prev, {
            file_name: file.name,
            file_data: reader.result as string
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveFile = (idx: number) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!journalNumber.trim()) {
      alert("Please enter a Journal Voucher Number.");
      return;
    }

    // Filter out rows that are entirely empty
    const activeEntries = entries.filter(e => e.account_id !== "" || e.debit !== "" || e.credit !== "");

    if (activeEntries.length < 2) {
      alert("At least 2 active entry lines are required to balance a manual journal.");
      return;
    }

    // Ensure all active rows have an account selected and either a debit or credit value
    for (let i = 0; i < activeEntries.length; i++) {
      const entry = activeEntries[i];
      if (!entry.account_id) {
        alert(`Please select an account for Entry Line #${i + 1}.`);
        return;
      }
      const deb = parseFloat(entry.debit) || 0;
      const cred = parseFloat(entry.credit) || 0;
      if (deb === 0 && cred === 0) {
        alert(`Entry Line #${i + 1} must have a debit or credit amount.`);
        return;
      }
    }

    if (difference > 0.001) {
      alert(`Journals must balance. Total Debit must equal Total Credit. (Difference: ${difference.toFixed(2)})`);
      return;
    }

    setSaving(true);
    const token = localStorage.getItem("token");

    const payload = {
      journal_number: journalNumber,
      date,
      reference,
      notes,
      status,
      reverse_date: reverseDate || null,
      publish_reverse: publishReverse,
      reporting_method: reportingMethod,
      currency,
      attachments,
      entries: activeEntries.map(e => ({
        account_id: parseInt(e.account_id),
        description: e.description,
        contact_id: e.contact_id ? parseInt(e.contact_id) : null,
        debit: parseFloat(e.debit) || 0,
        credit: parseFloat(e.credit) || 0
      }))
    };

    try {
      const res = await fetch(getApiUrl("/api/accountant/journals"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        router.push("/manual-journals");
      } else {
        alert(data.message || "Failed to create manual journal voucher.");
      }
    } catch (err) {
      console.error("Failed to create journal:", err);
      alert("Connection error creating manual journal.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb Back Navigation */}
      <button
        onClick={() => router.push("/manual-journals")}
        className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 transition-colors text-[13px] font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Manual Journals
      </button>

      {/* Header Title */}
      <div>
        <h1 className="text-[24px] font-bold text-zinc-900 tracking-tight">New Journal Voucher</h1>
        <p className="text-[13px] text-zinc-500 mt-1">Record a manual double-entry accounting journal adjustment</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-zinc-200 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        
        {/* Basic Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Date</label>
            <input
              type="date"
              required
              className={FIELD}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Reverse Journal Date</label>
            <input
              type="date"
              className={FIELD}
              value={reverseDate}
              onChange={(e) => setReverseDate(e.target.value)}
            />
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={!reverseDate}
                className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500/20"
                checked={publishReverse}
                onChange={(e) => setPublishReverse(e.target.checked)}
              />
              <span className="text-[12.5px] font-medium text-zinc-700">
                Publish reverse journal only on the reverse journal date
              </span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-zinc-100 pt-5">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Journal#</label>
            <input
              type="text"
              required
              placeholder="e.g. JN-10001"
              className={FIELD}
              value={journalNumber}
              onChange={(e) => setJournalNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Reference#</label>
            <input
              type="text"
              placeholder="Reference number..."
              className={FIELD}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Currency</label>
            <div className="relative">
              <select
                className={SELECT}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Reporting Method Section */}
        <div className="border-t border-zinc-100 pt-5">
          <span className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2.5">Reporting Method</span>
          <div className="flex gap-6">
            {["Accrual and Cash", "Accrual Only", "Cash Only"].map((method) => (
              <label key={method} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="reportingMethod"
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500/20"
                  checked={reportingMethod === method}
                  onChange={() => setReportingMethod(method)}
                />
                <span className="text-[13px] font-medium text-zinc-700">{method}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Notes Textarea (Max. 500 characters) */}
        <div className="border-t border-zinc-100 pt-5">
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Notes</label>
            <span className={cn("text-[11px]", notes.length > 480 ? "text-red-500 font-semibold" : "text-zinc-400")}>
              {notes.length} / 500 characters
            </span>
          </div>
          <textarea
            maxLength={500}
            rows={3}
            placeholder="Write internal explanations or memo descriptions..."
            className={FIELD}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Voucher Entries Table Grid */}
        <div className="space-y-3 border-t border-zinc-100 pt-6">
          <div>
            <h3 className="text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Voucher Entry Grid</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Define debit and credit ledger rows. Debits and Credits must balance to 0.</p>
          </div>

          <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/70 border-b border-zinc-200 text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                  <th className="px-4 py-3 w-56">Account</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 w-48">Contact ({currency})</th>
                  <th className="px-4 py-3 w-32 text-right">Debits</th>
                  <th className="px-4 py-3 w-32 text-right">Credits</th>
                  <th className="px-4 py-3 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {entries.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/20 transition-colors">
                    {/* Account Selection */}
                    <td className="p-2.5">
                      <div className="relative">
                        <select
                          required={idx < 2}
                          className={SELECT}
                          value={row.account_id}
                          onChange={(e) => handleEntryChange(idx, "account_id", e.target.value)}
                        >
                          <option value="">Select Account</option>
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>
                              {acc.account_code} - {acc.account_name} ({acc.account_type})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>

                    {/* Entry description */}
                    <td className="p-2.5">
                      <input
                        type="text"
                        placeholder="Description..."
                        className={FIELD}
                        value={row.description}
                        onChange={(e) => handleEntryChange(idx, "description", e.target.value)}
                      />
                    </td>

                    {/* Contact Selection */}
                    <td className="p-2.5">
                      <div className="relative">
                        <select
                          className={SELECT}
                          value={row.contact_id}
                          onChange={(e) => handleEntryChange(idx, "contact_id", e.target.value)}
                        >
                          <option value="">No Contact</option>
                          {contacts.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.type === "customer" ? "Customer" : "Vendor"})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>

                    {/* Debit Input */}
                    <td className="p-2.5">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className={cn(FIELD, "text-right font-mono")}
                        value={row.debit}
                        disabled={row.credit !== ""}
                        onChange={(e) => handleEntryChange(idx, "debit", e.target.value)}
                      />
                    </td>

                    {/* Credit Input */}
                    <td className="p-2.5">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className={cn(FIELD, "text-right font-mono")}
                        value={row.credit}
                        disabled={row.debit !== ""}
                        onChange={(e) => handleEntryChange(idx, "credit", e.target.value)}
                      />
                    </td>

                    {/* Delete entry action */}
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        disabled={entries.length <= 2}
                        className="p-1 hover:bg-red-50 text-zinc-400 hover:text-red-600 disabled:opacity-30 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Bottom calculation status row */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-semibold text-zinc-700 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Row
              </button>

              <div className="w-full md:w-auto text-[13px] font-medium space-y-1.5">
                <div className="flex justify-between gap-12 text-zinc-500">
                  <span>Sub Total:</span>
                  <div className="space-x-8 font-mono font-semibold text-zinc-700">
                    <span>D: {totalDebit.toFixed(2)}</span>
                    <span>C: {totalCredit.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between gap-12 text-zinc-900 border-t border-zinc-200/60 pt-1.5">
                  <span className="font-bold">Total ({currency === "INR" ? "₹" : "$"}):</span>
                  <div className="space-x-8 font-mono font-bold text-zinc-900">
                    <span>D: {totalDebit.toFixed(2)}</span>
                    <span>C: {totalCredit.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between gap-12 border-t border-zinc-200/60 pt-1.5">
                  <span className="text-zinc-500">Difference:</span>
                  <span className={cn("font-mono font-bold", difference > 0 ? "text-red-600 animate-pulse" : "text-emerald-700")}>
                    {difference.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attachments Section */}
        <div className="space-y-2 border-t border-zinc-100 pt-6">
          <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Attachments</label>
          <div className="border-2 border-dashed border-zinc-200 rounded-xl p-4 flex flex-col items-center justify-center bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-300 transition-colors relative cursor-pointer group">
            <input
              type="file"
              multiple
              disabled={attachments.length >= 5}
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <Upload className="w-5 h-5 text-zinc-400 mb-1.5 group-hover:text-zinc-600 transition-colors" />
            <p className="text-[12.5px] font-medium text-zinc-700">
              Drag files here or <span className="text-blue-600 font-semibold">Browse files</span>
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">You can upload a maximum of 5 files, 10MB each</p>
          </div>

          {/* Uploaded Files items list */}
          {attachments.length > 0 && (
            <div className="flex gap-2 flex-wrap pt-2">
              {attachments.map((att, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold border border-zinc-200 rounded-lg bg-white shadow-sm relative group">
                  <FileText className="w-4 h-4 text-zinc-500" />
                  <span className="max-w-40 truncate">{att.file_name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(i)}
                    className="p-0.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Actions Button Footer */}
        <div className="pt-6 border-t border-zinc-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[12px] text-zinc-500 bg-zinc-50 border border-zinc-100 px-3 py-2 rounded-lg">
            <Info className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <span> Vouchers marked as <strong>Posted</strong> will immediately update Chart of Account balances.</span>
          </div>

          <div className="flex items-center gap-3">
            <select
              className="px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none cursor-pointer text-zinc-800"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="Draft">Draft</option>
              <option value="Posted">Posted</option>
            </select>

            <button
              type="button"
              onClick={() => router.push("/manual-journals")}
              className="px-4 py-2 text-[13px] font-medium text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-[13px] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Voucher"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
