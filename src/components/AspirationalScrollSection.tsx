"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll } from "framer-motion";
import Link from "next/link";
import heroCollab from "@/assets/hero-collab.jpg";
import aspirationalHealth from "@/assets/aspirational-health.jpg";
import portfolioOffice from "@/assets/portfolio-office.jpg";
import portfolioAi from "@/assets/portfolio-ai.jpg";
import portfolioGrid from "@/assets/portfolio-grid.jpg";
import portfolioTeam from "@/assets/portfolio-team.jpg";

type StoryItem = {
  tag: string;
  title: string;
  description: string;
  image: string | { src: string };
};

const storyItems: StoryItem[] = [
  {
    tag: "HealthTech",
    title: "Orange HealthLabs",
    description:
      "Home diagnostics at scale with rapid collection and dependable reporting across high-density urban markets.",
    image: aspirationalHealth,
  },
  {
    tag: "Automation",
    title: "Northstar Robotics",
    description:
      "Warehouse intelligence and robotics orchestration that helps operations teams improve throughput and reliability.",
    image: portfolioGrid,
  },
  {
    tag: "AI Analytics",
    title: "SignalForge",
    description:
      "Unified campaign and revenue intelligence helping growth teams move from fragmented reports to clear decisions.",
    image: portfolioAi,
  },
  {
    tag: "Commerce",
    title: "Helio Commerce",
    description:
      "Composable commerce infrastructure designed for modern brands scaling payments, fulfillment, and retention.",
    image: portfolioOffice,
  },
  {
    tag: "EdTech",
    title: "Atlas Learning",
    description:
      "Adaptive workforce learning journeys that improve onboarding speed and long-term capability development.",
    image: heroCollab,
  },
  {
    tag: "Enterprise SaaS",
    title: "BlueArc Systems",
    description:
      "Compliance-first workflow platform for mission-critical approvals, audits, and cross-team coordination.",
    image: portfolioTeam,
  },
];

function getClampedIndex(progress: number, length: number) {
  const index = Math.floor(progress * length);
  return Math.min(length - 1, Math.max(0, index));
}

function getImageSrc(image: StoryItem["image"]) {
  return typeof image === "string" ? image : image.src;
}

export function AspirationalScrollSection() {
  const desktopRef = React.useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: desktopRef,
    offset: ["start start", "end end"],
  });

  const [activeStep, setActiveStep] = React.useState(0);
  const [showDots, setShowDots] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (value) => {
      setActiveStep(getClampedIndex(value, storyItems.length));
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  React.useEffect(() => {
    const updateDotsVisibility = () => {
      const node = desktopRef.current;
      if (!node) return;

      // Strict visibility rule: show only when viewport center is inside
      // the Aspirational section bounds. Prevents leaking into next sections.
      const rect = node.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top;
      const sectionBottom = sectionTop + rect.height;
      const viewportCenter = window.scrollY + window.innerHeight / 2;
      const sectionSpan = Math.max(sectionBottom - sectionTop, 1);
      const progress = (viewportCenter - sectionTop) / sectionSpan;
      const isInsideSection = viewportCenter >= sectionTop && viewportCenter <= sectionBottom;

      // Show only while story scroll is actively progressing; hide once it has completed.
      const shouldShow = isInsideSection && progress >= 0.02 && progress <= 0.93;
      setShowDots(shouldShow);
    };

    updateDotsVisibility();
    window.addEventListener("scroll", updateDotsVisibility, { passive: true });
    window.addEventListener("resize", updateDotsVisibility);
    return () => {
      window.removeEventListener("scroll", updateDotsVisibility);
      window.removeEventListener("resize", updateDotsVisibility);
    };
  }, []);

  const scrollToStep = (index: number) => {
    const section = desktopRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    const stepSpan = rect.height / storyItems.length;
    const targetY = absoluteTop + index * stepSpan;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  return (
    <section className="relative w-full pt-8 pb-4 md:pt-10 md:pb-6">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-4 h-40 w-[36rem] -translate-x-1/2 rounded-full bg-amber-brand/10 blur-3xl" />
      </div>

      <section
        ref={desktopRef}
        className="relative hidden lg:block"
        style={{ height: `${storyItems.length * 52}vh` }}
      >
        <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-visible">
          <div className="mx-auto flex h-full max-w-[1600px] flex-col px-16 py-6 xl:px-24">
            <div className="shrink-0 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-deep">
                Aspirational Companies
              </p>
              <h2 className="mt-3 mx-auto w-fit whitespace-nowrap text-4xl font-extrabold leading-tight tracking-[-0.015em] text-navy-ink">
                Visionary teams built for category leadership.
              </h2>
            </div>

            <div className="mt-4 grid min-h-0 flex-1 grid-cols-12 gap-6">
              <div className="col-span-5 flex h-full flex-col">
                <div className="h-[52vh] overflow-hidden rounded-3xl border border-navy-ink/8 shadow-[var(--shadow-soft)]">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={storyItems[activeStep].title}
                      src={getImageSrc(storyItems[activeStep].image)}
                      alt={storyItems[activeStep].title}
                      initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
                      animate={reduceMotion ? undefined : { opacity: 1, scale: 1.08 }}
                      exit={reduceMotion ? undefined : { opacity: 0, scale: 1.02 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      className="h-full w-full object-cover"
                    />
                  </AnimatePresence>
                </div>
              </div>

              <div className="col-span-7 flex h-full items-start">
                <div className="w-full px-6 py-4">
                  <AnimatePresence mode="wait">
                    <motion.article
                      key={storyItems[activeStep].title}
                      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -16 }}
                      transition={{ duration: 0.45, ease: "easeInOut" }}
                      className="rounded-2xl px-1 py-2 transition-all duration-500 ease-in-out hover:-translate-y-0.5 hover:opacity-95"
                    >
                      <span className="inline-flex items-center rounded-full bg-amber-brand/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep">
                        {storyItems[activeStep].tag}
                      </span>
                      <h3 className="mt-4 text-[17px] font-extrabold leading-snug tracking-[-0.01em] text-navy-ink">
                        {storyItems[activeStep].title}
                      </h3>
                      <p className="mt-3 max-w-[52ch] text-[13px] leading-[1.75] tracking-[0.005em] text-navy-ink/70">
                        {storyItems[activeStep].description}
                      </p>
                      <Link
                        href="/contact"
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-brand px-5 py-2.5 text-sm font-bold text-navy-ink transition-all duration-500 ease-in-out hover:bg-amber-glow hover:-translate-y-0.5"
                      >
                        Get in Touch <span>→</span>
                      </Link>
                    </motion.article>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showDots && (
        <nav
          aria-label="Aspirational story navigation"
          className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:flex flex-col items-center gap-3"
        >
          {storyItems.map((item, index) => {
            const isActive = index === activeStep;
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => scrollToStep(index)}
                aria-label={`Go to ${item.title}`}
                className={`rounded-full transition-all duration-300 ease-in-out ${
                  isActive
                    ? "h-3 w-3 bg-amber-brand shadow-[0_0_0_4px_oklch(0.78_0.17_70/0.2)]"
                    : "h-2.5 w-2.5 bg-navy-ink/25 hover:h-3 hover:w-3 hover:bg-navy-ink/45"
                }`}
              />
            );
          })}
        </nav>
      )}

      <section className="lg:hidden">
        <div className="mx-auto max-w-7xl space-y-6 px-6 md:px-10">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-deep">
              Aspirational Companies
            </p>
            <h2 className="mt-3 mx-auto w-fit text-3xl font-extrabold leading-tight tracking-[-0.015em] text-navy-ink md:text-4xl">
              Visionary teams built for category leadership.
            </h2>
          </div>

          {storyItems.map((item, index) => (
            <motion.article
              key={item.title}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="overflow-hidden rounded-2xl transition-all duration-500 ease-in-out hover:-translate-y-0.5"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={getImageSrc(item.image)}
                  alt={item.title}
                  width={1200}
                  height={760}
                  loading={index < 2 ? "eager" : "lazy"}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-5 md:p-6">
                <span className="inline-flex items-center rounded-full bg-amber-brand/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep">
                  {item.tag}
                </span>
                <h3 className="mt-4 text-[17px] font-extrabold leading-snug tracking-[-0.01em] text-navy-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-[13px] leading-[1.75] tracking-[0.005em] text-navy-ink/70">
                  {item.description}
                </p>
                <Link
                  href="/contact"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-brand px-5 py-2.5 text-sm font-bold text-navy-ink transition-all duration-500 ease-in-out hover:bg-amber-glow hover:-translate-y-0.5"
                >
                  Get in Touch <span>→</span>
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </section>
  );
}
