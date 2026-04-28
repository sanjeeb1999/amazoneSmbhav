"use client";

import * as React from "react";
import Link from "next/link";
import heroCollab from "@/assets/hero-collab.jpg";
import aspirationalHealth from "@/assets/aspirational-health.jpg";
import portfolioOffice from "@/assets/portfolio-office.jpg";
import portfolioAi from "@/assets/portfolio-ai.jpg";
import portfolioGrid from "@/assets/portfolio-grid.jpg";
import portfolioTeam from "@/assets/portfolio-team.jpg";
import { AspirationalScrollSection } from "@/components/AspirationalScrollSection";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { SiteHeader } from "@/shared/layout/SiteHeader";
import { SiteFooter } from "@/shared/layout/SiteFooter";

const stats = [
  { value: "$350M+", label: "Capital Deployed", note: "+18% YoY" },
  { value: "40+", label: "Portfolio Companies", note: "8 new this year" },
  { value: "18", label: "Global Presence", note: "Across key markets" },
  { value: "12", label: "Active Sectors", note: "Diversified exposure" },
];

const portfolio = [
  {
    name: "NovaIQ",
    desc: "Applied AI stack for enterprise.",
    img: portfolioAi,
    tag: "AI / Series B",
  },
  {
    name: "AetherGrid",
    desc: "Resilient digital infrastructure.",
    img: portfolioGrid,
    tag: "Infra / Series A",
  },
  {
    name: "FreshToHome",
    desc: "Supply chain intelligence platform.",
    img: portfolioOffice,
    tag: "Logistics / Series C",
  },
  {
    name: "Strata Labs",
    desc: "Mission-critical workflow SaaS.",
    img: portfolioTeam,
    tag: "SaaS / Seed",
  },
];

const offerings = [
  {
    title: "Global reach & scaled VC team",
    desc: "Tap a broad network, deep domain expertise, and seasoned venture operators across the world.",
  },
  {
    title: "Dedicated portfolio managers",
    desc: "Work with partners who help accelerate collaboration and internal alignment with key teams.",
  },
  {
    title: "PR & marketing opportunities",
    desc: "Amplify your brand through strategic communication and growth marketing support.",
  },
  {
    title: "Product & beta access",
    desc: "Get early access to innovation programs and closed beta environments for product advantage.",
  },
  {
    title: "Mentorship from product leaders",
    desc: "Learn from seasoned product leaders to sharpen strategy, execution, and scale readiness.",
  },
];

const bannerSlides = [
  {
    eyebrow: "Global Reach",
    title: "Scaling visionary teams across markets.",
    description:
      "We partner with ambitious founders and help them grow globally through focused capital and unmatched ecosystem access.",
    ctaLabel: "Get in Touch",
    ctaTo: "/contact",
    image: heroCollab,
    alt: "Founders collaborating across markets",
  },
  {
    eyebrow: "Aspirational Growth",
    title: "Backing companies shaping category leadership.",
    description:
      "From early traction to regional expansion, we support operators with practical mentorship and strategic introductions.",
    ctaLabel: "Explore Portfolio",
    ctaTo: "/portfolio",
    image: aspirationalHealth,
    alt: "Healthcare team scaling diagnostics operations",
  },
  {
    eyebrow: "Operator-Led Support",
    title: "Capital, guidance, and execution at speed.",
    description:
      "Our dedicated venture team works closely with founders to accelerate product adoption, hiring, and go-to-market confidence.",
    ctaLabel: "View Our Approach",
    ctaTo: "/about",
    image: portfolioOffice,
    alt: "Modern office environment with product teams",
  },
] as const;

function getImageSrc(image: string | { src: string }) {
  return typeof image === "string" ? image : image.src;
}

function BannerCarousel() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  React.useEffect(() => {
    if (!api) return;

    const onSelect = () => setActiveIndex(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  React.useEffect(() => {
    if (!api || prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      api.scrollNext();
    }, 4600);

    return () => window.clearInterval(timer);
  }, [api, prefersReducedMotion]);

  return (
    <section className="relative flex min-h-[78vh] items-center overflow-hidden pt-20 pb-22 md:min-h-[82vh] md:pt-24 md:pb-26">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-24 right-0 size-[30rem] rounded-full bg-amber-brand/20 blur-3xl" />
        <div className="absolute bottom-0 -left-20 size-[22rem] rounded-full bg-gold-deep/15 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cream-warm/40" />
      </div>

      <div className="w-full px-0">
        <Carousel setApi={setApi} opts={{ loop: true, duration: 62 }} className="relative">
          <CarouselContent className="-ml-0">
            {bannerSlides.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <CarouselItem key={slide.title} className="pl-0">
                  <div className="grid grid-cols-1 items-center gap-10 px-6 md:gap-12 md:px-10 lg:grid-cols-12 lg:gap-14 lg:px-16 xl:px-24">
                    <div className="z-10 py-3 md:py-4 lg:col-span-7">
                      <div
                        className={`mb-5 inline-flex items-center gap-2 rounded-full bg-amber-brand/15 px-3.5 py-1.5 text-[12px] font-bold tracking-[0.16em] text-gold-deep uppercase transition-all duration-[950ms] ease-in-out ${
                          isActive
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-3 pointer-events-none"
                        }`}
                      >
                        <span className="size-1.5 rounded-full bg-amber-brand animate-pulse" />
                        {slide.eyebrow}
                      </div>
                      <h1
                        className={`mb-5 max-w-[19ch] text-balance text-[22px] font-bold leading-[1.16] tracking-[-0.015em] md:text-[30px] lg:text-[44px] transition-all duration-[1050ms] delay-100 ease-in-out ${
                          isActive
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-3 pointer-events-none"
                        }`}
                      >
                        {slide.title}
                      </h1>
                      <p
                        className={`mb-7 max-w-[56ch] text-[15px] leading-[1.68] text-navy-ink/72 md:text-[18px] transition-all duration-[1050ms] delay-200 ease-in-out ${
                          isActive
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-3 pointer-events-none"
                        }`}
                      >
                        {slide.description}
                      </p>
                      <div
                        className={`flex flex-wrap gap-3 transition-all duration-[1050ms] delay-300 ease-in-out ${
                          isActive
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-3 pointer-events-none"
                        }`}
                      >
                        <Link
                          href={slide.ctaTo}
                          className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-amber-brand px-7 py-3.5 text-[16px] font-bold text-navy-ink shadow-[var(--shadow-amber)] transition-all duration-300 ease-in-out hover:bg-amber-glow hover:scale-[1.03] motion-safe:hover:-translate-y-0.5"
                        >
                          {slide.ctaLabel} <span>→</span>
                        </Link>
                      </div>
                    </div>

                    <div className="relative lg:col-span-5">
                      <div className="pointer-events-none absolute inset-0 z-10 rounded-3xl bg-gradient-to-t from-navy-ink/35 via-navy-ink/8 to-transparent" />
                      <div className="aspect-square rounded-3xl border border-navy-ink/10 overflow-hidden shadow-[var(--shadow-soft)] md:aspect-[5/4]">
                        <img
                          src={getImageSrc(slide.image)}
                          alt={slide.alt}
                          width={1200}
                          height={1200}
                          className={`w-full h-full object-cover will-change-transform transition-[transform,filter] duration-[2600ms] ease-in-out ${
                            isActive
                              ? "scale-105 translate-y-0 blur-0"
                              : "scale-[1.015] translate-y-2 blur-[0.6px]"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

        </Carousel>
      </div>
    </section>
  );
}

function useHomepageReveal() {
  React.useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("reveal-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -4% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
}

export function HomePage() {
  useHomepageReveal();

  return (
    <main className="min-h-dvh text-navy-ink selection:bg-amber-brand/30">
      <SiteHeader />

      <div>
        <BannerCarousel />
      </div>

      {/* Stats */}
      <section data-reveal className="reveal-section max-w-7xl mx-auto px-6 -mt-6 mb-16 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-card rounded-2xl p-6 shadow-[var(--shadow-soft)] border border-navy-ink/5 group hover:-translate-y-1 transition-transform"
            >
              <div className="flex justify-end">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-brand/15 text-gold-deep px-2 py-1 rounded-full">
                  {s.note}
                </span>
              </div>
              <p className="font-heading text-4xl font-bold mt-3 tabular-nums">{s.value}</p>
              <p className="text-sm text-navy-ink/60 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Offerings */}
      <section className="max-w-7xl mx-auto px-6 pt-4 pb-16">
        <div className="relative mb-10 md:mb-11">
          <div className="pointer-events-none absolute -top-8 left-0 h-20 w-72 rounded-full bg-amber-brand/12 blur-3xl" />
          <p className="relative mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-gold-deep">
            Beyond Capital
          </p>
          <h2 className="relative text-4xl md:text-[3.4rem] font-extrabold leading-[1.03] tracking-[-0.03em]">
            In addition to capital <span className="italic text-amber-brand">we offer</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {offerings.map((o, i) => (
            <div
              key={o.title}
              className="group relative overflow-hidden rounded-2xl border border-navy-ink/8 bg-gradient-to-b from-card to-cream-warm/55 p-6 shadow-[var(--shadow-soft)] transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:scale-[1.008] hover:border-navy-ink/35 hover:shadow-[0_20px_44px_-24px_oklch(0.18_0.04_260/0.5)]"
            >
              <div className="pointer-events-none absolute inset-0 origin-bottom scale-y-0 rounded-2xl bg-navy-ink/96 transition-transform duration-[950ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100" />
              <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-amber-brand/20 opacity-0 blur-2xl transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100" />
              <div className="pointer-events-none absolute -left-8 -bottom-10 size-24 rounded-full bg-gold-deep/20 opacity-0 blur-2xl transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100" />

              <div className="relative z-10">
              <div
                  className="mb-5 flex size-10 items-center justify-center rounded-full bg-amber-brand/12 text-gold-deep transition-all delay-100 duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 group-hover:bg-amber-brand group-hover:text-navy-ink"
              >
                <span className="font-bold text-sm">0{i + 1}</span>
              </div>
                <h4 className="mb-3 font-heading text-[1.36rem] font-extrabold leading-[1.2] tracking-[-0.015em] text-navy-ink transition-colors delay-150 duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-cream-warm">
                  {o.title}
                </h4>
                <p className="text-[15px] leading-[1.72] tracking-[0.004em] text-navy-ink/65 transition-colors delay-200 duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-cream-warm/75">
                  {o.desc}
                </p>

                <div className="mt-5 overflow-hidden">
                  <Link
                    href="/contact"
                    className="relative inline-flex translate-y-2 items-center gap-2 rounded-full bg-amber-brand px-5 py-2.5 text-sm font-bold text-navy-ink opacity-0 transition-all delay-150 duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100 hover:bg-amber-glow hover:shadow-[0_14px_26px_-16px_oklch(0.78_0.17_70/0.72)] hover:-translate-y-0.5"
                  >
                    Get in touch{" "}
                    <span className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Portfolio */}
      <section id="portfolio" className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Portfolio</h2>
            <p className="text-lg text-navy-ink/60">
              A curated set of high-conviction companies building category leadership.
            </p>
          </div>
          <Link
            href="/portfolio"
            className="text-gold-deep font-bold flex items-center gap-2 group border-b-2 border-amber-brand/30 pb-1 self-start"
          >
            View all <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {portfolio.map((p) => (
            <div key={p.name} className="group cursor-pointer">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-[var(--shadow-soft)]">
                <img
                  src={getImageSrc(p.img)}
                  alt={p.name}
                  width={800}
                  height={600}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold-deep">
                {p.tag}
              </span>
              <h3 className="font-heading font-bold text-xl mt-1">{p.name}</h3>
              <p className="text-sm text-navy-ink/60 mt-1 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Aspirational Companies */}
      <div>
        <AspirationalScrollSection />
      </div>

      {/* CTA */}
      <section data-reveal className="reveal-section max-w-7xl mx-auto px-6 pb-16">
        <div className="group relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-navy-ink/8 bg-gradient-to-b from-card to-cream-warm/55 shadow-[var(--shadow-soft)] transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_24px_46px_-24px_oklch(0.18_0.04_260/0.45)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_75%,oklch(0.78_0.17_70/0.08)_0%,transparent_38%),radial-gradient(circle_at_88%_15%,oklch(0.55_0.15_55/0.06)_0%,transparent_42%)]" />
          <div className="pointer-events-none absolute -right-28 -top-24 size-[34rem] scale-0 rounded-full bg-black/94 blur-[6px] transition-transform duration-[950ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[2.5]" />
          <div className="pointer-events-none absolute inset-0 bg-black/45 opacity-0 transition-opacity delay-100 duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100" />
          <div className="relative z-10 mx-auto max-w-3xl px-8 py-14 text-center md:px-12 md:py-16">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-gold-deep/90 transition-colors delay-100 duration-[780ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-amber-brand/90">
              Founder Growth Platform
            </p>
            <h2 className="mb-6 text-balance text-4xl font-extrabold leading-[1.04] tracking-[-0.03em] text-navy-ink transition-colors delay-150 duration-[840ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-cream-warm md:text-5xl">
              Let's build something <span className="text-amber-brand italic">great</span> together.
            </h2>
            <p className="mx-auto mb-9 max-w-2xl text-base leading-relaxed text-navy-ink/68 transition-colors delay-220 duration-[860ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-cream-warm/78 md:text-lg">
              Partner with a team that helps founders scale with strategic capital, operating
              depth, and long-term conviction.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-amber-brand px-10 py-4 text-base font-bold text-navy-ink transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-amber-glow hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-18px_oklch(0.78_0.17_70/0.62)]"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Final hook */}
      <section data-reveal className="reveal-section border-t border-navy-ink/10 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to create a future?</h2>
          <p className="text-lg text-navy-ink/70">
            Write to us at{" "}
            <a
              href="mailto:contact@asvf.com"
              className="text-amber-brand font-bold border-b-2 border-amber-brand/40 hover:border-amber-brand transition-colors"
            >
              contact@asvf.com
            </a>
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
