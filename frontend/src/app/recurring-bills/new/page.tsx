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

interface BillItemRow {
  id: number;
  itemDetails: string;
  account: string;
  quantity: number;
  rate: number;
  tax: string;
  customerId: string;
  amount: number;
}

export default function NewRecurringBill() {
  const router = useRouter();

  // Loading options state
  const [vendors, setVendors] = useState<ClientOption[]>([]);
  const [customers, setCustomers] = useState<ClientOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [vendorId, setVendorId] = useState("");
  const [profileName, setProfileName] = useState("");
  const [frequency, setFrequency] = useState("Monthly");
  const [startDate, setStartDate] = useState("2026-06-29");
  const [endDate, setEndDate] = useState("");
  const [neverExpires, setNeverExpires] = useState(true);
  const [apAccount, setApAccount] = useState("Accounts Payable");
  const [paymentTerms, setPaymentTerms] = useState("Due on Receipt");
  const [reverseCharge, setReverseCharge] = useState(false);

  // Item Rows
  const [rows, setRows] = useState<BillItemRow[]>([
    {
      id: 1,
      itemDetails: "",
      account: "Cost of Goods Sold",
      quantity: 1,
      rate: 0,
      tax: "GST 18%",
      customerId: "",
      amount: 0
    }
  ]);

  const [discountVal, setDiscountVal] = useState("0");
  const [discountType, setDiscountType] = useState<"%" | "₹">("%");
  const [tdsRate, setTdsRate] = useState("0");
  const [adjustment, setAdjustment] = useState("0");
  const [notes, setNotes] = useState("");

  // Fetch Vendors & Customers
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
            id: c.id,
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
            id: c.id,
            name: c.name,
            customId: c.custom_id
          })));
        }
      } catch (err) {
        console.error("Failed to load options:", err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  // Update item row details
  const updateRow = (id: number, field: keyof BillItemRow, val: any) => {
    setRows(prevRows =>
      prevRows.map(row => {
        if (row.id !== id) return row;
        const updated = { ...row, [field]: val };
        
        // Recalculate amount
        const qty = parseFloat(updated.quantity as any) || 0;
        const rate = parseFloat(updated.rate as any) || 0;
        updated.amount = Math.max(0, qty * rate);
        return updated;
      })
    );
  };

  // Add Item Row
  const addRow = () => {
    const nextId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    setRows([...rows, {
      id: nextId,
      itemDetails: "",
      account: "Cost of Goods Sold",
      quantity: 1,
      rate: 0,
      tax: "GST 18%",
      customerId: "",
      amount: 0
    }]);
  };

  // Remove Item Row
  const removeRow = (id: number) => {
    if (rows.length === 1) {
      setRows([{
        id: 1,
        itemDetails: "",
        account: "Cost of Goods Sold",
        quantity: 1,
        rate: 0,
        tax: "GST 18%",
        customerId: "",
        amount: 0
      }]);
    } else {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  // Financial calculations
  const rawSubTotal = rows.reduce((acc, row) => acc + (row.amount || 0), 0);

  const discValNum = parseFloat(discountVal) || 0;
  const discountAmount = discountType === "%" ? (rawSubTotal * discValNum) / 100 : discValNum;
  
  const subTotal = Math.max(0, rawSubTotal - discountAmount);

  const tdsRateNum = parseFloat(tdsRate) || 0;
  const tdsAmount = (subTotal * tdsRateNum) / 100;

  const adjustmentNum = parseFloat(adjustment) || 0;
  const totalAmount = Math.max(0, subTotal - tdsAmount + adjustmentNum);

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vendorId) {
      alert("Please select a Vendor.");
      return;
    }

    if (!profileName) {
      alert("Please enter a Profile Name.");
      return;
    }

    if (rows.some(r => !r.itemDetails)) {
      alert("Please enter item details for all items.");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      let freqParam = frequency;
      if (frequency === "Yearly") freqParam = "Yearly";
      else if (frequency === "Annually") freqParam = "Yearly";

      const payload = {
        client_id: parseInt(vendorId),
        amount: totalAmount,
        frequency: freqParam,
        next_date: startDate,
        is_active: true,
        other_details: {
          profile_name: profileName,
          start_date: startDate,
          end_date: neverExpires ? null : (endDate || null),
          never_expires: neverExpires,
          ap_account: apAccount,
          payment_terms: paymentTerms,
          reverse_charge: reverseCharge,
          discount_val: discountVal,
          discount_type: discountType,
          tds_rate: tdsRate,
          adjustment: adjustment,
          notes,
          items: rows.map(r => {
            let taxVal = 18;
            if (r.tax.includes("0%")) taxVal = 0;
            else if (r.tax.includes("5%")) taxVal = 5;
            else if (r.tax.includes("12%")) taxVal = 12;
            else if (r.tax.includes("18%")) taxVal = 18;
            else if (r.tax.includes("28%")) taxVal = 28;
            else if (r.tax.includes("Out of Scope")) taxVal = 0;

            return {
              description: r.itemDetails,
              account: r.account,
              quantity: parseFloat(r.quantity as any) || 1,
              rate: parseFloat(r.rate as any) || 0,
              tax_rate: taxVal,
              customer_id: r.customerId || null,
              amount: r.amount
            };
          })
        }
      };

      const response = await fetch("http://localhost:8888/api/recurring-bills/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const res = await response.json();
      if (res.success) {
        router.push("/recurring-bills");
      } else {
        alert(res.message || "Failed to create recurring bill");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting recurring bill template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-[1100px] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/recurring-bills")}
          className="w-10 h-10 border border-border rounded-lg bg-card flex items-center justify-center hover:bg-card-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] text-muted-foreground">arrow_back</span>
        </button>
        <PageHeader
          title="New Recurring Bill"
          subtitle="Configure a template to auto-raise vendor bills on a schedule."
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vendor Selector card */}
        <SectionCard title="Vendor details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Vendor Name">
              <select
                required
                className={selectCls}
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
              >
                <option value="">Select Vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} ({v.customId})</option>
                ))}
              </select>
            </FormField>

            <FormField label="Profile Name">
              <input
                required
                placeholder="e.g. Monthly Office Internet Lease"
                className={inputCls}
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
            </FormField>
          </div>
        </SectionCard>

        {/* Schedule settings */}
        <SectionCard title="Schedule configuration">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Repeat Every">
              <select
                className={selectCls}
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </FormField>

            <FormField label="Start Date (Start On)">
              <input
                type="date"
                required
                className={inputCls}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </FormField>

            <FormField label="Ends On">
              <input
                type="date"
                disabled={neverExpires}
                required={!neverExpires}
                className={inputCls}
                value={neverExpires ? "" : endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </FormField>
          </div>

          <div className="pt-3 flex gap-6 items-center">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-muted-foreground">
              <input
                type="checkbox"
                checked={neverExpires}
                onChange={(e) => setNeverExpires(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary w-4 h-4"
              />
              Never Expires
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-muted-foreground border-l border-border pl-6">
              <input
                type="checkbox"
                checked={reverseCharge}
                onChange={(e) => setReverseCharge(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary w-4 h-4"
              />
              This transaction is applicable for reverse charge
            </label>
          </div>
        </SectionCard>

        {/* Bill default configurations */}
        <SectionCard title="Bill settings template">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Accounts Payable (A/P)">
              <select
                className={selectCls}
                value={apAccount}
                onChange={(e) => setApAccount(e.target.value)}
              >
                <option value="Accounts Payable">Accounts Payable (Default)</option>
                <option value="Accrued Liabilities">Accrued Liabilities</option>
              </select>
            </FormField>

            <FormField label="Payment Terms">
              <select
                className={selectCls}
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
              >
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
              </select>
            </FormField>
          </div>
        </SectionCard>

        {/* Items Table */}
        <SectionCard title="Item Details Table" noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="px-4 py-2.5 font-bold uppercase text-[10px] tracking-wider text-muted-foreground">Item Details</th>
                  <th className="px-4 py-2.5 font-bold uppercase text-[10px] tracking-wider text-muted-foreground w-44">Account</th>
                  <th className="px-4 py-2.5 font-bold uppercase text-[10px] tracking-wider text-muted-foreground w-16 text-center">Qty</th>
                  <th className="px-4 py-2.5 font-bold uppercase text-[10px] tracking-wider text-muted-foreground w-24 text-right">Rate (₹)</th>
                  <th className="px-4 py-2.5 font-bold uppercase text-[10px] tracking-wider text-muted-foreground w-28 text-center">Tax</th>
                  <th className="px-4 py-2.5 font-bold uppercase text-[10px] tracking-wider text-muted-foreground w-36">Customer Details</th>
                  <th className="px-4 py-2.5 font-bold uppercase text-[10px] tracking-wider text-muted-foreground text-right w-24">Amount</th>
                  <th className="px-4 py-2.5 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/10">
                    <td className="px-2 py-2">
                      <input
                        placeholder="Item description..."
                        className={inputCls}
                        value={row.itemDetails}
                        onChange={(e) => updateRow(row.id, "itemDetails", e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <select
                        className={selectCls}
                        value={row.account}
                        onChange={(e) => updateRow(row.id, "account", e.target.value)}
                      >
                        <option value="Cost of Goods Sold">Cost of Goods Sold</option>
                        <option value="Materials Purchase">Materials Purchase</option>
                        <option value="Office Supplies">Office Supplies</option>
                        <option value="Software Subscriptions">Software Subscriptions</option>
                        <option value="Other Expenses">Other Expenses</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min={0.01}
                        step="0.01"
                        className={cn(inputCls, "text-center")}
                        value={row.quantity}
                        onChange={(e) => updateRow(row.id, "quantity", e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        className={cn(inputCls, "text-right")}
                        value={row.rate}
                        onChange={(e) => updateRow(row.id, "rate", e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <select
                        className={selectCls}
                        value={row.tax}
                        onChange={(e) => updateRow(row.id, "tax", e.target.value)}
                      >
                        <option value="Out of Scope">Out of Scope</option>
                        <option value="GST 0%">GST 0%</option>
                        <option value="GST 5%">GST 5%</option>
                        <option value="GST 12%">GST 12%</option>
                        <option value="GST 18%">GST 18%</option>
                        <option value="GST 28%">GST 28%</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <select
                        className={selectCls}
                        value={row.customerId}
                        onChange={(e) => updateRow(row.id, "customerId", e.target.value)}
                      >
                        <option value="">Choose Customer</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>{c.name} ({c.customId})</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2 text-right font-mono font-semibold tabular-nums text-foreground">
                      ₹{row.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="w-7 h-7 flex items-center justify-center text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-border bg-muted/10 flex justify-start">
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1 text-[#5B5FEF] hover:bg-[#5B5FEF]/10 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              Add Row
            </button>
          </div>
        </SectionCard>

        {/* Calculations & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectionCard title="Notes">
            <FormField label="Notes">
              <textarea
                className={cn(inputCls, "h-32 resize-none")}
                placeholder="It will not be shown in PDF..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </FormField>
          </SectionCard>

          <SectionCard title="Financial Calculations">
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground font-semibold">Sub Total</span>
                <span className="font-mono font-bold text-zinc-800">
                  ₹{rawSubTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Discount Input */}
              <div className="flex justify-between items-center py-1 border-t border-border/50 pt-2">
                <span className="text-muted-foreground font-semibold">Discount</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    className={cn(inputCls, "w-24 py-1 px-2 text-right font-mono font-semibold")}
                    value={discountVal}
                    onChange={(e) => setDiscountVal(e.target.value)}
                  />
                  <select
                    className={cn(selectCls, "w-14 py-1 px-1.5 font-bold")}
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as "%" | "₹")}
                  >
                    <option value="%">%</option>
                    <option value="₹">₹</option>
                  </select>
                </div>
              </div>

              {/* TDS Selector */}
              <div className="flex justify-between items-center py-1 border-t border-border/50 pt-2">
                <span className="text-muted-foreground font-semibold">TDS (Tax Deducted at Source)</span>
                <select
                  className={cn(selectCls, "w-40 font-mono font-semibold")}
                  value={tdsRate}
                  onChange={(e) => setTdsRate(e.target.value)}
                >
                  <option value="0">No TDS (0%)</option>
                  <option value="1">TDS 1%</option>
                  <option value="2">TDS 2%</option>
                  <option value="5">TDS 5%</option>
                  <option value="10">TDS 10%</option>
                </select>
              </div>

              {/* Adjustment input */}
              <div className="flex justify-between items-center py-1 border-t border-border/50 pt-2">
                <span className="text-muted-foreground font-semibold">Adjustment</span>
                <input
                  type="number"
                  step="0.01"
                  className={cn(inputCls, "w-40 py-1 px-2 text-right font-mono font-semibold")}
                  value={adjustment}
                  onChange={(e) => setAdjustment(e.target.value)}
                />
              </div>

              {/* Grand Total output */}
              <div className="flex justify-between items-center py-3 border-t-2 border-border/80 pt-4 bg-muted/10 px-3 rounded-lg">
                <span className="text-foreground font-extrabold text-base">Template Total</span>
                <span className="font-mono font-black text-[#5B5FEF] text-lg">
                  ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-4 pb-10">
          <button
            type="button"
            onClick={() => router.push("/recurring-bills")}
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
            Save Template
          </button>
        </div>
      </form>
    </div>
  );
}
