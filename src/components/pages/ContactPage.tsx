"use client";

import { useState } from "react";
import { z } from "zod";
import { Facebook, Instagram, Linkedin, Mail, Send } from "lucide-react";
import { SiteHeader } from "@/shared/layout/SiteHeader";
import { SiteFooter } from "@/shared/layout/SiteFooter";
import { useSiteSettings } from "@/shared/layout/useSiteSettings";
import { toast } from "sonner";

const contactSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().max(60).optional(),
  organization: z.string().trim().min(1, "Organisation is required").max(120),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(1, "Phone number is required").max(40),
  message: z.string().trim().max(1000).optional(),
});

export function ContactPage() {
  const settings = useSiteSettings();
  const contactEmail = settings.contactEmail || "contact@asvf.com";
  const socialItems = [
    { icon: Facebook, label: "Facebook", href: settings.socialLinks.facebook },
    { icon: Linkedin, label: "LinkedIn", href: settings.socialLinks.linkedin },
    { icon: Instagram, label: "Instagram", href: settings.socialLinks.instagram },
    { icon: Mail, label: "Email", href: contactEmail ? `mailto:${contactEmail}` : "" },
  ];

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    organization: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const e: Record<string, string> = {};
      result.error.issues.forEach((i) => (e[i.path[0] as string] = i.message));
      setErrors(e);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok || !json.success) {
        toast.error(json.message ?? "Failed to send message.");
        return;
      }

      setForm({
        firstName: "",
        lastName: "",
        organization: "",
        email: "",
        phone: "",
        message: "",
      });
      toast.success("Thanks — we'll be in touch shortly.");
    } catch {
      toast.error("Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-dvh text-navy-ink selection:bg-amber-brand/30">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,oklch(0.78_0.17_70/0.08)_0%,transparent_35%),radial-gradient(circle_at_90%_18%,oklch(0.55_0.15_55/0.08)_0%,transparent_35%)]" />

        <div className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-20">
          <div className="text-center max-w-4xl mx-auto mb-14">
            <p className="text-xs font-bold tracking-[0.22em] uppercase text-gold-deep mb-4">
              Contact Us
            </p>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.03] tracking-[-0.03em] text-navy-ink">
              Contact our team
            </h1>
            <p className="mt-6 text-lg md:text-2xl text-navy-ink/68 leading-relaxed">
              Got any questions about product, partnerships, or scaling? We are here to help. Chat
              with our team and get onboard quickly.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            <aside className="lg:col-span-4 h-full rounded-3xl bg-card/80 border border-navy-ink/10 p-7 md:p-8">
              <h2 className="text-[2rem] leading-[1.1] font-extrabold text-amber-brand max-w-[14ch]">
                We are always eager to hear from you!
              </h2>

              <div className="mt-7 space-y-5">
                <div>
                  <p className="text-base font-bold text-navy-ink">Address</p>
                  <p className="mt-2 text-sm leading-relaxed text-navy-ink/72">
                    Confederation of Indian Industry
                    <br />
                    Survey No 64, Kothaguda Post
                    <br />
                    Near Kothaguda Cross Roads
                    <br />
                    Hyderabad - 500 084
                  </p>
                </div>

                <div>
                  <p className="text-base font-bold text-navy-ink">Email</p>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="mt-1 inline-block text-sm font-bold text-gold-deep hover:opacity-80"
                  >
                    {contactEmail}
                  </a>
                </div>

                <div>
                  <p className="text-base font-bold text-navy-ink">Phone</p>
                  <a
                    href="tel:+15550000000"
                    className="mt-1 inline-block text-sm font-bold text-gold-deep hover:opacity-80"
                  >
                    +1 (555) 000-0000
                  </a>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  {socialItems.map(({ icon: Icon, label, href }) => (
                    <a
                      key={label}
                      href={href || "#"}
                      target={href ? "_blank" : undefined}
                      rel={href ? "noreferrer" : undefined}
                      aria-label={label}
                      className="size-9 rounded-full border border-amber-brand/35 text-gold-deep inline-flex items-center justify-center hover:bg-amber-brand/12"
                    >
                      <Icon className="size-4" />
                    </a>
                  ))}
                </div>
              </div>
            </aside>

            <form
              onSubmit={submit}
              className="lg:col-span-8 h-full relative rounded-2xl bg-card p-7 md:p-9 border border-navy-ink/10 space-y-5"
            >
              <div className="pointer-events-none absolute -right-6 -top-6 size-28 rounded-full border border-amber-brand/35 bg-[radial-gradient(circle,oklch(0.78_0.17_70)_1.5px,transparent_1.5px)] [background-size:8px_8px] opacity-20" />
              <div>
                <h2 className="text-2xl font-bold text-navy-ink">Get In Touch</h2>
                <p className="mt-1 text-sm text-navy-ink/65 max-w-[34ch]">
                  Fill out this form and our team will get back quickly.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-navy-ink/65">
                    First name <span className="text-destructive">*</span>
                  </label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    maxLength={60}
                    placeholder="First name"
                    className="mt-2 w-full rounded-xl border border-navy-ink/14 bg-cream-warm/45 px-4 py-3 focus:outline-none focus:border-amber-brand/75"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-destructive">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-navy-ink/65">
                    Last name
                  </label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    maxLength={60}
                    placeholder="Last name"
                    className="mt-2 w-full rounded-xl border border-navy-ink/14 bg-cream-warm/45 px-4 py-3 focus:outline-none focus:border-amber-brand/75"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-navy-ink/65">
                    Organisation <span className="text-destructive">*</span>
                  </label>
                  <input
                    value={form.organization}
                    onChange={(e) => setForm({ ...form, organization: e.target.value })}
                    maxLength={120}
                    placeholder="Your organisation"
                    className="mt-2 w-full rounded-xl border border-navy-ink/14 bg-cream-warm/45 px-4 py-3 focus:outline-none focus:border-amber-brand/75"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-navy-ink/65">
                    Phone number <span className="text-destructive">*</span>
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    maxLength={40}
                    placeholder="+1 (555) 000-0000"
                    className="mt-2 w-full rounded-xl border border-navy-ink/14 bg-cream-warm/45 px-4 py-3 focus:outline-none focus:border-amber-brand/75"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-navy-ink/65">
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  maxLength={255}
                  placeholder="you@company.com"
                  className="mt-2 w-full rounded-xl border border-navy-ink/14 bg-cream-warm/45 px-4 py-3 focus:outline-none focus:border-amber-brand/75"
                />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-navy-ink/65">
                  Message
                </label>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  maxLength={1000}
                  placeholder="Your message"
                  className="mt-2 w-full rounded-xl border border-navy-ink/14 bg-cream-warm/45 px-4 py-3 resize-none focus:outline-none focus:border-amber-brand/75"
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-destructive">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-brand px-6 py-3 text-navy-ink font-bold hover:bg-amber-glow disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Submit Message"} <Send className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
