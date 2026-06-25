"use client";

import { useState } from "react";
import { TaxRate } from "./tax-rates-table";

interface CreateTaxRateModalProps {
  onClose: () => void;
  onCreate: (newRate: TaxRate) => void;
}

export function CreateTaxRateModal({ onClose, onCreate }: CreateTaxRateModalProps) {
  const [newTaxName, setNewTaxName] = useState("");
  const [newTaxRate, setNewTaxRate] = useState("");
  const [newTaxType, setNewTaxType] = useState("Output GST");
  const [newTaxAccount, setNewTaxAccount] = useState("GST Liability Account");
  const [newTaxStatus, setNewTaxStatus] = useState<TaxRate["status"]>("Active");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaxName || !newTaxRate) return;

    onCreate({
      name: newTaxName,
      rate: parseFloat(newTaxRate),
      type: newTaxType,
      account: newTaxAccount,
      status: newTaxStatus,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-border flex justify-between items-center bg-card-container-low">
          <h3 className="font-headline-sm text-headline-sm text-foreground">
            Create New Tax Rate
          </h3>
          <button
            onClick={onClose}
            className="material-symbols-outlined p-1 text-muted-foreground hover:bg-card-container rounded transition-colors"
          >
            close
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Tax Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. GST @ 18%"
                className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-body-md"
                value={newTaxName}
                onChange={(e) => setNewTaxName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="18.00"
                className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-body-md"
                value={newTaxRate}
                onChange={(e) => setNewTaxRate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Tax Type
              </label>
              <select
                className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-body-md cursor-pointer bg-white"
                value={newTaxType}
                onChange={(e) => setNewTaxType(e.target.value)}
              >
                <option value="Output GST">Output GST</option>
                <option value="Input GST">Input GST</option>
                <option value="Exempt">Exempt</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-body-md cursor-pointer bg-white"
                value={newTaxStatus}
                onChange={(e) => setNewTaxStatus(e.target.value as any)}
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Accounting Ledger Account
            </label>
            <input
              type="text"
              required
              placeholder="e.g. GST Liability Account"
              className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-body-md"
              value={newTaxAccount}
              onChange={(e) => setNewTaxAccount(e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded text-label-md font-label-md text-muted-foreground hover:bg-card-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded text-label-md font-label-md hover:opacity-90 transition-opacity"
            >
              Save Tax Rate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
