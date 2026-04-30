"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Briefcase,
  FileText,
  Newspaper,
  Plus,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

type PortfolioItem = {
  _id: string;
  title: string;
  createdAt?: string;
};

type TeamMember = {
  _id: string;
  name: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
};

type NewsItem = {
  _id: string;
  title: string;
  date: string;
  createdAt?: string;
};

type UserItem = {
  _id: string;
  email: string;
  role: "admin" | "user";
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

type ActivityItem = {
  id: string;
  label: string;
  detail: string;
  timestamp: number;
  tone: "blue" | "green" | "amber";
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [canViewUsers, setCanViewUsers] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardData() {
      setLoading(true);
      setError("");

      try {
        const [portfolioRes, teamRes, newsRes, usersRes] = await Promise.all([
          fetch("/api/portfolio", { cache: "no-store" }),
          fetch("/api/team", { cache: "no-store" }),
          fetch("/api/news", { cache: "no-store" }),
          fetch("/api/users", { cache: "no-store" }),
        ]);

        const [portfolioJson, teamJson, newsJson, usersJson] = (await Promise.all([
          portfolioRes.json(),
          teamRes.json(),
          newsRes.json(),
          usersRes.json(),
        ])) as [
          ApiResponse<PortfolioItem[]>,
          ApiResponse<TeamMember[]>,
          ApiResponse<NewsItem[]>,
          ApiResponse<UserItem[]>,
        ];

        if (cancelled) return;

        if (!portfolioRes.ok || !portfolioJson.success) {
          throw new Error(portfolioJson.message ?? "Failed to load portfolio data");
        }
        if (!teamRes.ok || !teamJson.success) {
          throw new Error(teamJson.message ?? "Failed to load team data");
        }
        if (!newsRes.ok || !newsJson.success) {
          throw new Error(newsJson.message ?? "Failed to load news data");
        }
        setPortfolio(Array.isArray(portfolioJson.data) ? portfolioJson.data : []);
        setTeam(Array.isArray(teamJson.data) ? teamJson.data : []);
        setNews(Array.isArray(newsJson.data) ? newsJson.data : []);
        if (usersRes.ok && usersJson.success) {
          setUsers(Array.isArray(usersJson.data) ? usersJson.data : []);
          setCanViewUsers(true);
        } else {
          // /api/users is admin-only; keep dashboard usable for non-admin users.
          setUsers([]);
          setCanViewUsers(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      cancelled = true;
    };
  }, []);

  const adminCount = useMemo(() => users.filter((user) => user.role === "admin").length, [users]);
  const memberCount = team.length;
  const newsCount = news.length;
  const portfolioCount = portfolio.length;
  const totalPages = 4;

  const recentActivity = useMemo<ActivityItem[]>(() => {
    const fromNews = news.slice(0, 3).map((item) => ({
      id: `news-${item._id}`,
      label: "News published",
      detail: item.title,
      timestamp: new Date(item.date || item.createdAt || Date.now()).getTime(),
      tone: "blue" as const,
    }));

    const fromTeam = team.slice(0, 3).map((item) => ({
      id: `team-${item._id}`,
      label: "Team member updated",
      detail: item.name,
      timestamp: new Date(item.updatedAt || item.createdAt || Date.now()).getTime(),
      tone: "green" as const,
    }));

    const fromPortfolio = portfolio.slice(0, 3).map((item) => ({
      id: `portfolio-${item._id}`,
      label: "Portfolio updated",
      detail: item.title,
      timestamp: new Date(item.createdAt || Date.now()).getTime(),
      tone: "amber" as const,
    }));

    return [...fromNews, ...fromTeam, ...fromPortfolio]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 6);
  }, [news, portfolio, team]);

  function formatCompactDate(timestamp: number) {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  }

  const statCards = [
    {
      label: "Total Pages",
      value: loading ? "-" : String(totalPages),
      trend: "+2 this month",
      icon: FileText,
      iconClass: "bg-violet-100 text-violet-700",
      glowClass: "from-violet-500/15 to-indigo-500/5",
    },
    {
      label: "Portfolio Items",
      value: loading ? "-" : String(portfolioCount),
      trend: `${Math.max(portfolioCount - 3, 0)} added`,
      icon: Briefcase,
      iconClass: "bg-cyan-100 text-cyan-700",
      glowClass: "from-cyan-500/15 to-sky-500/5",
    },
    {
      label: "Team Members",
      value: loading ? "-" : String(memberCount),
      trend: `${memberCount > 0 ? "Stable" : "Add first member"}`,
      icon: Users,
      iconClass: "bg-emerald-100 text-emerald-700",
      glowClass: "from-emerald-500/15 to-green-500/5",
    },
    {
      label: "News & Events",
      value: loading ? "-" : String(newsCount),
      trend: `${newsCount > 0 ? "Live updates" : "No updates yet"}`,
      icon: Newspaper,
      iconClass: "bg-amber-100 text-amber-700",
      glowClass: "from-amber-500/15 to-orange-500/5",
    },
  ];

  return (
    <main className="min-h-dvh bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-50/60 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">Manage your content with style and speed</p>
          </div>
          <Link
            href="/admin/news"
            className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-brand to-gold-deep px-4 py-2.5 text-sm font-semibold text-white shadow-(--shadow-amber) transition hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            New post
          </Link>
        </header>

        <section className="relative overflow-hidden rounded-3xl border border-amber-brand/35 bg-cream-warm p-7 text-navy-ink shadow-(--shadow-soft)">
          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-amber-brand/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-gold-deep/15 blur-3xl" />
          <span
            className="inline-flex items-center gap-1 rounded-full border border-navy-ink/20 bg-white/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-ink backdrop-blur-sm"
          >
            <TrendingUp className="h-3 w-3" />
            Performance up
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-ink md:text-4xl">
            Good to see you, Admin 👋
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-navy-ink/80 md:text-base">
            Here&apos;s a snapshot of your CMS activity. Everything is healthy and ready to publish.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-amber-brand/35 bg-white/80 px-3 py-2 text-sm text-navy-ink backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span>{loading ? "Syncing dashboard..." : "All systems synced"}</span>
          </div>
        </section>

        {error && (
          <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
            {error}
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.label}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.glowClass} opacity-0 transition group-hover:opacity-100`} />
                <div className="relative">
                  <div
                    className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${card.iconClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-3xl font-black text-slate-900">{card.value}</p>
                  <p className="mt-1 text-sm font-medium text-slate-600">{card.label}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{card.trend}</p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <article className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm xl:col-span-2">
            <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
            <p className="text-sm text-slate-600">Most common workflows</p>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <Link
                href="/admin/portfolio"
                className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
              >
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700">
                  <Briefcase className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-slate-900">Add Portfolio</p>
                <p className="mt-1 text-xs text-slate-600">New investment</p>
                <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
                  Open <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </p>
              </Link>
              <Link
                href="/admin/news"
                className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
              >
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <Newspaper className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-slate-900">Publish News</p>
                <p className="mt-1 text-xs text-slate-600">Announcement or event</p>
                <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
                  Open <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </p>
              </Link>
              <Link
                href="/admin/team"
                className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
              >
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <UserPlus className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-slate-900">Invite Member</p>
                <p className="mt-1 text-xs text-slate-600">Add to team page</p>
                <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
                  Open <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </p>
              </Link>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
            <p className="text-sm text-slate-600">Latest events</p>

            <div className="mt-4 space-y-3">
              {loading ? (
                <p className="text-sm text-slate-600">Loading activity...</p>
              ) : recentActivity.length === 0 ? (
                <p className="text-sm text-slate-600">No recent activity found.</p>
              ) : (
                recentActivity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3"
                  >
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 rounded-full ${
                        item.tone === "blue"
                          ? "bg-blue-500"
                          : item.tone === "green"
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {item.label} - {item.detail}
                      </p>
                      <p className="text-xs text-slate-500">{formatCompactDate(item.timestamp)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        <footer className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-600">
              {canViewUsers
                ? loading
                  ? "Loading users..."
                  : `${users.length} total users, ${adminCount} admin accounts`
                : "User stats are visible to admins only."}
            </p>
            {canViewUsers && (
              <Link
                href="/admin/users"
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Manage users
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </footer>
      </div>
    </main>
  );
}
