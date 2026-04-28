"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Linkedin, Mail, X } from "lucide-react";
import { useMemo, useState } from "react";
import aspirationalHealth from "@/assets/aspirational-health.jpg";
import heroCollab from "@/assets/hero-collab.jpg";
import portfolioTeam from "@/assets/portfolio-team.jpg";
import { SiteHeader } from "@/shared/layout/SiteHeader";
import { SiteFooter } from "@/shared/layout/SiteFooter";

type TeamCategory = "investment" | "finance" | "business";

type TeamMemberView = {
  id: string;
  name: string;
  role: string;
  image: string | { src: string };
  tagline: string;
  bio: string;
  department: TeamCategory;
  departmentLabel: string;
  featured?: boolean;
  timeline: string[];
  email: string;
  linkedIn: string;
};

function getImageSrc(image: TeamMemberView["image"]) {
  return typeof image === "string" ? image : image.src;
}

type Department = {
  id: TeamCategory;
  label: string;
  members: TeamMemberView[];
};

const DEPARTMENTS: Department[] = [
  {
    id: "investment",
    label: "Investment Team",
    members: [
      {
        id: "sharath",
        name: "Sharath Belur",
        role: "Managing Partner",
        image: portfolioTeam,
        tagline: "Building long-term value through structured investments.",
        bio: "Sharath leads investment strategy and portfolio acceleration with a strong operator mindset focused on enduring outcomes.",
        department: "investment",
        departmentLabel: "Investment",
        featured: true,
        timeline: [
          "Leads thesis and sector strategy for new investments",
          "Partners with founders on growth and governance",
          "Oversees follow-on strategy and portfolio value creation",
        ],
        email: "sharath@asvf.com",
        linkedIn: "https://www.linkedin.com/",
      },
      {
        id: "ruchi",
        name: "Ruchi Somaiya",
        role: "Principal",
        image: heroCollab,
        tagline: "Turning high-conviction insights into scalable bets.",
        bio: "Ruchi drives sourcing, diligence, and founder collaboration across early and growth-stage opportunities.",
        department: "investment",
        departmentLabel: "Investment",
        timeline: [
          "Leads investment diligence and commercial validation",
          "Supports founders in GTM and market expansion",
          "Builds strategic partnerships across the ecosystem",
        ],
        email: "ruchi@asvf.com",
        linkedIn: "https://www.linkedin.com/",
      },
      {
        id: "aditya",
        name: "Aditya Kulkarni",
        role: "Investment Associate",
        image: aspirationalHealth,
        tagline: "Mapping opportunities with data-backed conviction.",
        bio: "Aditya supports pipeline development, sector mapping, and portfolio operating priorities.",
        department: "investment",
        departmentLabel: "Investment",
        timeline: [
          "Builds thematic landscape and founder pipeline",
          "Supports diligence and market sizing models",
          "Coordinates post-investment operating reviews",
        ],
        email: "aditya@asvf.com",
        linkedIn: "https://www.linkedin.com/",
      },
    ],
  },
  {
    id: "finance",
    label: "Finance Team",
    members: [
      {
        id: "shweta",
        name: "Shweta Divecha",
        role: "Head of Finance",
        image: heroCollab,
        tagline: "Creating clarity through disciplined fund operations.",
        bio: "Shweta leads finance operations, reporting systems, and LP communication frameworks for scale.",
        department: "finance",
        departmentLabel: "Finance",
        featured: true,
        timeline: [
          "Owns quarterly reporting and audit readiness",
          "Leads fund operations and finance controls",
          "Builds transparent LP communication cadence",
        ],
        email: "shweta@asvf.com",
        linkedIn: "https://www.linkedin.com/",
      },
    ],
  },
  {
    id: "business",
    label: "Business Development Team",
    members: [],
  },
];

export function TeamPage() {
  const [active, setActive] = useState<TeamCategory>("investment");
  const [selectedMember, setSelectedMember] = useState<TeamMemberView | null>(null);
  const activeDepartment = useMemo(
    () => DEPARTMENTS.find((department) => department.id === active) ?? DEPARTMENTS[0],
    [active],
  );

  return (
    <main className="min-h-dvh">
      <SiteHeader />

      <section className="max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-10">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-gold-deep mb-4 text-center">
          Meet The Team
        </p>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight text-center text-navy-ink">
          People Building Long-Term Value
        </h1>
      </section>

      <section className="sticky top-[72px] z-20 max-w-6xl mx-auto px-4 md:px-6 pb-7">
        <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div
            className="mx-auto w-max min-w-full md:min-w-0 flex items-center justify-center gap-1.5 rounded-full border border-navy-ink/10 bg-cream-warm/85 p-1.5 backdrop-blur-sm"
            role="tablist"
            aria-label="Team department filters"
          >
            {DEPARTMENTS.map((department) => {
              const isActive = active === department.id;
              const count = department.members.length;
              return (
                <button
                  key={department.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(department.id)}
                  className={`relative whitespace-nowrap rounded-full px-4 md:px-6 py-2.5 text-sm md:text-base font-semibold transition-all duration-300 hover:scale-[1.02] ${
                    isActive ? "text-navy-ink" : "text-navy-ink/75 hover:text-navy-ink"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-team-pill"
                      className="absolute inset-0 rounded-full border border-[#ead8c2] bg-[#e8d6c1] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
                      transition={{ type: "spring", stiffness: 360, damping: 32 }}
                    />
                  )}
                  <span
                    className={`relative z-10 inline-flex items-center gap-2 ${
                      isActive ? "text-navy-ink" : ""
                    }`}
                  >
                    {department.label}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        isActive
                          ? "bg-navy-ink/10 text-navy-ink/80"
                          : "bg-navy-ink/10 text-navy-ink/75"
                      }`}
                    >
                      {count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24 pt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeDepartment.members.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-navy-ink/20 bg-cream-warm/70 p-12 text-center text-navy-ink/55">
                No team members available
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {activeDepartment.members.map((member, index) => (
                  <motion.article
                    key={member.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.36, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="group relative h-full overflow-hidden rounded-2xl border border-navy-ink/10 bg-cream-warm/70 backdrop-blur-md p-4 sm:p-5 shadow-[0_8px_26px_-18px_rgba(15,23,42,0.35)] hover:shadow-[0_22px_45px_-18px_rgba(15,23,42,0.4)] transition-all duration-300 flex flex-col"
                  >
                    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-amber-brand/10 via-transparent to-navy-ink/10" />
                    <div className="aspect-[3/4] overflow-hidden rounded-xl bg-navy-ink/5">
                      <img
                        src={getImageSrc(member.image)}
                        alt={member.name}
                        className="h-full w-full object-cover grayscale-[25%] group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="relative z-10 flex-1 flex flex-col">
                      <h3 className="mt-4 font-heading text-xl font-bold text-navy-ink">{member.name}</h3>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="rounded-full bg-navy-ink/10 px-2.5 py-1 text-[11px] font-semibold text-navy-ink/80">
                          {member.role}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            member.department === "investment"
                              ? "bg-amber-brand/15 text-amber-800"
                              : member.department === "finance"
                                ? "bg-emerald-500/15 text-emerald-700"
                                : "bg-indigo-500/15 text-indigo-700"
                          }`}
                        >
                          {member.departmentLabel}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-navy-ink/70 min-h-[40px]">{member.tagline}</p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        type="button"
                        onClick={() => setSelectedMember(member)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-navy-ink text-white px-3 py-2 text-xs font-semibold hover:bg-navy-ink/90"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View Profile
                      </button>
                      <a
                        href={`mailto:${member.email}`}
                        className="inline-flex items-center justify-center rounded-lg border border-navy-ink/15 bg-cream-warm/90 px-2.5 py-2 text-navy-ink hover:border-amber-brand/45 hover:text-amber-brand"
                        aria-label={`Email ${member.name}`}
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                      <a
                        href={member.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-lg border border-navy-ink/15 bg-cream-warm/90 px-2.5 py-2 text-navy-ink hover:border-amber-brand/45 hover:text-amber-brand"
                        aria-label={`${member.name} LinkedIn`}
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      <AnimatePresence>
        {selectedMember && (
          <motion.div
            className="fixed inset-0 z-50 bg-navy-ink/50 backdrop-blur-sm p-4 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-8 max-w-3xl rounded-2xl bg-cream-warm border border-navy-ink/10 p-6 md:p-8 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.45)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] uppercase text-gold-deep">
                    Focused View
                  </p>
                  <h3 className="mt-2 font-heading text-3xl font-bold text-navy-ink">
                    {selectedMember.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-navy-ink/70">{selectedMember.role}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="rounded-lg border border-navy-ink/15 p-2 text-navy-ink hover:text-amber-brand hover:border-amber-brand/45"
                  aria-label="Close profile modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-5 text-navy-ink/70 leading-relaxed">{selectedMember.bio}</p>

              <div className="mt-6">
                <p className="text-sm font-bold text-navy-ink">Experience timeline</p>
                <ul className="mt-3 space-y-2">
                  {selectedMember.timeline.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-navy-ink/70">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-brand" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-7 flex flex-wrap gap-2">
                <a
                  href={`mailto:${selectedMember.email}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-navy-ink px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <Mail className="h-4 w-4" />
                  Contact
                </a>
                <a
                  href={selectedMember.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-navy-ink/15 bg-cream-warm/90 px-4 py-2.5 text-sm font-semibold text-navy-ink hover:border-amber-brand/45 hover:text-amber-brand"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SiteFooter />
    </main>
  );
}
