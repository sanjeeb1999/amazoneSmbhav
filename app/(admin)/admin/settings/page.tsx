"use client";

import { FormEvent, useEffect, useState } from "react";
import { Mail, Share2, SlidersHorizontal, Upload } from "lucide-react";
import toast from "react-hot-toast";

type SettingsData = {
  siteTitle: string;
  logo: string;
  contactEmail: string;
  socialLinks: {
    facebook: string;
    linkedin: string;
    twitter: string;
    instagram: string;
  };
};

type SettingsApiResponse = {
  success: boolean;
  data?: {
    siteTitle?: unknown;
    logo?: unknown;
    contactEmail?: unknown;
    socialLinks?: unknown;
  };
  message?: string;
};

const INITIAL_SETTINGS: SettingsData = {
  siteTitle: "",
  logo: "",
  contactEmail: "",
  socialLinks: {
    facebook: "",
    linkedin: "",
    twitter: "",
    instagram: "",
  },
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsData>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"general" | "contact" | "social">("general");

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        const result = (await res.json()) as SettingsApiResponse;

        if (!res.ok || !result.success) {
          if (!cancelled) setError(result.message ?? "Failed to load settings");
          return;
        }

        const data = result.data;
        if (!data || typeof data !== "object") return;

        const social =
          typeof data.socialLinks === "object" && data.socialLinks !== null
            ? (data.socialLinks as Record<string, unknown>)
            : {};

        if (!cancelled) {
          setForm({
            siteTitle: typeof data.siteTitle === "string" ? data.siteTitle : "",
            logo: typeof data.logo === "string" ? data.logo : "",
            contactEmail: typeof data.contactEmail === "string" ? data.contactEmail : "",
            socialLinks: {
              facebook: typeof social.facebook === "string" ? social.facebook : "",
              linkedin: typeof social.linkedin === "string" ? social.linkedin : "",
              twitter: typeof social.twitter === "string" ? social.twitter : "",
              instagram: typeof social.instagram === "string" ? social.instagram : "",
            },
          });
        }
      } catch {
        if (!cancelled) setError("Failed to load settings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess("");
    setError("");
    setSaving(true);

    try {
      const payload = {
        siteTitle: form.siteTitle.trim(),
        logo: form.logo.trim(),
        contactEmail: form.contactEmail.trim(),
        socialLinks: {
          facebook: form.socialLinks.facebook.trim(),
          linkedin: form.socialLinks.linkedin.trim(),
          twitter: form.socialLinks.twitter.trim(),
          instagram: form.socialLinks.instagram.trim(),
        },
      };

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await res.json()) as SettingsApiResponse;
      if (!res.ok || !result.success) {
        setError(result.message ?? "Failed to save settings");
        toast.error(result.message ?? "Failed to save settings");
        return;
      }

      setSuccess("Settings saved successfully");
      toast.success("Settings saved successfully");
    } catch {
      setError("Failed to save settings");
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  function onLogoFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, WEBP, or SVG logos are allowed");
      toast.error("Only JPG, PNG, WEBP, or SVG logos are allowed");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) {
        setError("Failed to read selected logo");
        toast.error("Failed to read selected logo");
        return;
      }
      setError("");
      setForm((prev) => ({ ...prev, logo: result }));
    };
    reader.onerror = () => setError("Failed to read selected logo");
    reader.readAsDataURL(file);
  }

  return (
    <main className="min-h-dvh bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-50/60 p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <header>
          <h1 className="text-2xl font-bold text-navy-ink">Settings</h1>
          <p className="text-sm text-navy-ink/60">Manage your content with ease</p>
        </header>

        <section className="rounded-2xl border border-navy-ink/10 bg-white p-2 shadow-(--shadow-soft)">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === "general"
                  ? "bg-linear-to-r from-amber-brand to-gold-deep text-white shadow-(--shadow-amber)"
                  : "text-navy-ink/70 hover:bg-cream-warm"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              General
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("contact")}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === "contact"
                  ? "bg-linear-to-r from-amber-brand to-gold-deep text-white shadow-(--shadow-amber)"
                  : "text-navy-ink/70 hover:bg-cream-warm"
              }`}
            >
              <Mail className="h-4 w-4" />
              Contact Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("social")}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === "social"
                  ? "bg-linear-to-r from-amber-brand to-gold-deep text-white shadow-(--shadow-amber)"
                  : "text-navy-ink/70 hover:bg-cream-warm"
              }`}
            >
              <Share2 className="h-4 w-4" />
              Social Links
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-navy-ink/10 bg-white p-6 shadow-(--shadow-soft)">
          <h2 className="text-xl font-bold text-navy-ink">
            {activeTab === "general" ? "General" : activeTab === "contact" ? "Contact Info" : "Social Links"}
          </h2>
          <p className="mt-1 text-sm text-navy-ink/60">
            {activeTab === "general"
              ? "Site identity and branding"
              : activeTab === "contact"
                ? "Primary contact details"
                : "Public social media links"}
          </p>

          {loading ? (
            <p className="mt-6 text-sm text-navy-ink/70">Loading settings...</p>
          ) : (
            <form className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={onSubmit}>
              {activeTab === "general" && (
                <>
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                      Brand Name
                    </label>
                    <input
                      value={form.siteTitle}
                      onChange={(e) => setForm((prev) => ({ ...prev, siteTitle: e.target.value }))}
                      className="w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
                      placeholder="ASVF"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                      Logo
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-navy-ink/20 bg-cream-warm text-navy-ink/50">
                        <Upload className="h-5 w-5" />
                      </div>
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-navy-ink/15 bg-white px-4 py-2 text-sm font-semibold text-navy-ink hover:bg-cream-warm">
                        <Upload className="h-4 w-4" />
                        Upload
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml"
                          onChange={onLogoFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <input
                      type="url"
                      value={form.logo}
                      onChange={(e) => setForm((prev) => ({ ...prev, logo: e.target.value }))}
                      className="mt-3 w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
                      placeholder="Or paste logo URL"
                    />
                  </div>
                </>
              )}

              {activeTab === "contact" && (
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
                    placeholder="contact@asvf.com"
                  />
                </div>
              )}

              {activeTab === "social" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={form.socialLinks.facebook}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, facebook: e.target.value },
                        }))
                      }
                      className="w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
                      placeholder="https://facebook.com/your-page"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={form.socialLinks.linkedin}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, linkedin: e.target.value },
                        }))
                      }
                      className="w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
                      placeholder="https://linkedin.com/company/your-company"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                      Twitter
                    </label>
                    <input
                      type="url"
                      value={form.socialLinks.twitter}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, twitter: e.target.value },
                        }))
                      }
                      className="w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
                      placeholder="https://twitter.com/your-handle"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={form.socialLinks.instagram}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, instagram: e.target.value },
                        }))
                      }
                      className="w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
                      placeholder="https://instagram.com/your-handle"
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2 flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="min-w-[140px] rounded-xl bg-linear-to-r from-amber-brand to-gold-deep px-5 py-2.5 text-sm font-semibold text-white shadow-(--shadow-amber) disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save settings"}
                </button>
              </div>
            </form>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </section>
      </div>
    </main>
  );
}
