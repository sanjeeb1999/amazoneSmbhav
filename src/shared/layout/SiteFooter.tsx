import Link from "next/link";
import logo from "@/assets/asvf-logo.png";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-navy-ink/10 bg-cream-warm/70">
      <div className="max-w-7xl mx-auto px-6 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <img
            src={typeof logo === "string" ? logo : logo.src}
            alt="Amazon Smbhav Venture Fund"
            className="h-9 w-auto object-contain"
          />
          <p className="text-sm text-navy-ink/60 mt-2 max-w-xs">
            Partnering with visionary founders to scale category-defining companies globally.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-bold mb-3 text-navy-ink">Explore</p>
          <ul className="space-y-2 text-navy-ink/70">
            <li>
              <Link href="/about" className="hover:text-amber-brand">
                About
              </Link>
            </li>
            <li>
              <Link href="/portfolio" className="hover:text-amber-brand">
                Portfolio
              </Link>
            </li>
            <li>
              <Link href="/team" className="hover:text-amber-brand">
                Team
              </Link>
            </li>
            <li>
              <Link href="/news" className="hover:text-amber-brand">
                News
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-bold mb-3 text-navy-ink">Contact</p>
          <a href="mailto:contact@asvf.com" className="text-amber-brand font-semibold">
            contact@asvf.com
          </a>
          <p className="text-navy-ink/50 mt-6 text-xs">
            © {new Date().getFullYear()} ASVF Venture Fund
          </p>
        </div>
      </div>
    </footer>
  );
}
