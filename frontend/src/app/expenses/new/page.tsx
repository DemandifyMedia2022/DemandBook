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

export default function NewExpense() {
  const router = useRouter();

  // Mode state: Expense vs Mileage
  const [activeMode, setActiveMode] = useState<"Expense" | "Mileage">("Expense");

  // Dynamic Options lists
  const [vendors, setVendors] = useState<ClientOption[]>([]);
  const [customers, setCustomers] = useState<ClientOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Common Fields
  const [date, setDate] = useState("2026-06-26");
  const [paidThrough, setPaidThrough] = useState("Petty Cash");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [customerName, setCustomerName] = useState(""); // customer client lookup
  const [documents, setDocuments] = useState<File[]>([]);

  // Expense specific fields
  const [expenseAccount, setExpenseAccount] = useState("Travel Expense");
  const [itemize, setItemize] = useState(false);
  const [amount, setAmount] = useState("");
  const [expenseType, setExpenseType] = useState<"Goods" | "Services">("Goods");
  const [sacCode, setSacCode] = useState("");
  const [vendorName, setVendorName] = useState(""); // vendor client lookup
  const [gstTreatment, setGstTreatment] = useState("Registered Business - Regular");
  const [sourceOfSupply, setSourceOfSupply] = useState("");
  const [destinationOfSupply, setDestinationOfSupply] = useState("");
  const [reverseCharge, setReverseCharge] = useState(false);
  const [taxRate, setTaxRate] = useState("GST 18%");
  const [amountIs, setAmountIs] = useState<"Inclusive" | "Exclusive">("Exclusive");

  // Mileage specific fields
  const [distance, setDistance] = useState("");
  const [mileageUnit, setMileageUnit] = useState("Kilometres");
  const [ratePerUnit, setRatePerUnit] = useState("10.00");
  const [calculatedAmount, setCalculatedAmount] = useState(0);

  // Indian States for supply state drop downs
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

  // Recalculate amount in mileage mode
  useEffect(() => {
    const dist = parseFloat(distance) || 0;
    const rate = parseFloat(ratePerUnit) || 0;
    setCalculatedAmount(dist * rate);
  }, [distance, ratePerUnit]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalAmount = activeMode === "Expense" ? parseFloat(amount) : calculatedAmount;
    if (!finalAmount || finalAmount <= 0) {
      alert("Error: Please provide a valid Amount greater than 0.");
      return;
    }

    try {
      const custom_id = `EXP-${Math.floor(1000 + Math.random() * 9000)}`;
      const merchantValue = activeMode === "Expense" 
        ? (vendorName || "Direct Expense")
        : `Mileage: ${distance} ${mileageUnit}`;

      const categoryValue = activeMode === "Expense"
        ? (expenseAccount.includes("Travel") ? "Travel" : expenseAccount.includes("Meal") ? "Meals" : expenseAccount.includes("Office") ? "Supplies" : "Other")
        : "Travel";

      const payload = {
        custom_id,
        merchant: merchantValue,
        category: categoryValue,
        date: date || "Today",
        amount: finalAmount,
        status: "Synced",
        other_details: {
          is_mileage: activeMode === "Mileage",
          paid_through: paidThrough,
          invoice_number: invoiceNumber,
          notes: notes.substring(0, 500),
          customer_name: customerName,
          
          // Expense fields
          expense_account: expenseAccount,
          itemize: itemize,
          expense_type: expenseType,
          sac_code: expenseType === "Services" ? sacCode : null,
          vendor_name: vendorName,
          gst_treatment: gstTreatment,
          source_of_supply: sourceOfSupply,
          destination_of_supply: destinationOfSupply,
          reverse_charge: reverseCharge,
          tax_rate: taxRate,
          amount_is: amountIs,

          // Mileage fields
          distance: activeMode === "Mileage" ? parseFloat(distance) || 0 : null,
          mileage_unit: activeMode === "Mileage" ? mileageUnit : null,
          rate_per_unit: activeMode === "Mileage" ? parseFloat(ratePerUnit) || 0 : null
        }
      };

      const response = await fetch("http://localhost:8888/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      
      const res = await response.json();
      if (res.success) {
        alert(`${activeMode === "Expense" ? "Expense" : "Mileage"} recorded successfully!`);
        router.push("/expenses");
      } else {
        alert(res.message || "Failed to save record");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting form");
    }
  };

  return (
    <div className="p-6 max-w-[1000px] mx-auto space-y-6">
      <PageHeader
        title="Record Transaction"
        subtitle="Log corporate expenses or track employee mileage for reimbursements."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Toggle Mode: Expense or Mileage */}
        <div className="bg-card border border-border p-1.5 rounded-xl flex gap-1.5 max-w-sm">
          <button
            type="button"
            onClick={() => setActiveMode("Expense")}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
              activeMode === "Expense"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="material-symbols-outlined text-[17px]">receipt_long</span>
            Record Expense
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("Mileage")}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
              activeMode === "Mileage"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="material-symbols-outlined text-[17px]">directions_car</span>
            Record Mileage
          </button>
        </div>

        {/* Primary Form Cards */}
        <SectionCard title={`${activeMode} Details`}>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Date">
                <input 
                  type="date" 
                  className={inputCls} 
                  required 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                />
              </FormField>

              {activeMode === "Expense" && (
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
              )}
            </div>

            {activeMode === "Expense" && (
              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox" 
                  id="itemize" 
                  checked={itemize} 
                  onChange={(e) => setItemize(e.target.checked)} 
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                />
                <label htmlFor="itemize" className="text-sm font-semibold text-foreground cursor-pointer select-none">
                  Itemize
                </label>
              </div>
            )}

            {/* Amount & Paid Through */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeMode === "Expense" ? (
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
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <FormField label="Distance">
                      <input 
                        type="number" 
                        step="0.1" 
                        placeholder="0.0" 
                        required 
                        className={inputCls} 
                        value={distance} 
                        onChange={(e) => setDistance(e.target.value)} 
                      />
                    </FormField>
                  </div>
                  <div>
                    <FormField label="Unit">
                      <select 
                        className={selectCls} 
                        value={mileageUnit} 
                        onChange={(e) => setMileageUnit(e.target.value)}
                      >
                        <option value="Kilometres">km</option>
                        <option value="Miles">mi</option>
                      </select>
                    </FormField>
                  </div>
                </div>
              )}

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

            {activeMode === "Mileage" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Rate per Unit (₹)">
                  <input 
                    type="number" 
                    step="0.01" 
                    className={inputCls} 
                    value={ratePerUnit} 
                    onChange={(e) => setRatePerUnit(e.target.value)} 
                  />
                </FormField>
                <FormField label="Reimbursement Amount (₹)">
                  <div className="h-10 px-3 flex items-center bg-card-container-high border border-border rounded-lg text-sm text-foreground font-bold font-mono">
                    ₹{calculatedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </FormField>
              </div>
            )}
          </div>
        </SectionCard>

        {/* GST / Taxation Section (Expense Only) */}
        {activeMode === "Expense" && (
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

              {expenseType === "Services" && (
                <div className="flex items-center gap-6">
                  <label className="text-sm font-semibold text-foreground w-32 shrink-0">SAC Code</label>
                  <div className="flex-1 max-w-xs">
                    <input 
                      className={inputCls} 
                      placeholder="e.g. 998311" 
                      value={sacCode} 
                      onChange={(e) => setSacCode(e.target.value)} 
                    />
                  </div>
                </div>
              )}

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
                <FormField label="Tax Rate">
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
        )}

        {/* References & Attachments */}
        <SectionCard title="Other Metadata">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Invoice#">
                <input 
                  className={inputCls} 
                  placeholder="e.g. INV-10029" 
                  value={invoiceNumber} 
                  onChange={(e) => setInvoiceNumber(e.target.value)} 
                />
              </FormField>

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

        {/* Receipts Upload */}
        <SectionCard title="Receipts">
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-card-container transition-colors cursor-pointer relative">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <span className="material-symbols-outlined text-[32px] text-primary mb-2">upload_file</span>
            <p className="font-semibold text-sm">Drag or Drop your Receipts</p>
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

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pb-10">
          <button 
            type="button" 
            onClick={() => router.push("/expenses")} 
            className="px-6 py-2.5 rounded-lg font-bold text-sm text-muted-foreground border border-border hover:bg-card-container transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-6 py-2.5 rounded-lg font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm active:scale-95 animate-in fade-in zoom-in-95 duration-150"
          >
            Save Transaction
          </button>
        </div>
      </form>
    </div>
  );
}
