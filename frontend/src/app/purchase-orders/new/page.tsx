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

interface POItemRow {
  id: number;
  itemDetails: string;
  account: string;
  quantity: number;
  rate: number;
  tax: string;
  amount: number;
}

export default function NewPurchaseOrder() {
  const router = useRouter();

  // Options states
  const [vendors, setVendors] = useState<ClientOption[]>([]);
  const [customers, setCustomers] = useState<ClientOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [vendorId, setVendorId] = useState("");
  const [deliveryType, setDeliveryType] = useState<"Organization" | "Customer">("Organization");
  const [customerId, setCustomerId] = useState("");
  
  // Default Organization Address details
  const orgAddress = {
    name: "Sunny",
    address: "4th, Office No.15, Nyati Empress, Viman Nagar Road, Viman Nagar, Pune, Maharashtra, India, 411014",
    phone: "91-9373619372"
  };

  const [poNumber, setPoNumber] = useState("PO-00001");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState("2026-06-29");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Due on Receipt");
  const [shipmentPreference, setShipmentPreference] = useState("");
  const [reverseCharge, setReverseCharge] = useState(false);

  // Item Table Rows State
  const [rows, setRows] = useState<POItemRow[]>([
    { id: 1, itemDetails: "", account: "Cost of Goods Sold", quantity: 1, rate: 0, tax: "GST 18%", amount: 0 }
  ]);

  const [notes, setNotes] = useState("");
  const [discountVal, setDiscountVal] = useState("0");
  const [discountType, setDiscountType] = useState<"%" | "₹">("%");
  const [tdsRate, setTdsRate] = useState("0");
  const [tcsRate, setTcsRate] = useState("0");
  const [adjustment, setAdjustment] = useState("0");
  const [termsConditions, setTermsConditions] = useState("");
  const [documents, setDocuments] = useState<File[]>([]);
  const [pdfTemplate, setPdfTemplate] = useState("Standard Template");

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
        console.error("Failed to load options from server:", err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  // Update item row details
  const updateRow = (id: number, field: keyof POItemRow, val: any) => {
    setRows(prevRows =>
      prevRows.map(row => {
        if (row.id !== id) return row;
        const updated = { ...row, [field]: val };
        // Recalculate amount
        if (field === "quantity" || field === "rate") {
          updated.amount = (parseFloat(updated.quantity as any) || 0) * (parseFloat(updated.rate as any) || 0);
        }
        return updated;
      })
    );
  };

  // Add Item Row
  const addRow = () => {
    const nextId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    setRows([...rows, { id: nextId, itemDetails: "", account: "Cost of Goods Sold", quantity: 1, rate: 0, tax: "GST 18%", amount: 0 }]);
  };

  // Remove Item Row
  const removeRow = (id: number) => {
    if (rows.length === 1) {
      setRows([{ id: 1, itemDetails: "", account: "Cost of Goods Sold", quantity: 1, rate: 0, tax: "GST 18%", amount: 0 }]);
    } else {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  // Finance calculations
  const subTotal = rows.reduce((acc, row) => acc + (row.amount || 0), 0);
  
  const discountValNum = parseFloat(discountVal) || 0;
  const discountAmount = discountType === "%" ? (subTotal * discountValNum) / 100 : discountValNum;
  
  const tdsRateNum = parseFloat(tdsRate) || 0;
  const tdsAmount = ((subTotal - discountAmount) * tdsRateNum) / 100;

  const tcsRateNum = parseFloat(tcsRate) || 0;
  const tcsAmount = ((subTotal - discountAmount) * tcsRateNum) / 100;

  const adjustmentNum = parseFloat(adjustment) || 0;
  const totalAmount = Math.max(0, subTotal - discountAmount - tdsAmount + tcsAmount + adjustmentNum);

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (documents.length + newFiles.length > 10) {
        alert("You can upload a maximum of 10 files");
        return;
      }
      for (const file of newFiles) {
        if (file.size > 10 * 1024 * 1024) {
          alert(`File "${file.name}" exceeds the 10MB size limit.`);
          return;
        }
      }
      setDocuments([...documents, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setDocuments(docs => docs.filter((_, i) => i !== index));
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vendorId) {
      alert("Please select a Vendor.");
      return;
    }

    if (rows.some(r => !r.itemDetails)) {
      alert("Please fill in item details for all items.");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      
      const payload = {
        po_number: poNumber,
        client_id: Number(vendorId),
        date: date || new Date().toISOString().split('T')[0],
        delivery_date: deliveryDate || null,
        sub_total: subTotal,
        tax_total: tdsAmount + tcsAmount,
        amount: totalAmount,
        status: "Draft",
        notes: JSON.stringify({
          notes,
          terms_conditions: termsConditions,
          reference,
          payment_terms: paymentTerms,
          shipment_preference: shipmentPreference,
          reverse_charge: reverseCharge,
          discount_val: discountVal,
          discount_type: discountType,
          tds_rate: tdsRate,
          tcs_rate: tcsRate,
          adjustment: adjustment,
          delivery_type: deliveryType,
          customer_id: deliveryType === "Customer" ? customerId : null,
          pdf_template: pdfTemplate
        }),
        items: rows.map(r => {
          // Parse numeric tax
          let taxVal = 18;
          if (r.tax.includes("0%")) taxVal = 0;
          else if (r.tax.includes("5%")) taxVal = 5;
          else if (r.tax.includes("12%")) taxVal = 12;
          else if (r.tax.includes("18%")) taxVal = 18;
          else if (r.tax.includes("28%")) taxVal = 28;
          else if (r.tax.includes("Out of Scope")) taxVal = 0;

          return {
            product_id: null,
            description: `${r.itemDetails} (${r.account})`,
            quantity: parseFloat(r.quantity as any) || 1,
            unit: "pcs",
            rate: parseFloat(r.rate as any) || 0,
            tax_rate: taxVal,
            amount: r.amount
          };
        })
      };

      const response = await fetch("http://localhost:8888/api/purchase-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const res = await response.json();
      if (res.success) {
        router.push("/purchase-orders");
      } else {
        alert(res.message || "Failed to create purchase order");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting purchase order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-[1100px] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/purchase-orders")}
          className="w-10 h-10 border border-border rounded-lg bg-card flex items-center justify-center hover:bg-card-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] text-muted-foreground">arrow_back</span>
        </button>
        <PageHeader
          title="New Purchase Order"
          subtitle="Raise a purchase order and send it to your vendor."
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vendor & Delivery Details */}
        <SectionCard title="Vendor & Delivery details">
          <div className="space-y-6">
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

              {/* Delivery Address Toggle */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Delivery Address Destination
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={deliveryType === "Organization"}
                      onChange={() => setDeliveryType("Organization")}
                      className="accent-primary"
                    />
                    Organization
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={deliveryType === "Customer"}
                      onChange={() => setDeliveryType("Customer")}
                      className="accent-primary"
                    />
                    Customer
                  </label>
                </div>
              </div>
            </div>

            {/* Conditional Delivery Address Content */}
            <div className="p-4 border border-border rounded-lg bg-muted/20">
              {deliveryType === "Organization" ? (
                <div className="space-y-2 text-sm text-foreground">
                  <p className="font-extrabold text-[#5B5FEF]">{orgAddress.name}</p>
                  <div className="text-muted-foreground text-xs leading-relaxed space-y-0.5">
                    <p>4th, Office No.15, Nyati Empress, Viman Nagar Road,</p>
                    <p>Viman Nagar,</p>
                    <p>Pune, Maharashtra, India, 411014</p>
                  </div>
                  <p className="text-xs font-bold text-foreground mt-2">Phone: {orgAddress.phone}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <FormField label="Select Customer">
                    <select
                      className={selectCls}
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                    >
                      <option value="">Choose Customer</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.customId})</option>
                      ))}
                    </select>
                  </FormField>
                  <p className="text-[11px] text-muted-foreground italic">
                    The purchase order will be delivered to the selected customer's billing address.
                  </p>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* PO Basic Meta Details */}
        <SectionCard title="Purchase Order settings">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Purchase Order#">
              <input
                required
                className={inputCls}
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
              />
            </FormField>

            <FormField label="Reference#">
              <input
                placeholder="e.g. REF-892"
                className={inputCls}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </FormField>

            <FormField label="Date">
              <input
                type="date"
                required
                className={inputCls}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </FormField>

            <FormField label="Delivery Date">
              <input
                type="date"
                required
                className={inputCls}
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
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

            <FormField label="Shipment Preference">
              <input
                placeholder="e.g. DHL, FedEx, Self Pickup"
                className={inputCls}
                value={shipmentPreference}
                onChange={(e) => setShipmentPreference(e.target.value)}
              />
            </FormField>
          </div>

          <div className="pt-4 mt-2 border-t border-border">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-muted-foreground">
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

        {/* Dynamic Items Table Card */}
        <SectionCard title="Item Details Table" noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="px-4 py-2.5 font-bold uppercase text-[10px] tracking-wider text-muted-foreground">Item Details</th>
                  <th className="px-4 py-2.5 font-bold uppercase text-[10px] tracking-wider text-muted-foreground w-44">Account</th>
                  <th className="px-4 py-2.5 font-bold uppercase text-[10px] tracking-wider text-muted-foreground w-20">Qty</th>
                  <th className="px-4 py-2.5 font-bold uppercase text-[10px] tracking-wider text-muted-foreground w-28">Rate (₹)</th>
                  <th className="px-4 py-2.5 font-bold uppercase text-[10px] tracking-wider text-muted-foreground w-36">Tax</th>
                  <th className="px-4 py-2.5 font-bold uppercase text-[10px] tracking-wider text-muted-foreground text-right w-28">Amount</th>
                  <th className="px-4 py-2.5 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/10">
                    <td className="px-4 py-2.5">
                      <input
                        placeholder="Type item details..."
                        className={inputCls}
                        value={row.itemDetails}
                        onChange={(e) => updateRow(row.id, "itemDetails", e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <select
                        className={selectCls}
                        value={row.account}
                        onChange={(e) => updateRow(row.id, "account", e.target.value)}
                      >
                        <option value="Cost of Goods Sold">Cost of Goods Sold</option>
                        <option value="Materials Purchase">Materials Purchase</option>
                        <option value="Office Equipment">Office Equipment</option>
                        <option value="Software Subscriptions">Software Subscriptions</option>
                        <option value="Courier Charges">Courier Charges</option>
                        <option value="Other Expenses">Other Expenses</option>
                      </select>
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="number"
                        min={0.01}
                        step="0.01"
                        className={inputCls}
                        value={row.quantity}
                        onChange={(e) => updateRow(row.id, "quantity", e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        className={inputCls}
                        value={row.rate}
                        onChange={(e) => updateRow(row.id, "rate", e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-2.5">
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
                    <td className="px-4 py-2.5 text-right font-mono font-semibold tabular-nums text-foreground">
                      ₹{row.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2.5 text-center">
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

        {/* Pricing Summary section & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectionCard title="Internal Notes & PDF Layout">
            <div className="space-y-4">
              <FormField label="Notes">
                <textarea
                  className={cn(inputCls, "h-20 resize-none")}
                  placeholder="Will be displayed on purchase order..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </FormField>

              <FormField label="Terms & Conditions">
                <textarea
                  className={cn(inputCls, "h-20 resize-none")}
                  placeholder="Enter the terms and conditions of your business to be displayed..."
                  value={termsConditions}
                  onChange={(e) => setTermsConditions(e.target.value)}
                />
              </FormField>

              {/* PDF Template change block */}
              <div className="p-3.5 border border-border rounded-lg bg-card flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">picture_as_pdf</span>
                  <div>
                    <p className="text-xs font-bold text-foreground">PDF Template Layout</p>
                    <p className="text-[11px] text-muted-foreground">{pdfTemplate}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPdfTemplate(prev => prev === "Standard Template" ? "Modern Design Template" : "Standard Template")}
                  className="text-xs font-extrabold text-[#5B5FEF] hover:underline"
                >
                  Change Layout
                </button>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Financial Calculations Summary">
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground font-semibold">Sub Total</span>
                <span className="font-mono font-bold text-foreground">
                  ₹{subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Discount inputs */}
              <div className="flex justify-between items-center py-1 border-t border-border/50 pt-2">
                <span className="text-muted-foreground font-semibold">Discount</span>
                <div className="flex items-center gap-2 w-44">
                  <input
                    type="number"
                    min={0}
                    className={cn(inputCls, "py-1 px-2 text-right font-mono font-semibold")}
                    value={discountVal}
                    onChange={(e) => setDiscountVal(e.target.value)}
                  />
                  <select
                    className={cn(selectCls, "py-1 px-2 w-16 text-center")}
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
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
                  className={cn(selectCls, "w-44 font-mono font-semibold")}
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

              {/* TCS Selector */}
              <div className="flex justify-between items-center py-1 border-t border-border/50 pt-2">
                <span className="text-muted-foreground font-semibold">TCS (Tax Collected at Source)</span>
                <select
                  className={cn(selectCls, "w-44 font-mono font-semibold")}
                  value={tcsRate}
                  onChange={(e) => setTcsRate(e.target.value)}
                >
                  <option value="0">No TCS (0%)</option>
                  <option value="0.1">TCS 0.1%</option>
                  <option value="1">TCS 1%</option>
                  <option value="5">TCS 5%</option>
                </select>
              </div>

              {/* Adjustment input */}
              <div className="flex justify-between items-center py-1 border-t border-border/50 pt-2">
                <span className="text-muted-foreground font-semibold">Adjustment</span>
                <input
                  type="number"
                  step="0.01"
                  className={cn(inputCls, "w-44 py-1 px-2 text-right font-mono font-semibold")}
                  value={adjustment}
                  onChange={(e) => setAdjustment(e.target.value)}
                />
              </div>

              {/* Grand Total output */}
              <div className="flex justify-between items-center py-3 border-t-2 border-border/80 pt-4 bg-muted/10 px-3 rounded-lg">
                <span className="text-foreground font-extrabold text-base">Grand Total</span>
                <span className="font-mono font-black text-[#5B5FEF] text-lg">
                  ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Attachments Section */}
        <SectionCard title="Attachments">
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-card-container transition-colors cursor-pointer relative">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <span className="material-symbols-outlined text-[32px] text-primary mb-2">upload_file</span>
            <p className="font-semibold text-sm">Drag or Drop your Purchase Order Files</p>
            <p className="text-xs text-muted-foreground mt-1">Maximum file size allowed is 10MB (max 10 files)</p>
          </div>

          {documents.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {documents.map((file, i) => (
                <div key={i} className="flex items-center justify-between bg-card-container p-2 rounded-lg border border-border">
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-semibold truncate" title={file.name}>{file.name}</p>
                    <p className="text-[9px] text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button type="button" onClick={() => handleRemoveFile(i)} className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Form Action buttons */}
        <div className="flex justify-end gap-4 pb-10">
          <button
            type="button"
            onClick={() => router.push("/purchase-orders")}
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
            Save Purchase Order
          </button>
        </div>
      </form>
    </div>
  );
}
