"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setSuccess(false);
      setMessage("No verification token found in the URL.");
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch("http://localhost:8888/api/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess(true);
          setMessage(data.message || "Email verified successfully!");
        } else {
          setSuccess(false);
          setMessage(data.message || "Verification failed. Token may be expired or invalid.");
        }
      } catch (err: any) {
        setSuccess(false);
        setMessage("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 text-slate-400 py-8">
        <span className="material-symbols-outlined text-[48px] animate-spin">sync</span>
        <p>Verifying your email...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-6 text-center">
      {success ? (
        <>
          <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px]">check_circle</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Verified!</h2>
            <p className="text-sm text-slate-400">{message}</p>
          </div>
          <Link href="/login" className="w-full mt-2 py-2.5 bg-primary text-on-primary font-bold text-sm rounded-xl hover:bg-primary/95 transition-all flex items-center justify-center shadow-lg shadow-primary/20">
            Continue to Login
          </Link>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px]">error</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Verification Failed</h2>
            <p className="text-sm text-slate-400">{message}</p>
          </div>
          <Link href="/login" className="mt-2 text-primary text-sm font-semibold hover:underline">
            Back to Login
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(67,56,202,0.22),rgba(255,255,255,0))] px-4">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Suspense fallback={<div className="text-center text-slate-400">Loading...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
