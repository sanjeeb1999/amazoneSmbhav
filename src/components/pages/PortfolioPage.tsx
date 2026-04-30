"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/shared/layout/SiteHeader";
import { SiteFooter } from "@/shared/layout/SiteFooter";
import portfolioAiImage from "@/assets/portfolio-ai.jpg";
import portfolioGridImage from "@/assets/portfolio-grid.jpg";
import portfolioOfficeImage from "@/assets/portfolio-office.jpg";

type PortfolioCompany = {
  _id: string;
  name: string;
  logo: string;
  description: string;
  sector: string;
  website: string;
};

const portfolioSeed: PortfolioCompany[] = [
  {
    _id: "p1",
    name: "NovaIQ",
    logo: portfolioAiImage.src,
    description: "Applied AI stack for enterprise automation.",
    sector: "AI",
    website: "#",
  },
  {
    _id: "p2",
    name: "AetherGrid",
    logo: portfolioGridImage.src,
    description: "Resilient cloud infrastructure for high-growth teams.",
    sector: "Infra",
    website: "#",
  },
  {
    _id: "p3",
    name: "FreshToHome",
    logo: portfolioOfficeImage.src,
    description: "Supply chain intelligence for modern commerce.",
    sector: "Logistics",
    website: "#",
  },
];

function Initials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-amber-brand to-gold-deep text-cream-warm font-heading text-sm font-semibold shadow-[0_10px_24px_-14px_oklch(0.55_0.15_55/0.65)]">
      {initials}
    </div>
  );
}

export function PortfolioPage() {
  const [items, setItems] = useState<PortfolioCompany[]>(portfolioSeed);
  const [filter, setFilter] = useState<string>("All");

  const sectors = ["All", ...Array.from(new Set(items.map((i) => i.sector)))];
  const visible = filter === "All" ? items : items.filter((i) => i.sector === filter);

  useEffect(() => {
    let cancelled = false;

    async function loadPortfolio() {
      try {
        const res = await fetch("/api/portfolio", { cache: "no-store" });
        const json = await res.json();
        const apiData = json?.data as unknown;

        if (!Array.isArray(apiData)) return;

        type ApiPortfolioItem = {
          _id?: unknown;
          title?: unknown;
          description?: unknown;
          image?: unknown;
          category?: unknown;
          link?: unknown;
        };

        const typed = apiData as ApiPortfolioItem[];

        const mapped: PortfolioCompany[] = typed.map((p, index) => ({
          _id: typeof p?._id === "string" ? p._id : String(p?._id ?? index),
          name: typeof p?.title === "string" ? p.title : "Untitled",
          logo: typeof p?.image === "string" ? p.image : "",
          description: typeof p?.description === "string" ? p.description : "",
          sector: typeof p?.category === "string" ? p.category : "",
          website: typeof p?.link === "string" ? p.link : "#",
        }));

        if (!cancelled) setItems(mapped);
      } catch {
        // Keep seed data on failure so the UI never breaks.
      }
    }

    loadPortfolio();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-dvh bg-cream-warm text-navy-ink">
      <SiteHeader />

      <section className="max-w-7xl mx-auto px-6 pt-16 md:pt-22 pb-7">
        <div className="mb-7 flex flex-wrap items-center gap-2">
          {sectors.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`min-w-[84px] rounded-full border px-5 py-2 text-[12px] font-semibold tracking-wide transition-all duration-300 ease-out ${
                filter === s
                  ? "border-navy-ink bg-navy-ink text-cream-warm shadow-[0_8px_18px_-12px_oklch(0.18_0.04_260/0.7)]"
                  : "border-navy-ink/10 bg-white text-navy-ink/80 hover:-translate-y-0.5 hover:border-amber-brand/45 hover:bg-amber-brand/10 hover:text-navy-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em]">Portfolio Companies</h1>
          <p className="rounded-full border border-navy-ink/12 bg-white px-3 py-1 text-xs text-navy-ink/65">
            <span className="font-semibold text-navy-ink">{visible.length}</span> shown
          </p>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-navy-ink/62 md:text-[15px]">
          A curated set of high-conviction companies we partner with across stage and sector.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((c) => (
            <a
              key={c._id}
              href={c.website || "#"}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-navy-ink/10 bg-white p-4 shadow-(--shadow-soft) transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-brand/40"
            >
              <div className="flex items-start gap-3.5">
                {c.logo ? (
                  <img
                    src={c.logo}
                    alt={c.name}
                    className="size-12 shrink-0 rounded-full border border-navy-ink/10 object-cover"
                  />
                ) : (
                  <Initials name={c.name} />
                )}
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
                    {c.sector || "General"}
                  </p>
                  <h3 className="mt-1 font-heading text-[1.36rem] font-semibold leading-tight text-navy-ink group-hover:text-amber-brand">
                    {c.name}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-navy-ink/62">
                    {c.description}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
        {visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-navy-ink/20 bg-white/65 px-6 py-14 text-center">
            <p className="text-navy-ink/60">No companies found for this sector.</p>
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
