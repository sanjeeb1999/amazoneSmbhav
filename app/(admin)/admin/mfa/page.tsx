"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type OtpApiResponse = {
  success: boolean;
  message?: string;
};

export default function AdminMfaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = useMemo(() => searchParams.get("email")?.trim() ?? "", [searchParams]);
  const otpInputRef = useRef<HTMLInputElement | null>(null);

  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    otpInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;

    const intervalId = window.setInterval(() => {
      setTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [timer]);

  function getErrorMessage(message?: string) {
    const normalized = message?.toLowerCase() ?? "";
    if (normalized.includes("expired")) return "OTP expired. Please request a new code.";
    if (normalized.includes("invalid")) return "Invalid OTP. Please check and try again.";
    if (normalized.includes("wait")) return message ?? "Please wait before resending OTP.";
    return message ?? "OTP verification failed";
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email) {
      setError("Missing email. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: token }),
      });

      const result = (await res.json()) as OtpApiResponse;
      if (!res.ok || !result.success) {
        setError(getErrorMessage(result.message));
        return;
      }

      router.replace("/admin/dashboard");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onResendOtp() {
    if (!email || timer > 0 || resending) return;

    setError("");
    setResending(true);

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = (await res.json()) as OtpApiResponse;
      if (!res.ok || !result.success) {
        setError(getErrorMessage(result.message));
        return;
      }

      setTimer(30);
    } catch {
      setError("Network error. Unable to resend OTP right now.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-6 bg-cream-warm">
      <div className="w-full max-w-md rounded-2xl border border-navy-ink/10 bg-card p-6 shadow-(--shadow-soft)">
        <h1 className="text-2xl font-bold text-navy-ink">Verify OTP</h1>
        <p className="mt-1 text-sm text-navy-ink/70">
          Enter the 6-digit code sent to your email.
        </p>
        {email && (
          <p className="mt-1 text-xs text-navy-ink/60">
            Signing in as: <span className="font-medium">{email}</span>
          </p>
        )}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-navy-ink" htmlFor="otp">
              OTP Code
            </label>
            <input
              id="otp"
              ref={otpInputRef}
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={token}
              onChange={(e) => {
                setError("");
                setToken(e.target.value.replace(/\D/g, "").slice(0, 6));
              }}
              required
              className="w-full rounded-lg border border-navy-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-amber-brand"
              placeholder="123456"
              autoComplete="one-time-code"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onResendOtp}
              disabled={timer > 0 || resending || loading}
              className="text-sm font-medium text-gold-deep disabled:cursor-not-allowed disabled:text-navy-ink/45"
            >
              {resending ? "Resending..." : "Resend OTP"}
            </button>
            {timer > 0 && <p className="text-xs text-navy-ink/60">Resend in {timer}s</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-navy-ink px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>
      </div>
    </main>
  );
}
