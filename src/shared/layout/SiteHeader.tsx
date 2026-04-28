"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/asvf-logo.png";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/team", label: "Team" },
  { to: "/news", label: "News & Events" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setOpen(false);

  const isLinkActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-navy-ink/10 bg-cream-warm/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto h-16 md:h-20 px-4 md:px-6 flex items-center justify-between gap-4">
        <Link href="/" onClick={closeMenu} className="shrink-0">
          <img
            src={typeof logo === "string" ? logo : logo.src}
            alt="Amazon Smbhav Venture Fund"
            className="h-8 md:h-9 w-auto object-contain"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-1 rounded-full border border-navy-ink/10 bg-cream-warm/80 p-1">
          {links.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              prefetch
              onClick={closeMenu}
              className="relative rounded-full min-w-[108px] text-center px-3.5 py-2 text-[16px] font-semibold text-navy-ink/80 hover:text-navy-ink transition-colors"
            >
              {isLinkActive(link.to) && (
                <span className="absolute inset-0 rounded-full border border-[#ead8c2] bg-[#e8d6c1] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]" />
              )}
              <span className={`relative z-10 ${isLinkActive(link.to) ? "text-navy-ink" : ""}`}>
                {link.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center">
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full bg-amber-brand px-5 py-2.5 text-[16px] font-bold text-navy-ink hover:bg-amber-glow transition-colors shadow-[0_10px_22px_-12px_rgba(180,83,9,0.62)]"
          >
            Got an idea? Speak to us
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-navy-ink/15 bg-cream-warm text-navy-ink"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-navy-ink/10 bg-cream-warm px-4 py-4">
          <div className="flex flex-col gap-1.5">
            {links.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                prefetch
                onClick={closeMenu}
                className={`rounded-xl px-3.5 py-2.5 text-[18px] font-semibold transition-colors ${
                  isLinkActive(link.to)
                    ? "bg-[#e8d6c1] text-navy-ink border border-[#ead8c2] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
                    : "text-navy-ink/85 hover:text-navy-ink hover:bg-navy-ink/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href="/contact"
            onClick={closeMenu}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-amber-brand px-4 py-2.5 text-[18px] font-bold text-navy-ink"
          >
            Got an idea? Speak to us
          </Link>
        </div>
      )}
    </header>
  );
}
