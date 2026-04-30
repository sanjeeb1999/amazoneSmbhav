"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DOMPurify from "dompurify";

import { SiteHeader } from "@/shared/layout/SiteHeader";
import { SiteFooter } from "@/shared/layout/SiteFooter";
import { fetchNewsItems, type NewsItem } from "@/lib/news";

type NewsDetailPageProps = {
  slug: string;
};

export function NewsDetailPage({ slug }: NewsDetailPageProps) {
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const safeHtml = item ? DOMPurify.sanitize(item.content) : "";

  useEffect(() => {
    let cancelled = false;

    async function loadItem() {
      try {
        const allItems = await fetchNewsItems();
        const found = allItems.find((news) => news.slug === slug) ?? null;
        if (!cancelled) setItem(found);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadItem();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <main className="min-h-dvh">
      <SiteHeader />

      <section className="max-w-4xl mx-auto px-6 pt-16 md:pt-24 pb-20">
        <Link href="/news" className="inline-flex items-center text-sm font-medium text-gold-deep hover:underline">
          ← Back to News
        </Link>

        {loading ? (
          <div className="mt-8 space-y-4">
            <div className="h-3 w-32 bg-navy-ink/10 rounded animate-pulse" />
            <div className="h-10 w-3/4 bg-navy-ink/10 rounded animate-pulse" />
            <div className="h-64 w-full bg-navy-ink/10 rounded-2xl animate-pulse" />
            <div className="h-4 w-full bg-navy-ink/10 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-navy-ink/10 rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-navy-ink/10 rounded animate-pulse" />
          </div>
        ) : item ? (
          <article className="mt-8">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-deep mb-3">
              {new Date(item.date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">{item.title}</h1>
            <div className="mt-8 rounded-2xl overflow-hidden border border-navy-ink/5">
              <img src={item.image} alt={item.title} className="w-full h-full max-h-[460px] object-cover" />
            </div>
            <div
              className="mt-8 text-base md:text-lg leading-relaxed text-navy-ink/85 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:ml-6 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:ml-6 [&_a]:text-gold-deep [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          </article>
        ) : (
          <div className="mt-10 rounded-2xl border border-navy-ink/10 bg-card p-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold">News article not found</h1>
            <p className="mt-3 text-navy-ink/70">This link may be outdated or the article is not available.</p>
            <Link
              href="/news"
              className="inline-flex mt-6 items-center rounded-full border border-gold-deep px-5 py-2 text-sm font-semibold text-gold-deep hover:bg-gold-deep/10 transition-colors"
            >
              Browse all news
            </Link>
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
