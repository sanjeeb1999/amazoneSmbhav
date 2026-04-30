"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/shared/layout/SiteHeader";
import { SiteFooter } from "@/shared/layout/SiteFooter";
import aspirationalHealthImage from "@/assets/aspirational-health.jpg";
import heroCollabImage from "@/assets/hero-collab.jpg";
import portfolioTeamImage from "@/assets/portfolio-team.jpg";

type NewsItem = {
  _id: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  externalLink?: string;
};

const seedItems: NewsItem[] = [
  {
    _id: "news-1",
    title: "ASVF closes $120M Fund III",
    excerpt: "Continuing our long-term commitment to category-defining founders.",
    date: "2026-04-28T00:00:00.000Z",
    image: aspirationalHealthImage.src,
  },
  {
    _id: "news-2",
    title: "NovaIQ raises Series B led by ASVF",
    excerpt: "Doubling down on applied AI for the enterprise.",
    date: "2026-04-28T00:00:00.000Z",
    image: heroCollabImage.src,
  },
  {
    _id: "news-3",
    title: "Welcoming Sara Kapoor as Head of Platform",
    excerpt: "Strengthening operating support across the portfolio.",
    date: "2026-04-28T00:00:00.000Z",
    image: portfolioTeamImage.src,
  },
];

export function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      try {
        const res = await fetch("/api/news", { cache: "no-store" });
        const json = await res.json();
        const apiData = json?.data as unknown;

        if (!Array.isArray(apiData) || apiData.length === 0) {
          if (!cancelled) setItems(seedItems);
          return;
        }

        type ApiNewsItem = {
          _id?: unknown;
          title?: unknown;
          content?: unknown;
          date?: unknown;
          image?: unknown;
          externalLink?: unknown;
        };

        const typed = apiData as ApiNewsItem[];
        const mapped: NewsItem[] = typed.map((n, index) => {
          const id = typeof n?._id === "string" ? n._id : String(n?._id ?? index);
          const title = typeof n?.title === "string" ? n.title : "Untitled";
          const content = typeof n?.content === "string" ? n.content : title;

          let dateValue: Date | null = null;
          if (typeof n?.date === "string" || typeof n?.date === "number") {
            const parsed = new Date(n.date);
            if (!Number.isNaN(parsed.getTime())) dateValue = parsed;
          }

          const date = dateValue ? dateValue.toISOString() : new Date().toISOString();

          const image = typeof n?.image === "string" ? n.image : "";
          const externalLink =
            typeof n?.externalLink === "string" && n.externalLink.trim().length > 0
              ? n.externalLink
              : undefined;

          return {
            _id: id,
            title,
            excerpt: content,
            date,
            image,
            externalLink,
          };
        });

        if (!cancelled) setItems(mapped);
      } catch {
        if (!cancelled) setItems(seedItems);
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
                className="animate-in fade-in"
              >
                <a
                  href={n.externalLink ?? undefined}
                  target={n.externalLink ? "_blank" : undefined}
                  rel={n.externalLink ? "noopener noreferrer" : undefined}
                  className="group block h-full bg-card rounded-2xl overflow-hidden border border-navy-ink/5 shadow-(--shadow-soft) hover:-translate-y-1 transition-all"
                >
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
                </a>
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
