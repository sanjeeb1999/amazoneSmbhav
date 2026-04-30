"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
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
  highlight?: string;
  sector: string;
  website: string;
};

const portfolioSeed: PortfolioCompany[] = [
  {
    _id: "p1",
    name: "NovaIQ",
    logo: portfolioAiImage.src,
    description: "Applied AI stack for enterprise automation.",
    highlight: "Built for scale with strong enterprise workflow depth.",
    sector: "AI",
    website: "#",
  },
  {
    _id: "p2",
    name: "AetherGrid",
    logo: portfolioGridImage.src,
    description: "Resilient cloud infrastructure for high-growth teams.",
    highlight: "Category-focused cloud architecture with reliability-first design.",
    sector: "Infra",
    website: "#",
  },
  {
    _id: "p3",
    name: "FreshToHome",
    logo: portfolioOfficeImage.src,
    description: "Supply chain intelligence for modern commerce.",
    highlight: "Clear product-market fit supported by strong operational execution.",
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
  const [items, setItems] = useState<PortfolioCompany[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [filter, setFilter] = useState<string>("All");
  const [selectedCompany, setSelectedCompany] = useState<PortfolioCompany | null>(null);

  const sectors = ["All", ...Array.from(new Set(items.map((i) => i.sector)))];
  const visible = filter === "All" ? items : items.filter((i) => i.sector === filter);

  useEffect(() => {
    let cancelled = false;

    async function loadPortfolio() {
      try {
        const res = await fetch("/api/portfolio", { cache: "no-store" });
        const json = await res.json();
        const apiData = json?.data as unknown;

        if (!Array.isArray(apiData) || apiData.length === 0) {
          if (!cancelled) setItems(portfolioSeed);
          return;
        }

        type ApiPortfolioItem = {
          _id?: unknown;
          title?: unknown;
          description?: unknown;
          highlight?: unknown;
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
          highlight: typeof p?.highlight === "string" ? p.highlight : "",
          sector: typeof p?.category === "string" ? p.category : "",
          website: typeof p?.link === "string" ? p.link : "#",
        }));

        if (!cancelled) setItems(mapped.length > 0 ? mapped : portfolioSeed);
      } catch {
        if (!cancelled) setItems(portfolioSeed);
      } finally {
        if (!cancelled) setPortfolioLoading(false);
      }
    }

    loadPortfolio();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedCompany) return;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedCompany(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedCompany]);

  return (
    <main className="min-h-dvh bg-cream-warm text-navy-ink">
      <SiteHeader />

      <section className="max-w-7xl mx-auto px-6 pt-16 md:pt-22 pb-7">
        <div className="rounded-3xl border border-white/70 bg-white/70 backdrop-blur-sm p-6 md:p-8 shadow-[0_24px_70px_-42px_oklch(0.18_0.04_260/0.45)]">
          <div className="mb-6 flex flex-wrap items-center gap-2">
          {sectors.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`min-w-[92px] rounded-full border px-5 py-2 text-[12px] font-semibold tracking-wide transition-all duration-300 ease-out ${
                filter === s
                  ? "border-transparent bg-linear-to-r from-navy-ink to-navy-ink/90 text-cream-warm shadow-[0_16px_30px_-18px_oklch(0.18_0.04_260/0.7)]"
                  : "border-navy-ink/10 bg-white/85 text-navy-ink/80 hover:-translate-y-0.5 hover:border-amber-brand/40 hover:bg-amber-brand/10 hover:text-navy-ink"
              }`}
            >
              {s}
            </button>
          ))}
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-navy-ink">
                Portfolio Companies
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy-ink/62 md:text-[15px]">
                A curated set of high-conviction companies we partner with across stage and sector.
              </p>
            </div>
            <p className="w-fit rounded-full border border-navy-ink/12 bg-white/90 px-4 py-1.5 text-xs text-navy-ink/65">
              <span className="font-semibold text-navy-ink">{visible.length}</span> companies shown
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        {portfolioLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-white/70 bg-white/75 p-5 backdrop-blur-sm shadow-[0_20px_55px_-36px_oklch(0.18_0.04_260/0.5)]"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-20 rounded-full bg-navy-ink/8 animate-pulse" />
                    <div className="h-4 w-14 rounded bg-navy-ink/8 animate-pulse" />
                  </div>
                  <div className="flex items-start gap-3.5">
                    <div className="size-12 shrink-0 rounded-full bg-navy-ink/8 animate-pulse" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-6 w-2/3 rounded bg-navy-ink/10 animate-pulse" />
                      <div className="h-4 w-full rounded bg-navy-ink/10 animate-pulse" />
                      <div className="h-4 w-5/6 rounded bg-navy-ink/10 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => setSelectedCompany(c)}
                className="group relative w-full overflow-hidden rounded-3xl border border-white/70 bg-white/75 p-5 text-left backdrop-blur-sm shadow-[0_20px_55px_-36px_oklch(0.18_0.04_260/0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-34px_oklch(0.18_0.04_260/0.55)]"
              >
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-linear-to-br from-amber-brand/10 via-transparent to-navy-ink/8" />
                <div className="relative">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="rounded-full border border-amber-brand/20 bg-amber-brand/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
                      {c.sector || "General"}
                    </p>
                    <span className="inline-flex items-center rounded-full border border-navy-ink/12 bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-navy-ink/60 transition-all group-hover:border-amber-brand/35 group-hover:bg-amber-brand/10 group-hover:text-navy-ink">
                      Explore
                      <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                    </span>
                  </div>
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
                      <h3 className="font-heading text-[1.36rem] font-semibold leading-tight text-navy-ink group-hover:text-amber-brand">
                        {c.name}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-navy-ink/62">
                        {c.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 h-px w-full bg-linear-to-r from-navy-ink/10 via-navy-ink/4 to-transparent" />
                  <p className="mt-3 text-xs text-navy-ink/50">Open portfolio preview</p>
                </div>
              </button>
            ))}
          </div>
        )}
        {!portfolioLoading && visible.length === 0 && (
          <div className="rounded-3xl border border-dashed border-navy-ink/20 bg-white/70 px-6 py-14 text-center backdrop-blur-sm">
            <p className="text-navy-ink/60">No companies found for this sector.</p>
          </div>
        )}
      </section>

      {selectedCompany && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-ink/65 backdrop-blur-lg p-4 md:p-6"
          onClick={() => setSelectedCompany(null)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedCompany.name} details`}
            className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-[0_45px_140px_-55px_oklch(0.18_0.04_260/0.95)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-navy-ink/10 bg-linear-to-r from-white via-white to-amber-brand/15 px-5 py-4 md:px-7">
              <p className="rounded-full border border-amber-brand/25 bg-amber-brand/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-deep">
                {selectedCompany.sector || "General"}
              </p>
              <button
                type="button"
                onClick={() => setSelectedCompany(null)}
                className="flex size-10 items-center justify-center rounded-full border border-navy-ink/10 bg-white text-xl leading-none text-navy-ink/70 transition-all hover:scale-105 hover:bg-navy-ink hover:text-cream-warm"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
              <div className="relative bg-navy-ink/8">
                {selectedCompany.logo ? (
                  <img
                    src={selectedCompany.logo}
                    alt={selectedCompany.name}
                    className="h-80 w-full object-cover md:h-full"
                  />
                ) : (
                  <div className="flex h-80 items-center justify-center md:h-full">
                    <Initials name={selectedCompany.name} />
                  </div>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-linear-to-t from-navy-ink/70 via-navy-ink/20 to-transparent" />
                <div className="pointer-events-none absolute left-5 bottom-5 rounded-full border border-white/35 bg-white/20 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                  Portfolio preview
                </div>
              </div>

              <div className="p-6 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-navy-ink/45">
                  Portfolio spotlight
                </p>
                <h2 className="mt-2 font-heading text-3xl font-semibold leading-tight tracking-[-0.02em] text-navy-ink md:text-4xl">
                  {selectedCompany.name}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-navy-ink/70 md:text-[15px]">
                  {selectedCompany.description || "No description available for this company yet."}
                </p>

                <div className="mt-6 rounded-2xl border border-navy-ink/10 bg-linear-to-br from-navy-ink/3 to-amber-brand/10 p-4">
                  <p className="text-xs font-medium uppercase tracking-widest text-navy-ink/45">
                    Why it stands out
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-navy-ink/70">
                    {selectedCompany.highlight ||
                      "Built for scale with a clear market focus and product depth across its category."}
                  </p>
                </div>

                <div className="mt-7 flex items-center gap-3">
                  {selectedCompany.website && selectedCompany.website !== "#" ? (
                    <a
                      href={selectedCompany.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-full bg-linear-to-r from-navy-ink to-navy-ink/90 px-5 py-2.5 text-sm font-semibold text-cream-warm transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_24px_-14px_oklch(0.18_0.04_260/0.6)]"
                    >
                      Visit website
                      <ArrowUpRight className="ml-1.5 h-4 w-4" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-navy-ink/15 bg-white px-4 py-2 text-sm text-navy-ink/55">
                      Website unavailable
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedCompany(null)}
                    className="inline-flex items-center rounded-full border border-navy-ink/15 bg-white px-4 py-2 text-sm font-medium text-navy-ink/75 transition-colors hover:bg-navy-ink/5"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </main>
  );
}
