"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type LoginResponse = {
  success: boolean;
  message?: string;
  otpRequired?: boolean;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = (await res.json()) as LoginResponse;

      if (!res.ok || !result.success) {
        setError(result.message ?? "Login failed");
        return;
      }

      if (result.otpRequired) {
        const params = new URLSearchParams({ email });
        router.push(`/admin/mfa?${params.toString()}`);
        return;
      }

      setError("OTP step was not triggered");
    } catch {
      setError("Unable to login right now");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-6 bg-cream-warm">
      <div className="w-full max-w-md rounded-2xl border border-navy-ink/10 bg-card p-6 shadow-(--shadow-soft)">
        <h1 className="text-2xl font-bold text-navy-ink">Admin Login</h1>
        <p className="mt-1 text-sm text-navy-ink/70">Sign in with email and password.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-navy-ink" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-navy-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-amber-brand"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-navy-ink" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-navy-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-amber-brand"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-navy-ink px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Continue"}
          </button>
        </form>
      </div>
    </main>
  );
}
