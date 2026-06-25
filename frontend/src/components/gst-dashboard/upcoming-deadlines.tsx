"use client";

export function UpcomingDeadlines() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <h4 className="font-headline-sm text-headline-sm mb-6 flex items-center gap-2 text-foreground">
        <span className="material-symbols-outlined text-tertiary">alarm</span>
        Upcoming Deadlines
      </h4>
      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-destructive/15 text-destructive flex items-center justify-center font-bold text-sm">
              20
            </div>
            <div className="w-[1px] flex-grow bg-border my-2"></div>
          </div>
          <div>
            <p className="font-bold text-foreground">GSTR-3B Filing</p>
            <p className="text-body-sm text-muted-foreground mt-0.5">
              Due Date for Monthly Filers (May 2024)
            </p>
            <button
              onClick={() => alert("Preparing GSTR-3B Return...")}
              className="mt-2 text-primary text-xs font-semibold flex items-center gap-1 hover:opacity-80 transition-all"
            >
              Prepare Return
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-card-container-high text-foreground flex items-center justify-center font-bold text-sm">
              25
            </div>
            <div className="w-[1px] flex-grow bg-border my-2"></div>
          </div>
          <div>
            <p className="font-bold text-foreground">GSTR-5/6/7/8</p>
            <p className="text-body-sm text-muted-foreground mt-0.5">
              Deadlines for special tax categories
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-card-container-high text-foreground flex items-center justify-center font-bold text-sm">
              01
            </div>
          </div>
          <div>
            <p className="font-bold text-foreground">GSTR-1 (June)</p>
            <p className="text-body-sm text-muted-foreground mt-0.5">
              Preparation window opens
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
