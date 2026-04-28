"use client";

import Link from "next/link";
import { ArrowUpRight, Globe2, Rocket, ShieldCheck, Target } from "lucide-react";
import { SiteHeader } from "@/shared/layout/SiteHeader";
import { SiteFooter } from "@/shared/layout/SiteFooter";

const operatingPrinciples = [
  {
    label: "Mission",
    title: "Back conviction with capital",
    desc: "Partner with bold founders building category-defining companies. We invest early, stay long, and compound advantage.",
    icon: Rocket,
  },
  {
    label: "Strategy",
    title: "Concentrated, high-conviction bets",
    desc: "20-25 companies per fund. Meaningful checks. Meaningful ownership. Hands-on operating support across hiring and GTM.",
    icon: Target,
  },
  {
    label: "Vision",
    title: "A globally-scaled portfolio",
    desc: "Built from India and the US, deployed everywhere. We help founders cross borders, hire globally, and ship for the world.",
    icon: Globe2,
  },
  {
    label: "Approach",
    title: "Low-ego, high-velocity",
    desc: "We move fast, decide clearly, and stay out of the way once aligned. Operating partners on demand, never in the way.",
    icon: ShieldCheck,
  },
] as const;

export function AboutPage() {
  return (
    <main className="min-h-dvh text-navy-ink selection:bg-amber-brand/30">
      <SiteHeader />

      <section className="relative overflow-hidden pt-16 pb-16 md:pt-20 md:pb-18">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 right-0 size-[26rem] rounded-full bg-amber-brand/14 blur-3xl" />
          <div className="absolute bottom-8 -left-24 size-[24rem] rounded-full bg-gold-deep/10 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          <div className="lg:col-span-5">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-amber-brand/12 px-3 py-1 text-[11px] font-bold tracking-[0.2em] uppercase text-gold-deep">
              <span className="size-1.5 rounded-full bg-amber-brand" />
              About ASVF
            </p>
            <h1 className="max-w-[12ch] text-5xl md:text-6xl font-extrabold leading-[0.96] tracking-[-0.035em] text-balance">
              Building <span className="text-amber-brand italic">category-defining</span> companies.
            </h1>
            <p className="mt-7 max-w-[44ch] text-lg leading-relaxed text-navy-ink/70">
              An operator-led venture fund partnering with founders for the long arc - from first
              product to global scale.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-navy-ink px-7 py-3 text-sm font-bold text-cream-warm hover:opacity-92"
              >
                Get in touch <ArrowUpRight className="size-4" />
              </Link>
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 rounded-full border border-navy-ink/12 bg-card px-7 py-3 text-sm font-bold text-navy-ink hover:border-amber-brand/45"
              >
                View portfolio
              </Link>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 max-w-sm">
              {[
                { label: "Founded", value: "2014" },
                { label: "Stage", value: "Seed -> Series B" },
                { label: "AUM", value: "$420M+" },
                { label: "Sectors", value: "AI - SaaS - Infra" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-navy-ink/8 bg-card/90 px-4 py-3"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-ink/45">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-bold text-navy-ink">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-navy-ink/45">
                Operating Principles
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-ink/30">
                01 → 04
              </p>
            </div>

            <div className="space-y-4">
              {operatingPrinciples.map((item, idx) => (
                <div
                  key={item.label}
                  className="group relative overflow-hidden rounded-3xl border border-navy-ink/8 bg-card p-6 md:p-7"
                >
                  <div
                    className={`pointer-events-none absolute inset-y-0 right-0 w-36 rounded-full blur-2xl ${
                      idx === 0 || idx === 3 ? "bg-amber-brand/30" : "bg-amber-brand/12"
                    }`}
                  />
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-brand/14 text-gold-deep">
                      <item.icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold-deep/90">
                        {item.label}
                      </p>
                      <h3 className="mt-1 text-2xl md:text-[2rem] font-extrabold leading-tight tracking-[-0.02em]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm md:text-base leading-relaxed text-navy-ink/70">
                        {item.desc}
                      </p>
                    </div>
                    <ArrowUpRight className="mt-1 size-4 shrink-0 text-navy-ink/35" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
