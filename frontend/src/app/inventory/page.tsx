// "use client";

// import { useState } from "react";
// import { cn } from "@/lib/utils";
// import Image from "next/image";

// interface Adjustment {
//   id: string;
//   date: string;
//   reference: string;
//   reason: string;
//   warehouse: string;
//   type: "Inbound" | "Outbound" | "Write-off";
//   qtyChange: number;
//   status: "Approved" | "Draft";
// }

// interface AlertItem {
//   name: string;
//   sku: string;
//   qtyLeft: number;
//   minQty: number;
//   icon: string;
// }

// const initialAdjustments: Adjustment[] = [
//   {
//     id: "1",
//     date: "Oct 24, 2023",
//     reference: "ADJ-00921",
//     reason: "Inventory Count",
//     warehouse: "North Branch (NJ)",
//     type: "Inbound",
//     qtyChange: 150,
//     status: "Approved",
//   },
//   {
//     id: "2",
//     date: "Oct 23, 2023",
//     reference: "ADJ-00845",
//     reason: "Damaged Goods",
//     warehouse: "Central Hub (TX)",
//     type: "Write-off",
//     qtyChange: -12,
//     status: "Approved",
//   },
//   {
//     id: "3",
//     date: "Oct 22, 2023",
//     reference: "ADJ-00812",
//     reason: "Transfer Out",
//     warehouse: "West Port (CA)",
//     type: "Outbound",
//     qtyChange: -45,
//     status: "Draft",
//   },
// ];

// const initialAlertItems: AlertItem[] = [
//   {
//     name: "Quantum Theory (Hardcover)",
//     sku: "QNT-HB-002",
//     qtyLeft: 3,
//     minQty: 20,
//     icon: "book",
//   },
//   {
//     name: "Data Structures 101",
//     sku: "DS101-PB",
//     qtyLeft: 8,
//     minQty: 50,
//     icon: "import_contacts",
//   },
// ];

// export default function Inventory() {
//   const [adjustments, setAdjustments] = useState<Adjustment[]>(initialAdjustments);
//   const [alerts, setAlerts] = useState<AlertItem[]>(initialAlertItems);
//   const [showAddAdjustmentModal, setShowAddAdjustmentModal] = useState(false);

//   // Form states
//   const [ref, setRef] = useState("ADJ-00922");
//   const [reason, setReason] = useState("Inventory Count");
//   const [warehouse, setWarehouse] = useState("North Branch (NJ)");
//   const [type, setType] = useState<Adjustment["type"]>("Inbound");
//   const [change, setChange] = useState("");
//   const [status, setStatus] = useState<Adjustment["status"]>("Approved");

//   const handleCreateAdjustment = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!change) return;

//     const newChange = parseInt(change);
//     const newAdj: Adjustment = {
//       id: String(adjustments.length + 1),
//       date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
//       reference: ref,
//       reason,
//       warehouse,
//       type,
//       qtyChange: type === "Inbound" ? Math.abs(newChange) : -Math.abs(newChange),
//       status,
//     };

//     setAdjustments([newAdj, ...adjustments]);
//     setShowAddAdjustmentModal(false);

//     // Reset Form
//     setRef("ADJ-00" + (adjustments.length + 923));
//     setChange("");
//     setReason("Inventory Count");
//   };

//   return (
//     <div className="p-8 max-w-[1440px] mx-auto space-y-8 flex flex-col min-h-[calc(100vh-4rem)]">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
//         <div>
//           <h2 className="font-headline-lg text-headline-lg text-foreground">
//             Inventory Dashboard
//           </h2>
//           <p className="text-muted-foreground font-body-md text-body-md mt-1">
//             Real-time stock valuation and warehouse health.
//           </p>
//         </div>
//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => alert("Exporting inventory list...")}
//             className="bg-card border border-border text-muted-foreground px-4 py-2 rounded-lg font-label-md flex items-center gap-1 hover:bg-card-container-high transition-colors text-xs"
//           >
//             <span className="material-symbols-outlined text-[18px]">file_download</span> Export
//           </button>
//           <button
//             onClick={() => setShowAddAdjustmentModal(true)}
//             className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-label-md flex items-center gap-1 hover:opacity-90 active:scale-95 transition-all text-xs"
//           >
//             <span className="material-symbols-outlined text-[18px]">add</span> Add Adjustment
//           </button>
//         </div>
//       </div>

//       {/* KPI Bento Grid */}
//       <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
//           <div className="flex justify-between items-start mb-4">
//             <span className="material-symbols-outlined text-primary bg-secondary p-3 rounded-lg">
//               inventory
//             </span>
//             <span className="text-secondary-foreground-fixed-variant bg-secondary px-2 py-0.5 rounded text-[10px] font-bold">
//               +12%
//             </span>
//           </div>
//           <p className="text-muted-foreground font-label-md text-label-md">Total Products</p>
//           <h3 className="font-headline-md text-headline-md text-foreground mt-1">4,821</h3>
//           <div className="mt-4 h-1.5 w-full bg-card-container rounded-full overflow-hidden">
//             <div className="h-full bg-primary w-3/4"></div>
//           </div>
//         </div>

//         <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
//           <div className="flex justify-between items-start mb-4">
//             <span className="material-symbols-outlined text-secondary bg-secondary p-3 rounded-lg">
//               payments
//             </span>
//             <span className="text-on-tertiary-fixed-variant bg-tertiary-fixed px-2 py-0.5 rounded text-[10px] font-bold">
//               Stable
//             </span>
//           </div>
//           <p className="text-muted-foreground font-label-md text-label-md">Stock Value</p>
//           <h3 className="font-headline-md text-headline-md text-foreground mt-1">$1.24M</h3>
//           <div className="mt-4 flex items-center gap-1">
//             <span className="w-2 h-2 rounded-full bg-secondary"></span>
//             <span className="text-label-md font-mono-data text-muted-foreground text-[11px]">
//               Valuation: Current Market
//             </span>
//           </div>
//         </div>

//         <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
//           <div className="flex justify-between items-start mb-4">
//             <span className="material-symbols-outlined text-destructive bg-destructive/15 p-3 rounded-lg">
//               notification_important
//             </span>
//             <span className="text-destructive font-bold text-[10px]">Action Required</span>
//           </div>
//           <p className="text-muted-foreground font-label-md text-label-md">Low Stock Items</p>
//           <h3 className="font-headline-md text-headline-md text-destructive mt-1">
//             {alerts.length} Items
//           </h3>
//           <p className="text-[11px] text-destructive mt-4 font-medium italic underline cursor-pointer">
//             View Reorder List
//           </p>
//         </div>

//         <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
//           <div className="flex justify-between items-start mb-4">
//             <span className="material-symbols-outlined text-tertiary bg-tertiary-fixed p-3 rounded-lg">
//               location_on
//             </span>
//           </div>
//           <p className="text-muted-foreground font-label-md text-label-md">Active Warehouses</p>
//           <h3 className="font-headline-md text-headline-md text-foreground mt-1">08 Units</h3>
//           <div className="mt-4 flex items-center gap-2">
//             <div className="flex -space-x-2">
//               <div className="w-6 h-6 rounded-full border border-white bg-slate-200"></div>
//               <div className="w-6 h-6 rounded-full border border-white bg-slate-300"></div>
//               <div className="w-6 h-6 rounded-full border border-white bg-slate-400"></div>
//             </div>
//             <span className="text-label-md text-muted-foreground text-[11px]">+5 Regions</span>
//           </div>
//         </div>
//       </section>

//       {/* Visualization Row */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Flow Chart */}
//         <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 flex flex-col shadow-sm">
//           <div className="flex items-center justify-between mb-6">
//             <h4 className="font-headline-sm text-headline-sm text-foreground">Inventory Flow</h4>
//             <div className="flex items-center gap-3 text-label-md text-xs text-muted-foreground">
//               <span className="flex items-center gap-1">
//                 <span className="w-2 h-2 rounded-full bg-primary"></span> Stock-in
//               </span>
//               <span className="flex items-center gap-1">
//                 <span className="w-2 h-2 rounded-full bg-border"></span> Stock-out
//               </span>
//             </div>
//           </div>
//           <div className="relative h-64 w-full flex items-end justify-between gap-2 border-b border-border pb-1">
//             <div className="w-full flex items-end justify-between px-4 h-full z-10">
//               <div className="w-5 bg-primary/10/60 h-28 rounded-t-sm"></div>
//               <div className="w-5 bg-primary/10/60 h-40 rounded-t-sm"></div>
//               <div className="w-5 bg-primary/10/60 h-32 rounded-t-sm"></div>
//               <div className="w-5 bg-primary h-52 rounded-t-sm"></div>
//               <div className="w-5 bg-primary/10/60 h-36 rounded-t-sm"></div>
//               <div className="w-5 bg-primary h-56 rounded-t-sm"></div>
//               <div className="w-5 bg-primary/10/60 h-28 rounded-t-sm"></div>
//               <div className="w-5 bg-primary/10/60 h-44 rounded-t-sm"></div>
//               <div className="w-5 bg-primary h-52 rounded-t-sm"></div>
//               <div className="w-5 bg-primary/10/60 h-36 rounded-t-sm"></div>
//               <div className="w-5 bg-primary/10/60 h-40 rounded-t-sm"></div>
//               <div className="w-5 bg-primary h-48 rounded-t-sm"></div>
//             </div>
//             <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
//               <div className="border-t border-on-surface w-full"></div>
//               <div className="border-t border-on-surface w-full"></div>
//               <div className="border-t border-on-surface w-full"></div>
//               <div className="border-t border-on-surface w-full"></div>
//             </div>
//           </div>
//           <div className="flex justify-between mt-2 text-label-md text-muted-foreground font-mono-data text-[10px]">
//             <span>JAN</span>
//             <span>FEB</span>
//             <span>MAR</span>
//             <span>APR</span>
//             <span>MAY</span>
//             <span>JUN</span>
//             <span>JUL</span>
//             <span>AUG</span>
//             <span>SEP</span>
//             <span>OCT</span>
//             <span>NOV</span>
//             <span>DEC</span>
//           </div>
//         </div>

//         {/* Regional Distribution */}
//         <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col shadow-sm">
//           <div className="p-4 border-b border-border bg-card-container-lowest">
//             <h4 className="font-headline-sm text-headline-sm text-foreground">
//               Regional Distribution
//             </h4>
//           </div>
//           <div className="flex-1 relative bg-card-container-low min-h-[200px]">
//             <Image
//               src="https://lh3.googleusercontent.com/aida-public/AB6AXuBi77GtVj5FN5x_EVLyo1DUi2VpvZvWPcDFesLURIWJ6j-fPZkul_A9bE8ekPpWI4WYsvQPYEk3xOal3skvF9ThFoP6LOlD6lWG9DN7voIBSLgmJgJw3UwTcJ6RvIOEmt92TejFzq_NLDE9n_WmmwFpf1omU8Um211TASxd_5GQkoRS2oOMHTYX8d1hCGZHJ7Zh-i1yLOvv8LXqH_VdBQyqpdC0-9afh3EngVfA9ebi2sSaUYXe0rFG_LBJu7HfAxEIC_K_abO9tHM"
//               alt="Regional Distribution Map"
//               fill
//               className="object-cover"
//               sizes="(max-width: 768px) 100vw, 350px"
//             />
//             <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow border border-border">
//               <p className="font-label-md text-label-md text-primary font-bold">NJ Warehouse</p>
//               <p className="font-mono-data text-body-sm text-[11px]">Capacity: 92%</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Recent Adjustments Table */}
//       <section className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
//         <div className="p-6 border-b border-border flex items-center justify-between">
//           <h4 className="font-headline-sm text-headline-sm text-foreground">
//             Recent Stock Adjustments
//           </h4>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-card-container-low border-b border-border">
//                 <th className="px-6 py-3 font-label-md text-label-md text-muted-foreground uppercase tracking-wider">
//                   Date
//                 </th>
//                 <th className="px-6 py-3 font-label-md text-label-md text-muted-foreground uppercase tracking-wider">
//                   Reference
//                 </th>
//                 <th className="px-6 py-3 font-label-md text-label-md text-muted-foreground uppercase tracking-wider">
//                   Warehouse
//                 </th>
//                 <th className="px-6 py-3 font-label-md text-label-md text-muted-foreground uppercase tracking-wider">
//                   Type
//                 </th>
//                 <th className="px-6 py-3 font-label-md text-label-md text-muted-foreground uppercase tracking-wider text-right">
//                   Qty Change
//                 </th>
//                 <th className="px-6 py-3 font-label-md text-label-md text-muted-foreground uppercase tracking-wider">
//                   Status
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-border bg-card-container-lowest">
//               {adjustments.map((adj) => (
//                 <tr
//                   key={adj.id}
//                   className="hover:bg-card-container-low transition-colors group"
//                 >
//                   <td className="px-6 py-4 font-mono-data text-body-sm text-[12px]">{adj.date}</td>
//                   <td className="px-6 py-4">
//                     <div className="flex flex-col">
//                       <span className="font-semibold text-foreground">{adj.reference}</span>
//                       <span className="text-xs text-muted-foreground">{adj.reason}</span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 text-body-sm text-muted-foreground">
//                     {adj.warehouse}
//                   </td>
//                   <td className="px-6 py-4">
//                     <span
//                       className={cn(
//                         "px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase",
//                         adj.type === "Inbound" && "bg-secondary text-primary",
//                         adj.type === "Write-off" && "bg-tertiary-fixed text-tertiary",
//                         adj.type === "Outbound" && "bg-slate-100 text-slate-700"
//                       )}
//                     >
//                       {adj.type}
//                     </span>
//                   </td>
//                   <td
//                     className={cn(
//                       "px-6 py-4 text-right font-mono-data font-bold",
//                       adj.qtyChange < 0 ? "text-destructive" : "text-foreground"
//                     )}
//                   >
//                     {adj.qtyChange > 0 ? `+${adj.qtyChange}` : adj.qtyChange}
//                   </td>
//                   <td className="px-6 py-4">
//                     <span
//                       className={cn(
//                         "px-2 py-0.5 rounded-full text-[11px] font-bold",
//                         adj.status === "Approved"
//                           ? "bg-green-100 text-green-700"
//                           : "bg-slate-100 text-slate-700"
//                       )}
//                     >
//                       {adj.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </section>

//       {/* Low Stock Alerts & Audit Box */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Reorder Alerts */}
//         <div className="bg-card border border-error/20 rounded-xl overflow-hidden shadow-sm">
//           <div className="bg-destructive/15 p-4 flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <span className="material-symbols-outlined text-destructive">warning</span>
//               <h5 className="font-headline-sm text-headline-sm text-destructive">
//                 Reorder Alerts
//               </h5>
//             </div>
//             <span className="bg-destructive text-white px-2 py-0.5 rounded text-[10px] font-bold">
//               URGENT
//             </span>
//           </div>
//           <div className="p-6 space-y-4 bg-card-container-lowest">
//             {alerts.map((item) => (
//               <div
//                 key={item.sku}
//                 className="flex items-center justify-between border-b border-border/30 pb-3 last:border-none last:pb-0"
//               >
//                 <div className="flex gap-3 items-center">
//                   <div className="w-10 h-10 bg-card-container rounded flex items-center justify-center">
//                     <span className="material-symbols-outlined text-muted-foreground">
//                       {item.icon}
//                     </span>
//                   </div>
//                   <div>
//                     <p className="font-semibold text-foreground text-sm">{item.name}</p>
//                     <p className="text-xs text-muted-foreground font-mono-data">
//                       SKU: {item.sku}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-destructive font-bold font-mono-data text-sm">{item.qtyLeft} left</p>
//                   <p className="text-[10px] text-muted-foreground">Min: {item.minQty}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Audit Callout Box */}
//         <div className="bg-primary/10 text-primary-foreground-container rounded-xl p-6 flex flex-col justify-between relative overflow-hidden group shadow-sm">
//           <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary rounded-full opacity-20 group-hover:scale-125 transition-transform duration-700"></div>
//           <div className="z-10">
//             <h5 className="font-headline-sm text-headline-sm mb-2 text-white">Inventory Audit</h5>
//             <p className="opacity-90 text-body-sm text-surface-variant leading-relaxed">
//               Your last full warehouse audit was 42 days ago. It's time for a routine check-up.
//             </p>
//           </div>
//           <div className="mt-6 z-10">
//             <button
//               onClick={() => alert("Audit started!")}
//               className="w-full bg-white text-primary font-bold py-3 rounded-lg shadow hover:bg-card transition-colors active:scale-98"
//             >
//               Start New Audit
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Add Adjustment Modal */}
//       {showAddAdjustmentModal && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
//             <div className="p-6 border-b border-border flex justify-between items-center bg-card-container-low">
//               <h3 className="font-headline-sm text-headline-sm text-foreground">
//                 New Stock Adjustment
//               </h3>
//               <button
//                 onClick={() => setShowAddAdjustmentModal(false)}
//                 className="material-symbols-outlined p-1 text-muted-foreground hover:bg-card-container rounded transition-colors"
//               >
//                 close
//               </button>
//             </div>
//             <form onSubmit={handleCreateAdjustment} className="p-6 space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
//                     Reference
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-body-md"
//                     value={ref}
//                     onChange={(e) => setRef(e.target.value)}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
//                     Type
//                   </label>
//                   <select
//                     className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-body-md cursor-pointer bg-white"
//                     value={type}
//                     onChange={(e) => setType(e.target.value as any)}
//                   >
//                     <option value="Inbound">Inbound (Stock In)</option>
//                     <option value="Outbound">Outbound (Stock Out)</option>
//                     <option value="Write-off">Write-off (Loss)</option>
//                   </select>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
//                   Reason
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   placeholder="e.g. Inventory Count, Damaged Stock"
//                   className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-body-md"
//                   value={reason}
//                   onChange={(e) => setReason(e.target.value)}
//                 />
//               </div>

//               <div>
//                 <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
//                   Warehouse
//                 </label>
//                 <select
//                   className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-body-md cursor-pointer bg-white"
//                   value={warehouse}
//                   onChange={(e) => setWarehouse(e.target.value)}
//                 >
//                   <option value="North Branch (NJ)">North Branch (NJ)</option>
//                   <option value="Central Hub (TX)">Central Hub (TX)</option>
//                   <option value="West Port (CA)">West Port (CA)</option>
//                 </select>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
//                     Qty Change
//                   </label>
//                   <input
//                     type="number"
//                     required
//                     placeholder="e.g. 50"
//                     className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-body-md"
//                     value={change}
//                     onChange={(e) => setChange(e.target.value)}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
//                     Status
//                   </label>
//                   <select
//                     className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-body-md cursor-pointer bg-white"
//                     value={status}
//                     onChange={(e) => setStatus(e.target.value as any)}
//                   >
//                     <option value="Approved">Approved</option>
//                     <option value="Draft">Draft</option>
//                   </select>
//                 </div>
//               </div>

//               <div className="pt-4 border-t border-border flex justify-end gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setShowAddAdjustmentModal(false)}
//                   className="px-4 py-2 border border-border rounded text-label-md font-label-md text-muted-foreground hover:bg-card-container transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-primary text-primary-foreground rounded text-label-md font-label-md hover:opacity-90 transition-opacity"
//                 >
//                   Record Adjustment
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Plus,
  Search,
  AlertCircle,
  Download,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";

interface Adjustment {
  id: string;
  date: string;
  reference: string;
  reason: string;
  warehouse: string;
  type: "Inbound" | "Outbound" | "Write-off";
  qtyChange: number;
  status: "Approved" | "Draft";
}

interface AlertItem {
  name: string;
  sku: string;
  qtyLeft: number;
  minQty: number;
}

const initialAdjustments: Adjustment[] = [
  {
    id: "1",
    date: "Oct 24, 2024",
    reference: "ADJ-00921",
    reason: "Inventory Count",
    warehouse: "North Branch (NJ)",
    type: "Inbound",
    qtyChange: 150,
    status: "Approved",
  },
  {
    id: "2",
    date: "Oct 23, 2024",
    reference: "ADJ-00845",
    reason: "Damaged Goods",
    warehouse: "Central Hub (TX)",
    type: "Write-off",
    qtyChange: -12,
    status: "Approved",
  },
  {
    id: "3",
    date: "Oct 22, 2024",
    reference: "ADJ-00812",
    reason: "Transfer Out",
    warehouse: "West Port (CA)",
    type: "Outbound",
    qtyChange: -45,
    status: "Draft",
  },
  {
    id: "4",
    date: "Oct 21, 2024",
    reference: "ADJ-00800",
    reason: "Restock",
    warehouse: "North Branch (NJ)",
    type: "Inbound",
    qtyChange: 320,
    status: "Approved",
  },
];

const initialAlertItems: AlertItem[] = [
  {
    name: "Quantum Theory (Hardcover)",
    sku: "QNT-HB-002",
    qtyLeft: 3,
    minQty: 20,
  },
  {
    name: "Data Structures 101",
    sku: "DS101-PB",
    qtyLeft: 8,
    minQty: 50,
  },
];

export default function Inventory() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>(initialAdjustments);
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlertItems);
  const [showAddAdjustmentModal, setShowAddAdjustmentModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [ref, setRef] = useState("ADJ-00922");
  const [reason, setReason] = useState("Inventory Count");
  const [warehouse, setWarehouse] = useState("North Branch (NJ)");
  const [type, setType] = useState<Adjustment["type"]>("Inbound");
  const [change, setChange] = useState("");
  const [status, setStatus] = useState<Adjustment["status"]>("Approved");

  const handleCreateAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!change) return;

    const newChange = parseInt(change);
    const newAdj: Adjustment = {
      id: String(adjustments.length + 1),
      date: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      reference: ref,
      reason,
      warehouse,
      type,
      qtyChange: type === "Inbound" ? Math.abs(newChange) : -Math.abs(newChange),
      status,
    };

    setAdjustments([newAdj, ...adjustments]);
    setShowAddAdjustmentModal(false);
    setChange("");
    setReason("Inventory Count");
  };

  const filteredAdjustments = adjustments.filter(
    (adj) =>
      adj.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adj.warehouse.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
      <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">
              Inventory Dashboard
            </h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">
              Real-time stock valuation and warehouse health
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-1.5 bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 text-[13px] font-medium px-3 py-2 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>

            <button
              onClick={() => setShowAddAdjustmentModal(true)}
              className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Adjustment
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[13px] font-medium text-zinc-500">Total Products</p>
              <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                +12%
              </span>
            </div>
            <h3 className="text-[26px] font-semibold text-zinc-900 tabular-nums tracking-tight">
              4,821
            </h3>
            <div className="mt-3 h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-3/4"></div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[13px] font-medium text-zinc-500">Stock Value</p>
              <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                Stable
              </span>
            </div>
            <h3 className="text-[26px] font-semibold text-zinc-900 tabular-nums tracking-tight">
              $1.24M
            </h3>
            <p className="text-[11px] text-zinc-500 mt-3">Valuation: Current Market</p>
          </div>

          <div className="bg-white border border-red-200/80 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[13px] font-medium text-zinc-500">Low Stock Items</p>
              <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-red-50 text-red-700">
                Action Required
              </span>
            </div>
            <h3 className="text-[26px] font-semibold text-red-600 tabular-nums tracking-tight">
              {alerts.length} Items
            </h3>
            <p className="text-[11px] text-red-600 mt-3 font-medium cursor-pointer hover:underline">
              View Reorder List
            </p>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200">
            <p className="text-[13px] font-medium text-zinc-500 mb-3">Active Warehouses</p>
            <h3 className="text-[26px] font-semibold text-zinc-900 tabular-nums tracking-tight">
              08 Units
            </h3>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full border border-white bg-slate-300"></div>
                <div className="w-6 h-6 rounded-full border border-white bg-slate-400"></div>
                <div className="w-6 h-6 rounded-full border border-white bg-slate-500"></div>
              </div>
              <span className="text-[11px] text-zinc-500">+5 Regions</span>
            </div>
          </div>
        </div>

        {/* Chart and Alert Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Flow Chart Placeholder */}
          <div className="lg:col-span-2 bg-white border border-zinc-200/80 rounded-xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[14px] font-semibold text-zinc-900">Inventory Flow</h2>
                <p className="text-[12px] text-zinc-500">Stock in vs Stock out</p>
              </div>
              <div className="flex items-center gap-4 text-[12px] text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Stock-in
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-300" />
                  Stock-out
                </span>
              </div>
            </div>
            <div className="h-48 flex items-end justify-between gap-2 px-4 border-b border-zinc-200">
              {[28, 40, 32, 52, 36, 56, 28, 44, 52, 36, 40, 48].map((h, i) => (
                <div key={i} className="flex-1 flex items-end justify-center gap-1">
                  <div
                    className="w-2 bg-blue-500 rounded-t-sm transition-all"
                    style={{ height: `${h}px` }}
                  />
                  <div
                    className="w-2 bg-zinc-300 rounded-t-sm transition-all"
                    style={{ height: `${Math.random() * h}px` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-zinc-400 px-4">
              <span>JAN</span>
              <span>FEB</span>
              <span>MAR</span>
              <span>APR</span>
              <span>MAY</span>
              <span>JUN</span>
              <span>JUL</span>
              <span>AUG</span>
              <span>SEP</span>
              <span>OCT</span>
              <span>NOV</span>
              <span>DEC</span>
            </div>
          </div>

          {/* Regional Distribution */}
          <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50">
              <h2 className="text-[14px] font-semibold text-zinc-900">
                Regional Distribution
              </h2>
            </div>
            <div className="relative h-56 bg-zinc-50">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBi77GtVj5FN5x_EVLyo1DUi2VpvZvWPcDFesLURIWJ6j-fPZkul_A9bE8ekPpWI4WYsvQPYEk3xOal3skvF9ThFoP6LOlD6lWG9DN7voIBSLgmJgJw3UwTcJ6RvIOEmt92TejFzq_NLDE9n_WmmwFpf1omU8Um211TASxd_5GQkoRS2oOMHTYX8d1hCGZHJ7Zh-i1yLOvv8LXqH_VdBQyqpdC0-9afh3EngVfA9ebi2sSaUYXe0rFG_LBJu7HfAxEIC_K_abO9tHM"
                alt="Regional Distribution Map"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-sm border border-zinc-200">
                <p className="text-[12px] font-semibold text-zinc-900">NJ Warehouse</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Capacity: 92%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Adjustments Table */}
        <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[14px] font-semibold text-zinc-900">
                Recent Stock Adjustments
              </h2>
              <p className="text-[12px] text-zinc-500">
                {filteredAdjustments.length} adjustment{filteredAdjustments.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search adjustments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100">
                {["Date", "Reference", "Warehouse", "Type", "Qty Change", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredAdjustments.map((adj) => (
                <tr key={adj.id} className="hover:bg-zinc-50/70 transition-colors cursor-pointer">
                  <td className="px-6 py-3 text-[13px] text-zinc-500">{adj.date}</td>
                  <td className="px-6 py-3">
                    <div>
                      <p className="text-[13px] font-medium text-zinc-900">{adj.reference}</p>
                      <p className="text-[11px] text-zinc-500">{adj.reason}</p>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-[13px] text-zinc-600">{adj.warehouse}</td>
                  <td className="px-6 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full",
                        adj.type === "Inbound" && "bg-blue-50 text-blue-700",
                        adj.type === "Outbound" && "bg-slate-100 text-slate-700",
                        adj.type === "Write-off" && "bg-red-50 text-red-700"
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          adj.type === "Inbound" && "bg-blue-500",
                          adj.type === "Outbound" && "bg-slate-400",
                          adj.type === "Write-off" && "bg-red-500"
                        )}
                      />
                      {adj.type}
                    </span>
                  </td>
                  <td
                    className={cn(
                      "px-6 py-3 text-[13px] font-mono font-medium tabular-nums",
                      adj.qtyChange < 0 ? "text-red-600" : "text-zinc-900"
                    )}
                  >
                    {adj.qtyChange > 0 ? `+${adj.qtyChange}` : adj.qtyChange}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center text-[12px] font-medium px-2 py-1 rounded-full",
                        adj.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      )}
                    >
                      {adj.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredAdjustments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[13px] text-zinc-400">
                    No adjustments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Low Stock Alerts & Audit Box */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Low Stock Alerts */}
          <div className="bg-white border border-red-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="px-6 py-4 border-b border-red-200 bg-red-50 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h2 className="text-[14px] font-semibold text-red-900">Reorder Alerts</h2>
              <span className="ml-auto text-[11px] font-medium px-2 py-1 rounded-full bg-red-600 text-white">
                URGENT
              </span>
            </div>
            <div className="p-6 space-y-4">
              {alerts.map((item) => (
                <div key={item.sku} className="flex items-center justify-between pb-3 border-b border-zinc-100 last:pb-0 last:border-0">
                  <div>
                    <p className="text-[13px] font-medium text-zinc-900">{item.name}</p>
                    <p className="text-[11px] text-zinc-500">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold text-red-600">{item.qtyLeft} left</p>
                    <p className="text-[11px] text-zinc-500">Min: {item.minQty}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Callout */}
          <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-400 rounded-full opacity-10 group-hover:scale-125 transition-transform duration-700"></div>
            <div className="relative z-10">
              <h2 className="text-[14px] font-semibold text-blue-900 mb-2">Inventory Audit</h2>
              <p className="text-[13px] text-blue-800 leading-relaxed mb-4">
                Your last full warehouse audit was 42 days ago. It's time for a routine check-up.
              </p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium py-2.5 rounded-lg transition-colors">
                Start New Audit
              </button>
            </div>
          </div>
        </div>

        {/* Add Adjustment Modal */}
        {showAddAdjustmentModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-zinc-200/80 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                <h3 className="text-[14px] font-semibold text-zinc-900">
                  New Stock Adjustment
                </h3>
                <button
                  onClick={() => setShowAddAdjustmentModal(false)}
                  className="text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAdjustment} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                      Reference
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={ref}
                      onChange={(e) => setRef(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                      Type
                    </label>
                    <select
                      className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white cursor-pointer"
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                    >
                      <option value="Inbound">Inbound</option>
                      <option value="Outbound">Outbound</option>
                      <option value="Write-off">Write-off</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Reason
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Inventory Count"
                    className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Warehouse
                  </label>
                  <select
                    className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white cursor-pointer"
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                  >
                    <option value="North Branch (NJ)">North Branch (NJ)</option>
                    <option value="Central Hub (TX)">Central Hub (TX)</option>
                    <option value="West Port (CA)">West Port (CA)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                      Qty Change
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="50"
                      className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={change}
                      onChange={(e) => setChange(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                      Status
                    </label>
                    <select
                      className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white cursor-pointer"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                    >
                      <option value="Approved">Approved</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddAdjustmentModal(false)}
                    className="px-4 py-2 text-[13px] font-medium text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Record Adjustment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
