"use client";

import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(220,38,38,0.15),rgba(255,255,255,0))] px-4 text-center">
      <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-2">
          <span className="material-symbols-outlined text-3xl font-bold">
            gpp_bad
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Access Denied
          </h1>
          <p className="text-sm text-slate-400">
            You do not have the required permissions to access this page. Please contact your system administrator if you believe this is an error.
          </p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <Link
            href="/"
            className="w-full py-2.5 bg-primary text-on-primary font-bold text-sm rounded-xl hover:bg-primary/95 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            Return to Dashboard
          </Link>
          
          <button
            onClick={() => {
              // Trigger clear sessions and logout
              document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
            className="w-full py-2 bg-slate-950/40 hover:bg-slate-950/80 text-slate-400 font-bold text-xs rounded-xl border border-slate-800 transition-all uppercase tracking-wider"
          >
            Sign in as Different User
          </button>
        </div>
      </div>
    </div>
  );
}
