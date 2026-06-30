"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageHeader, SectionCard, FormField, inputCls, selectCls } from "@/components/ui/page-shell";

interface ClientOption {
  id: string;
  name: string;
  customId: string;
}

export default function NewRecurringExpense() {
  const router = useRouter();

  // Dynamic Options lists
  const [vendors, setVendors] = useState<ClientOption[]>([]);
  const [customers, setCustomers] = useState<ClientOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [profileName, setProfileName] = useState("");
  const [frequency, setFrequency] = useState<"Daily" | "Weekly" | "Monthly" | "Quarterly" | "Yearly">("Monthly");
  const [startDate, setStartDate] = useState("2026-06-29");
  const [endsOn, setEndsOn] = useState("");
  const [neverExpires, setNeverExpires] = useState(true);
  
  const [expenseAccount, setExpenseAccount] = useState("Software and Subscriptions");
  const [amount, setAmount] = useState("");
  const [paidThrough, setPaidThrough] = useState("Petty Cash");

  const [expenseType, setExpenseType] = useState<"Goods" | "Services">("Services");
  const [sacCode, setSacCode] = useState(""); // SAC for services, HSN for goods
  const [vendorName, setVendorName] = useState("");
  const [gstTreatment, setGstTreatment] = useState("Registered Business - Regular");
  const [sourceOfSupply, setSourceOfSupply] = useState("");
  const [destinationOfSupply, setDestinationOfSupply] = useState("");
  const [reverseCharge, setReverseCharge] = useState(false);
  const [taxRate, setTaxRate] = useState("GST 18%");
  const [amountIs, setAmountIs] = useState<"Inclusive" | "Exclusive">("Exclusive");

  const [notes, setNotes] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [reportingTags, setReportingTags] = useState("");

  // Indian States
  const indianStates: Record<string, string> = {
    "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
    "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
    "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur",
    "15": "Mizoram", "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal",
    "20": "Jharkhand", "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
    "25": "Daman & Diu", "26": "Dadra & Nagar Haveli", "27": "Maharashtra", "29": "Karnataka",
    "30": "Goa", "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry",
    "35": "Andaman & Nicobar Islands", "36": "Telangana", "37": "Andhra Pradesh", "38": "Ladakh"
  };

  // Load Vendor & Customer options
  useEffect(() => {
    async function loadOptions() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch vendors
        const resVendors = await fetch("http://localhost:8888/api/client/list?type=vendor", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const dVendors = await resVendors.json();
        if (dVendors.success && dVendors.clients) {
          setVendors(dVendors.clients.map((c: any) => ({
            id: c.custom_id,
            name: c.name,
            customId: c.custom_id
          })));
        }

        // Fetch customers
        const resCustomers = await fetch("http://localhost:8888/api/client/list?type=customer", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const dCustomers = await resCustomers.json();
        if (dCustomers.success && dCustomers.clients) {
          setCustomers(dCustomers.clients.map((c: any) => ({
            id: c.custom_id,
            name: c.name,
            customId: c.custom_id
          })));
        }
      } catch (err) {
        console.error("Failed to load options from server:", err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  // Calculate dynamic next date
  const getNextOccurrenceLabel = (startDateStr: string, freq: string) => {
    const d = new Date(startDateStr);
    if (isNaN(d.getTime())) return "";
    switch (freq) {
      case "Daily":
        d.setDate(d.getDate() + 1);
        break;
      case "Weekly":
        d.setDate(d.getDate() + 7);
        break;
      case "Monthly":
        d.setMonth(d.getMonth() + 1);
        break;
      case "Quarterly":
        d.setMonth(d.getMonth() + 3);
        break;
      case "Yearly":
        d.setFullYear(d.getFullYear() + 1);
        break;
    }
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const nextOccurrenceDate = getNextOccurrenceLabel(startDate, frequency);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amtFloat = parseFloat(amount);
    if (!profileName || isNaN(amtFloat) || amtFloat <= 0) {
      alert("Please provide a valid Profile Name and Amount greater than 0.");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      
      // Calculate next creation date ISO string to store in next_date
      const d = new Date(startDate);
      switch (frequency) {
        case "Daily": d.setDate(d.getDate() + 1); break;
        case "Weekly": d.setDate(d.getDate() + 7); break;
        case "Monthly": d.setMonth(d.getMonth() + 1); break;
        case "Quarterly": d.setMonth(d.getMonth() + 3); break;
        case "Yearly": d.setFullYear(d.getFullYear() + 1); break;
      }
      const nextDateIso = d.toISOString().split('T')[0];

      const payload = {
        merchant: profileName,
        category: expenseAccount,
        amount: amtFloat,
        frequency: frequency,
        next_date: nextDateIso,
        is_active: true,
        other_details: {
          profile_name: profileName,
          repeat_every: frequency,
          start_date: startDate,
          ends_on: neverExpires ? null : endsOn,
          never_expires: neverExpires,
          expense_account: expenseAccount,
          paid_through: paidThrough,
          expense_type: expenseType,
          sac_code: sacCode,
          vendor_name: vendorName,
          gst_treatment: gstTreatment,
          source_of_supply: sourceOfSupply,
          destination_of_supply: destinationOfSupply,
          reverse_charge: reverseCharge,
          tax_rate: taxRate,
          amount_is: amountIs,
          notes: notes.substring(0, 500),
          customer_name: customerName,
          reporting_tags: reportingTags
        }
      };

      const response = await fetch("http://localhost:8888/api/recurring-expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const res = await response.json();
      if (res.success) {
        router.push("/recurring-expenses");
      } else {
        alert(res.message || "Failed to create recurring expense");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting form");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-[1000px] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/recurring-expenses")}
          className="w-10 h-10 border border-border rounded-lg bg-card flex items-center justify-center hover:bg-card-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] text-muted-foreground">arrow_back</span>
        </button>
        <PageHeader
          title="New Recurring Expense"
          subtitle="Configure a repeating expense profile that generates transactions automatically."
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recurring Settings */}
        <SectionCard title="Recurring Schedule">
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Profile Name">
                <input
                  required
                  placeholder="e.g. AWS Production Infrastructure"
                  className={inputCls}
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
              </FormField>

              <FormField label="Repeat Every">
                <select
                  className={selectCls}
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Start Date">
                <div className="space-y-1.5">
                  <input
                    type="date"
                    required
                    className={inputCls}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  {nextOccurrenceDate && (
                    <p className="text-[11px] font-medium text-[#5B5FEF]">
                      The recurring expense will be created on {nextOccurrenceDate}
                    </p>
                  )}
                </div>
              </FormField>

              <FormField label="Ends On">
                <div className="space-y-2">
                  <input
                    type="date"
                    className={inputCls}
                    disabled={neverExpires}
                    required={!neverExpires}
                    value={endsOn}
                    onChange={(e) => setEndsOn(e.target.value)}
                  />
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={neverExpires}
                      onChange={(e) => setNeverExpires(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                    />
                    Never Expires
                  </label>
                </div>
              </FormField>
            </div>
          </div>
        </SectionCard>

        {/* Expense & Payment Info */}
        <SectionCard title="Expense & Payment details">
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <FormField label="Expense Account">
                  <select
                    className={selectCls}
                    value={expenseAccount}
                    onChange={(e) => setExpenseAccount(e.target.value)}
                  >
                    <option value="Travel Expense">Travel Expense</option>
                    <option value="Meals and Entertainment">Meals & Entertainment</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Software and Subscriptions">Software & Subscriptions</option>
                    <option value="Courier & Shipping">Courier & Shipping</option>
                    <option value="Consulting Services">Consulting Services</option>
                    <option value="Rent Expense">Rent Expense</option>
                    <option value="Other Expense">Other Expense</option>
                  </select>
                </FormField>
              </div>

              <FormField label="Amount (₹)">
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  required
                  className={inputCls}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </FormField>
            </div>

            <FormField label="Paid Through">
              <select
                className={selectCls}
                value={paidThrough}
                onChange={(e) => setPaidThrough(e.target.value)}
              >
                <option value="Petty Cash">Petty Cash</option>
                <option value="Undeposited Funds">Undeposited Funds</option>
                <option value="Employee Reimbursement Account">Employee Reimbursement Account</option>
                <option value="Corporate Credit Card">Corporate Credit Card</option>
                <option value="Bank Account">Bank Account</option>
              </select>
            </FormField>
          </div>
        </SectionCard>

        {/* GST / Taxation Settings */}
        <SectionCard title="GST & Taxation Settings">
          <div className="space-y-5">
            <div className="flex items-center gap-6">
              <label className="text-sm font-semibold text-foreground w-32 shrink-0">Expense Type</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="expType"
                    checked={expenseType === "Goods"}
                    onChange={() => setExpenseType("Goods")}
                    className="accent-primary"
                  />
                  Goods
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="expType"
                    checked={expenseType === "Services"}
                    onChange={() => setExpenseType("Services")}
                    className="accent-primary"
                  />
                  Services
                </label>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="text-sm font-semibold text-foreground w-32 shrink-0">
                {expenseType === "Services" ? "SAC Code" : "HSN Code"}
              </label>
              <div className="flex-1 max-w-xs">
                <input
                  className={inputCls}
                  placeholder={expenseType === "Services" ? "e.g. 998311" : "e.g. 84713010"}
                  value={sacCode}
                  onChange={(e) => setSacCode(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Vendor">
                <select
                  className={selectCls}
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                >
                  <option value="">Select Vendor</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.name}>{v.name} ({v.customId})</option>
                  ))}
                </select>
              </FormField>

              <FormField label="GST Treatment">
                <select
                  className={selectCls}
                  value={gstTreatment}
                  onChange={(e) => setGstTreatment(e.target.value)}
                >
                  <option value="Registered Business - Regular">Registered Business - Regular</option>
                  <option value="Registered Business - Composition">Registered Business - Composition</option>
                  <option value="Unregistered Business">Unregistered Business</option>
                  <option value="Consumer">Consumer</option>
                  <option value="Overseas">Overseas</option>
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Source of Supply">
                <select
                  className={selectCls}
                  value={sourceOfSupply}
                  onChange={(e) => setSourceOfSupply(e.target.value)}
                >
                  <option value="">Select State</option>
                  {Object.entries(indianStates).map(([code, name]) => (
                    <option key={code} value={`${code}-${name}`}>{code} - {name}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Destination of Supply">
                <select
                  className={selectCls}
                  value={destinationOfSupply}
                  onChange={(e) => setDestinationOfSupply(e.target.value)}
                >
                  <option value="">Select State</option>
                  {Object.entries(indianStates).map(([code, name]) => (
                    <option key={code} value={`${code}-${name}`}>{code} - {name}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="font-semibold text-sm mb-1">Reverse Charge?</p>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={reverseCharge}
                  onChange={(e) => setReverseCharge(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                />
                <span>This transaction is applicable for reverse charge</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
              <FormField label="Tax">
                <select
                  className={selectCls}
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                >
                  <option value="Out of Scope">Out of Scope</option>
                  <option value="GST 0%">GST 0%</option>
                  <option value="GST 5%">GST 5%</option>
                  <option value="GST 12%">GST 12%</option>
                  <option value="GST 18%">GST 18%</option>
                  <option value="GST 28%">GST 28%</option>
                </select>
              </FormField>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Amount Is</label>
                <div className="flex items-center gap-4 h-10">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="amtIs"
                      checked={amountIs === "Inclusive"}
                      onChange={() => setAmountIs("Inclusive")}
                      className="accent-primary"
                    />
                    Tax Inclusive
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="amtIs"
                      checked={amountIs === "Exclusive"}
                      onChange={() => setAmountIs("Exclusive")}
                      className="accent-primary"
                    />
                    Tax Exclusive
                  </label>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* References & Attachments */}
        <SectionCard title="Other Metadata">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Customer Name">
                <select
                  className={selectCls}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.name}>{c.name} ({c.customId})</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Reporting Tags">
                <input
                  placeholder="e.g. Q2-Marketing, Pune-Branch"
                  className={inputCls}
                  value={reportingTags}
                  onChange={(e) => setReportingTags(e.target.value)}
                />
              </FormField>
            </div>

            <FormField label="Notes">
              <textarea
                className={cn(inputCls, "h-20 resize-none")}
                placeholder="Max. 500 characters..."
                maxLength={500}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground text-right">{notes.length}/500</p>
            </FormField>
          </div>
        </SectionCard>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pb-10">
          <button
            type="button"
            onClick={() => router.push("/recurring-expenses")}
            className="px-6 py-2.5 rounded-lg font-bold text-sm text-muted-foreground border border-border hover:bg-card-container transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm active:scale-95 animate-in fade-in zoom-in-95 duration-150 flex items-center gap-2"
          >
            {saving && <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>}
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
