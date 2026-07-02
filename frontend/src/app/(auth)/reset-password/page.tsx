"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Lock,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Key,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const chartData = [
  { value: 120 },
  { value: 180 },
  { value: 160 },
  { value: 250 },
  { value: 210 },
  { value: 340 },
  { value: 300 },
  { value: 420 },
];

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("http://localhost:8888/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }

      setMessage(data.message || "Password reset successfully.");
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200/50 text-red-700 text-[12px] rounded-xl p-3.5 flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {message ? (
        <div className="bg-emerald-50 border border-emerald-200/50 text-emerald-700 text-[13px] rounded-2xl p-5 flex flex-col items-center gap-3 animate-in fade-in duration-200 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          <span className="font-semibold text-zinc-900">{message}</span>
          <Link
            href="/login"
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-[12px] rounded-lg transition-colors shadow-sm"
          >
            Log In Now
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4.5 h-4.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!token}
                className="w-full pl-10 pr-4 py-2.5 text-[13px] bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all text-zinc-800 placeholder:text-zinc-400 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4.5 h-4.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!token}
                className="w-full pl-10 pr-4 py-2.5 text-[13px] bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all text-zinc-800 placeholder:text-zinc-400 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !token}
            className="w-full mt-2 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-[13px] rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md shadow-zinc-900/10 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  const [typedIndex, setTypedIndex] = useState(0);

  const testimonials = [
    { title: "Consolidated Bookkeeping", desc: "Manage manual journals, Chart of Accounts, and ledger locking seamlessly.", icon: <ShieldCheck className="w-5 h-5 text-indigo-400" /> },
    { title: "Atomic Inventory Controls", desc: "Instantly adjust quantities and track item categories with automated status triggers.", icon: <Zap className="w-5 h-5 text-amber-400" /> },
    { title: "Intelligent Collection Stats", desc: "View real-time receivables, payment receipts, and tax calculations.", icon: <TrendingUp className="w-5 h-5 text-emerald-400" /> }
  ];

  // Micro-rotation loop for testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setTypedIndex((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex bg-white font-sans antialiased">
      
      {/* LEFT SIDE: Clean Auth form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 md:px-20 lg:px-24 xl:px-28 py-12 max-w-xl md:max-w-none">
        
        <div className="w-full max-w-sm mx-auto space-y-8">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-md shadow-zinc-900/10">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <span className="font-bold text-[17px] text-zinc-900 tracking-tight">DemandBooks</span>
          </div>

          <div>
            <h1 className="text-[24px] font-bold text-zinc-900 tracking-tight">Create New Password</h1>
            <p className="text-[13px] text-zinc-500 mt-1">Choose a strong, secure password for your account.</p>
          </div>

          <Suspense fallback={<div className="text-center text-[13px] text-zinc-500 py-6">Loading request parameters...</div>}>
            <ResetPasswordForm />
          </Suspense>

          {/* Back to Login Link */}
          <div className="pt-4 border-t border-zinc-100 flex flex-col items-center gap-2">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-800 transition-colors font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Login
            </Link>
          </div>

        </div>

      </div>

      {/* RIGHT SIDE: Glowing Features Showcase Panel */}
      <div className="hidden md:flex flex-1 bg-zinc-950 relative overflow-hidden items-center justify-center p-12 select-none border-l border-zinc-900/50">
        
        {/* Soft atmospheric gradients */}
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(91,95,239,0.08)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(255,180,0,0.04)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />

        <div className="w-full max-w-[480px] space-y-12 relative z-10">
          
          {/* Floating dashboard mock visual */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Store Revenue</p>
                <p className="text-[20px] font-bold text-white tracking-tight mt-0.5">₹12,49,200.00</p>
              </div>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                +14.2%
              </span>
            </div>

            {/* Live custom AreaChart */}
            <div className="h-28 w-full -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5B5FEF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#5B5FEF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#5B5FEF"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-800/50 pt-3">
              <span>Weekly Invoicing Logs</span>
              <span className="font-mono text-zinc-400">Synced: Just Now</span>
            </div>

          </div>

          {/* Testimonial slider / Dynamic features layout */}
          <div className="space-y-4 min-h-[100px] transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800">
                {testimonials[typedIndex].icon}
              </div>
              <h3 className="font-semibold text-[15px] text-white tracking-tight">
                {testimonials[typedIndex].title}
              </h3>
            </div>
            <p className="text-[13px] text-zinc-400 leading-relaxed pl-12">
              {testimonials[typedIndex].desc}
            </p>
          </div>

          {/* Progress Indicator dots */}
          <div className="flex gap-1.5 pl-12">
            {testimonials.map((_, i) => (
              <span
                key={i}
                onClick={() => setTypedIndex(i)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full cursor-pointer transition-all",
                  i === typedIndex ? "bg-[#5B5FEF] w-4" : "bg-zinc-700 hover:bg-zinc-500"
                )}
              />
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
