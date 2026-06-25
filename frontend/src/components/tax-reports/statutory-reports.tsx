"use client";

export function StatutoryReports() {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="font-label-md text-label-md text-muted-foreground uppercase tracking-widest text-[11px] font-bold">
        Generate Statutory Reports
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => alert("Downloading GSTR-1 JSON offline utility tool package...")}
          className="group p-5 bg-card border border-border rounded-xl flex items-center gap-4 hover:bg-primary transition-all duration-300 hover:text-white"
        >
          <div className="w-12 h-12 rounded-lg bg-card-container flex items-center justify-center group-hover:bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-2xl">analytics</span>
          </div>
          <div className="text-left">
            <p className="font-bold text-body-md text-foreground group-hover:text-white">
              GSTR-1 JSON
            </p>
            <p className="text-xs text-muted-foreground group-hover:text-primary-fixed-dim">
              Export for Offline Tool
            </p>
          </div>
        </button>

        <button
          onClick={() => alert("Exporting GSTR-3B monthly summary tax returns report...")}
          className="group p-5 bg-card border border-border rounded-xl flex items-center gap-4 hover:bg-primary transition-all duration-300 hover:text-white"
        >
          <div className="w-12 h-12 rounded-lg bg-card-container flex items-center justify-center group-hover:bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-2xl">grid_view</span>
          </div>
          <div className="text-left">
            <p className="font-bold text-body-md text-foreground group-hover:text-white">
              GSTR-3B Summary
            </p>
            <p className="text-xs text-muted-foreground group-hover:text-primary-fixed-dim">
              Monthly Tax Computation
            </p>
          </div>
        </button>

        <button
          onClick={() => alert("Generating TDS Challan 281 tax payment advice slip...")}
          className="group p-5 bg-card border border-border rounded-xl flex items-center gap-4 hover:bg-primary transition-all duration-300 hover:text-white"
        >
          <div className="w-12 h-12 rounded-lg bg-card-container flex items-center justify-center group-hover:bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-2xl">history_edu</span>
          </div>
          <div className="text-left">
            <p className="font-bold text-body-md text-foreground group-hover:text-white">
              TDS Challan 281
            </p>
            <p className="text-xs text-muted-foreground group-hover:text-primary-fixed-dim">
              Generate Payment Advice
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
