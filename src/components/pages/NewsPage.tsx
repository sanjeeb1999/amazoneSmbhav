"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/shared/layout/SiteHeader";
import { SiteFooter } from "@/shared/layout/SiteFooter";
import { fetchNewsItems, type NewsItem } from "@/lib/news";

export function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      try {
        const mapped = await fetchNewsItems();
        if (!cancelled) setItems(mapped);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setNewsLoading(false);
      }
    }

    loadNews();
    return () => {
      cancelled = true;
    };
  }, []);

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

      <section className="max-w-7xl mx-auto px-6 pb-24">
        {newsLoading ? (
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <li
                key={item}
                className="rounded-2xl overflow-hidden border border-navy-ink/5 shadow-(--shadow-soft) bg-card"
              >
                <div className="aspect-video bg-navy-ink/5 animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-3 w-32 bg-navy-ink/10 rounded animate-pulse" />
                  <div className="h-6 w-2/3 bg-navy-ink/10 rounded animate-pulse" />
                  <div className="h-4 w-full bg-navy-ink/10 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-navy-ink/10 rounded animate-pulse" />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((n) => (
              <li
                key={n._id}
                className="group animate-in fade-in bg-card rounded-2xl overflow-hidden border border-navy-ink/5 shadow-(--shadow-soft) hover:-translate-y-1 transition-all"
              >
                <Link href={`/news/${n.slug}`} className="block h-full">
                  <div className="aspect-video bg-navy-ink/5 overflow-hidden">
                    <img
                      src={n.image}
                      alt={n.title}
                      className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  </div>

                  <div className="p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-gold-deep mb-2">
                      {new Date(n.date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <h2 className="text-2xl font-bold leading-tight group-hover:text-amber-brand transition-colors">
                      {n.title}
                    </h2>
                    <p className="text-navy-ink/70 mt-3 leading-relaxed">{n.excerpt}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {items.length === 0 && <p className="text-center text-navy-ink/50 py-12">No news yet.</p>}
      </section>

      <SiteFooter />
    </main>
  );
}
