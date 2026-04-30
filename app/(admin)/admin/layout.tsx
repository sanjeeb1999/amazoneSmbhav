"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronLeft,
  FileText,
  Folder,
  Gauge,
  Images,
  Newspaper,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

type MeResponse = {
  success: boolean;
  data?: {
    _id: string;
    email: string;
    role: "admin" | "user";
  };
};

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/mfa"]);
const WORKSPACE_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: Gauge },
  { label: "Banner", href: "/admin/banner", icon: Images },
  { label: "Portfolio", href: "/admin/portfolio", icon: Folder },
  { label: "Team", href: "/admin/team", icon: Users },
  { label: "News & Events", href: "/admin/news", icon: Newspaper },
  { label: "Settings", href: "/admin/settings", icon: Settings },
] as const;

const SYSTEM_ITEMS = [{ label: "Users & Roles", href: "/admin/users", icon: ShieldCheck }] as const;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [currentUser, setCurrentUser] = useState<MeResponse["data"] | null>(null);
  const isPublicPath = PUBLIC_ADMIN_PATHS.has(pathname);
  const sessionVerifiedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      if (PUBLIC_ADMIN_PATHS.has(pathname)) {
        if (!cancelled) setChecking(false);
        return;
      }

      // Avoid re-checking auth on every admin route transition once verified.
      if (sessionVerifiedRef.current) {
        if (!cancelled) {
          setChecking(false);
        }
        return;
      }

      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const result = (await res.json()) as MeResponse;

        if (!res.ok || !result.success || !result.data) {
          router.replace("/admin/login");
          return;
        }

        sessionVerifiedRef.current = true;
        if (!cancelled) {
          setCurrentUser(result.data);
          setChecking(false);
        }
      } catch {
        router.replace("/admin/login");
      }
    }

    setChecking(true);
    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (checking) {
    return (
      <main className="min-h-dvh flex items-center justify-center p-6">
        <p className="text-sm text-navy-ink/70">Checking admin session...</p>
      </main>
    );
  }

  if (isPublicPath) return <>{children}</>;

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-dvh bg-cream-warm text-navy-ink">
      <div className="mx-auto flex min-h-dvh max-w-[1440px]">
        <aside className="flex w-64 shrink-0 flex-col border-r border-navy-ink/10 bg-white p-3">
          <div className="rounded-2xl border border-navy-ink/10 bg-cream-warm/70 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-r from-amber-brand to-gold-deep text-xs font-bold text-white">
                  AS
                </span>
                <div>
                  <h2 className="text-base font-bold leading-tight text-navy-ink">ASVF Admin</h2>
                  <p className="text-[10px] tracking-[0.16em] text-navy-ink/55">CONSOLE</p>
                </div>
              </div>
              {/* <button
                type="button"
                className="rounded-md p-1.5 text-navy-ink/45 transition hover:bg-white hover:text-navy-ink"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button> */}
            </div>
          </div>

          <div className="mt-4 flex min-h-0 flex-1 flex-col">
            <div>
              <p className="px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-navy-ink/45">
                Workspace
              </p>
              <nav className="mt-2 space-y-1">
                {WORKSPACE_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-linear-to-r from-amber-brand/20 to-gold-deep/15 text-navy-ink shadow-sm"
                          : "text-navy-ink/80 hover:bg-navy-ink/5 hover:text-navy-ink"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="mt-5">
              <p className="px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-navy-ink/45">
                System
              </p>
              <div className="mt-2 space-y-1">
                {/* <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-navy-ink/50">
                  <FileText className="h-4 w-4" />
                  Pages
                </div> */}
                <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-navy-ink/50">
                  <Images className="h-4 w-4" />
                  Media Library
                </div>
                {SYSTEM_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-linear-to-r from-amber-brand/20 to-gold-deep/15 text-navy-ink shadow-sm"
                          : "text-navy-ink/80 hover:bg-navy-ink/5 hover:text-navy-ink"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-2 border-t border-navy-ink/10 pt-3">
            <div className="rounded-xl border border-navy-ink/10 bg-cream-warm/60 p-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-r from-amber-brand to-gold-deep text-xs font-bold text-white">
                  AD
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-navy-ink">
                    {currentUser?.role === "admin" ? "Admin" : "User"}
                  </p>
                  <p className="truncate text-xs text-navy-ink/55">
                    {currentUser?.email ?? "Signed in"}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-ink/15 bg-white px-4 py-2.5 text-sm font-semibold text-navy-ink transition hover:bg-cream-warm"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
