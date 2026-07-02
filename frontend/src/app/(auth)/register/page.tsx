"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  User,
  Mail,
  Lock,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ChevronDown,
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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("http://localhost:8888/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed. Try again.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Unable to connect to the registration server.");
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-[24px] font-bold text-zinc-900 tracking-tight">Create Account</h1>
            <p className="text-[13px] text-zinc-500 mt-1">Register a new role-based user for DemandERP Suite.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200/50 text-red-700 text-[12px] rounded-xl p-3.5 flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200/50 text-emerald-700 text-[12px] rounded-xl p-3.5 flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-600" />
              <span>Account created successfully! Redirecting to login...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4.5 h-4.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-[13px] bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all text-zinc-800 placeholder:text-zinc-400"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4.5 h-4.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-[13px] bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all text-zinc-800 placeholder:text-zinc-400"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4.5 h-4.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-[13px] bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all text-zinc-800 placeholder:text-zinc-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Assign Role */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                Assign System Role
              </label>
              <div className="relative">
                <Shield className="w-4.5 h-4.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-[13px] bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all text-zinc-800 cursor-pointer appearance-none"
                >
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN">Administrator</option>
                </select>
                <ChevronDown className="w-4.5 h-4.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-[13px] rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md shadow-zinc-900/10 disabled:opacity-50"
            >
              {loading ? "Registering..." : "Create Account"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

          </form>

          {/* Sign In Redirect */}
          <div className="pt-4 border-t border-zinc-100 flex flex-col items-center gap-2">
            <p className="text-[12px] text-zinc-500">
              Already have an account?{" "}
              <Link href="/login" className="text-[#5B5FEF] font-bold hover:underline">
                Sign In
              </Link>
            </p>
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

// ---------------------------------------------------------------------------
// Fallback Icon component
// ---------------------------------------------------------------------------
function AlertCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
