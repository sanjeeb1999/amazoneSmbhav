"use client";

import { SiteHeader } from "@/shared/layout/SiteHeader";
import { SiteFooter } from "@/shared/layout/SiteFooter";

type NewsItem = {
  _id: string;
  title: string;
  excerpt: string;
  date: string;
};

const items: NewsItem[] = [
  {
    _id: "news-1",
    title: "ASVF closes $120M Fund III",
    excerpt: "Continuing our long-term commitment to category-defining founders.",
    date: "2026-04-28T00:00:00.000Z",
  },
  {
    _id: "news-2",
    title: "NovaIQ raises Series B led by ASVF",
    excerpt: "Doubling down on applied AI for the enterprise.",
    date: "2026-04-28T00:00:00.000Z",
  },
  {
    _id: "news-3",
    title: "Welcoming Sara Kapoor as Head of Platform",
    excerpt: "Strengthening operating support across the portfolio.",
    date: "2026-04-28T00:00:00.000Z",
  },
];

export function NewsPage() {
  return (
    <main className="min-h-dvh">
      <SiteHeader />

      <section className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-12">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-gold-deep mb-4">
          News & Events
        </p>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-3xl">
          From the <span className="text-amber-brand italic">field</span>.
        </h1>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24">
        <ul className="divide-y divide-navy-ink/10">
          {items.map((n) => (
            <li key={n._id} className="py-8 group animate-in fade-in">
              <p className="text-xs font-bold uppercase tracking-widest text-gold-deep mb-2">
                {new Date(n.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold leading-tight group-hover:text-amber-brand transition-colors">
                {n.title}
              </h2>
              <p className="text-navy-ink/70 mt-3 leading-relaxed">{n.excerpt}</p>
            </li>
          ))}
        </ul>
        {items.length === 0 && <p className="text-center text-navy-ink/50 py-12">No news yet.</p>}
      </section>

      <SiteFooter />
    </main>
  );
}
