"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("http://localhost:8888/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to process request.");
      }

      setMessage(data.message || "If the email matches an active account, a password reset link will be sent.");
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(67,56,202,0.22),rgba(255,255,255,0))] px-4">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary-container flex items-center justify-center shadow-lg shadow-primary/20 mb-3">
            <span className="material-symbols-outlined text-primary-foreground text-2xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
              lock_reset
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Reset Password
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enter your email to receive a reset link.
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col gap-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3 flex items-start gap-2.5 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">warning</span>
              <span>{error}</span>
            </div>
          )}

          {message ? (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl p-3 flex flex-col items-center gap-2.5 animate-in fade-in duration-200 text-center">
              <span className="material-symbols-outlined text-[32px] mt-2">mark_email_read</span>
              <span className="font-semibold">{message}</span>
              <p className="mt-2 text-slate-400 text-[11px]">Please check your inbox and spam folder.</p>
              <Link href="/login" className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/60 text-sm text-white placeholder:text-slate-600 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary/95 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

          <div className="border-t border-slate-800/80 pt-4 flex flex-col items-center gap-2.5">
            <Link href="/login" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
