"use client";

export function TaxComplianceStats() {
  return (
    <div className="md:col-span-1 flex flex-col gap-4">
      <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between shadow-sm">
        <div>
          <p className="text-label-md font-label-md text-muted-foreground uppercase tracking-wider">
            Total GST Payable
          </p>
          <p className="text-headline-md font-headline-md text-foreground mt-1">₹4,28,450.00</p>
        </div>
        <div className="p-2.5 bg-destructive/15 rounded-lg">
          <span className="material-symbols-outlined text-destructive">trending_up</span>
        </div>
      </div>
      <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between shadow-sm">
        <div>
          <p className="text-label-md font-label-md text-muted-foreground uppercase tracking-wider">
            Input Tax Credit (ITC)
          </p>
          <p className="text-headline-md font-headline-md text-foreground mt-1">₹1,12,300.00</p>
        </div>
        <div className="p-2.5 bg-secondary rounded-lg">
          <span className="material-symbols-outlined text-secondary-foreground-container">
            account_balance_wallet
          </span>
        </div>
      </div>
    </div>
  );
}
