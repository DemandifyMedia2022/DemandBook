"use client";

export function SparklineTrends() {
  return (
    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Revenue Growth Card */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
            Revenue Growth
          </span>
          <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
            +12.4%
          </span>
        </div>
        <p className="font-headline-md text-headline-md font-black text-foreground">
          $452,190.00
        </p>
        <div className="h-20 w-full mt-4 flex items-end gap-1.5">
          <div className="bg-primary/20 w-full h-[40%] rounded-t-sm"></div>
          <div className="bg-primary/20 w-full h-[60%] rounded-t-sm"></div>
          <div className="bg-primary/20 w-full h-[50%] rounded-t-sm"></div>
          <div className="bg-primary/20 w-full h-[80%] rounded-t-sm"></div>
          <div className="bg-primary w-full h-[100%] rounded-t-sm"></div>
        </div>
      </div>

      {/* Net Cash Flow Card */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
            Net Cash Flow
          </span>
          <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
            -2.1%
          </span>
        </div>
        <p className="font-headline-md text-headline-md font-black text-foreground">
          $128,450.25
        </p>
        <div className="h-20 w-full mt-4 flex items-end gap-1.5">
          <div className="bg-secondary/20 w-full h-[80%] rounded-t-sm"></div>
          <div className="bg-secondary/20 w-full h-[70%] rounded-t-sm"></div>
          <div className="bg-secondary/20 w-full h-[90%] rounded-t-sm"></div>
          <div className="bg-secondary/20 w-full h-[60%] rounded-t-sm"></div>
          <div className="bg-secondary w-full h-[45%] rounded-t-sm"></div>
        </div>
      </div>
    </div>
  );
}
