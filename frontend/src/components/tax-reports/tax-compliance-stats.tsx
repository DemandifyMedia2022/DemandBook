"use client";

export function TaxComplianceStats() {
  return (
    <div className="md:col-span-1 flex flex-col gap-4">
      <div className="bg-surface border border-outline-variant p-4 rounded-xl flex items-center justify-between shadow-sm">
        <div>
          <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
            Total GST Payable
          </p>
          <p className="text-headline-md font-headline-md text-on-surface mt-1">₹4,28,450.00</p>
        </div>
        <div className="p-2.5 bg-error-container rounded-lg">
          <span className="material-symbols-outlined text-on-error-container">trending_up</span>
        </div>
      </div>
      <div className="bg-surface border border-outline-variant p-4 rounded-xl flex items-center justify-between shadow-sm">
        <div>
          <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
            Input Tax Credit (ITC)
          </p>
          <p className="text-headline-md font-headline-md text-on-surface mt-1">₹1,12,300.00</p>
        </div>
        <div className="p-2.5 bg-secondary-container rounded-lg">
          <span className="material-symbols-outlined text-on-secondary-container">
            account_balance_wallet
          </span>
        </div>
      </div>
    </div>
  );
}
