"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";

type BannerItem = {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaLabel: string;
  ctaTo: string;
};

type BannerApiResponse = {
  success: boolean;
  data?: BannerItem[] | BannerItem;
  message?: string;
};

const INITIAL_FORM = {
  title: "",
  subtitle: "",
  description: "",
  image: "",
  ctaLabel: "",
  ctaTo: "",
};

const DEFAULT_CTA_LABEL = "Get in Touch";
const DEFAULT_CTA_TO = "/contact";

export default function AdminBannerPage() {
  const [items, setItems] = useState<BannerItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [deletingItem, setDeletingItem] = useState<BannerItem | null>(null);

  const isEditMode = useMemo(() => editingId !== null, [editingId]);

  async function fetchBanners() {
    setLoadingList(true);
    setError("");
    try {
      const res = await fetch("/api/banner", { cache: "no-store" });
      const result = (await res.json()) as BannerApiResponse;

      if (!res.ok || !result.success) {
        setError(result.message ?? "Failed to fetch banners");
        setItems([]);
        return;
      }

      const data = Array.isArray(result.data) ? result.data : [];
      const normalized = data.map((item) => ({
        ...item,
        description: item.description || item.subtitle || "",
        ctaLabel: item.ctaLabel || DEFAULT_CTA_LABEL,
        ctaTo: item.ctaTo || DEFAULT_CTA_TO,
      }));
      setItems(normalized);
    } catch {
      setError("Failed to fetch banners");
      setItems([]);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    fetchBanners();
  }, []);

  function resetForm() {
    setEditingId(null);
    setShowForm(false);
    setForm(INITIAL_FORM);
  }

  function onEdit(item: BannerItem) {
    setSuccess("");
    setError("");
    setEditingId(item._id);
    setShowForm(true);
    setForm({
      title: item.title ?? "",
      subtitle: item.subtitle ?? "",
      description: item.description ?? "",
      image: item.image ?? "",
      ctaLabel: item.ctaLabel || DEFAULT_CTA_LABEL,
      ctaTo: item.ctaTo || DEFAULT_CTA_TO,
    });
  }

  function onImageFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, JPEG, or PNG images are allowed");
      toast.error("Only JPG, JPEG, or PNG images are allowed");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) {
        setError("Failed to read selected image");
        toast.error("Failed to read selected image");
        return;
      }
      setError("");
      setForm((prev) => ({ ...prev, image: result }));
    };
    reader.onerror = () => setError("Failed to read selected image");
    reader.readAsDataURL(file);
  }

  async function onDelete(id: string) {
    setSuccess("");
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/banner", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = (await res.json()) as BannerApiResponse;

      if (!res.ok || !result.success) {
        setError(result.message ?? "Failed to delete banner");
        toast.error(result.message ?? "Failed to delete banner");
        return;
      }

      setSuccess("Banner deleted");
      toast.success("Banner deleted");
      if (editingId === id) resetForm();
      await fetchBanners();
    } catch {
      setError("Failed to delete banner");
      toast.error("Failed to delete banner");
    } finally {
      setSubmitting(false);
      setDeletingItem(null);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess("");
    setError("");
    setSubmitting(true);

    const payload: Record<string, string> = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      ctaLabel: form.ctaLabel.trim(),
      ctaTo: form.ctaTo.trim(),
    };

    if (
      !payload.title ||
      !payload.subtitle ||
      !payload.description ||
      !payload.image ||
      !payload.ctaLabel ||
      !payload.ctaTo
    ) {
      setError("All fields are required");
      toast.error("All fields are required");
      setSubmitting(false);
      return;
    }

    try {
      const method = isEditMode ? "PUT" : "POST";
      const body = isEditMode ? { id: editingId, ...payload } : payload;

      const res = await fetch("/api/banner", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await res.json()) as BannerApiResponse;

      if (!res.ok || !result.success) {
        setError(result.message ?? "Failed to save banner");
        toast.error(result.message ?? "Failed to save banner");
        return;
      }

      setSuccess(isEditMode ? "Banner updated" : "Banner created");
      toast.success(isEditMode ? "Banner updated" : "Banner created");
      resetForm();
      await fetchBanners();
    } catch {
      setError("Failed to save banner");
      toast.error("Failed to save banner");
    } finally {
      setSubmitting(false);
    }
  }

  function initialsFromTitle(title: string) {
    const words = title.trim().split(/\s+/).filter(Boolean);
    return words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("") || "BN";
  }

  const isDrawerOpen = showForm || isEditMode;

  return (
    <>
      <main className="min-h-dvh bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-50/60 p-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <header>
            <h1 className="text-2xl font-bold text-navy-ink">Banner</h1>
            <p className="text-sm text-navy-ink/60">Manage your content with ease</p>
          </header>

          <section className="rounded-2xl border border-navy-ink/10 bg-white p-3 shadow-(--shadow-soft)">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="rounded-xl border border-navy-ink/10 bg-cream-warm px-4 py-2.5 text-sm text-navy-ink/75">
                {items.length} banners
              </p>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setEditingId(null);
                  setForm(INITIAL_FORM);
                  setShowForm(true);
                }}
                className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-brand to-gold-deep px-4 py-2.5 text-sm font-semibold text-white shadow-(--shadow-amber)"
              >
                <Plus className="h-4 w-4" />
                Add banner
              </button>
            </div>
          </section>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <section>
            {loadingList ? (
              <div className="rounded-2xl border border-navy-ink/10 bg-white p-6 text-sm text-navy-ink/70">
                Loading banners...
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-navy-ink/10 bg-white p-6 text-sm text-navy-ink/60">
                No banners found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <article
                    key={item._id}
                    className="rounded-2xl border border-navy-ink/10 bg-white p-4 shadow-(--shadow-soft)"
                  >
                    <div className="flex items-start justify-between">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-r from-sky-500 to-cyan-400 text-xs font-bold text-white">
                        {initialsFromTitle(item.title)}
                      </span>
                    </div>

                    <p className="mt-3 text-lg font-semibold text-navy-ink">{item.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-navy-ink/70">{item.subtitle}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-navy-ink/60">{item.description}</p>

                    <div className="mt-4 border-t border-navy-ink/10 pt-3">
                      <span className="text-sm text-navy-ink/65">
                        Button: {item.ctaLabel} ({item.ctaTo})
                      </span>
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="rounded-md p-1.5 text-navy-ink/70 hover:bg-navy-ink/5 hover:text-navy-ink"
                          aria-label={`Edit ${item.title}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => setDeletingItem(item)}
                          className="rounded-md p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-60"
                          aria-label={`Delete ${item.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-40 flex">
          <button
            type="button"
            className="h-full flex-1 bg-navy-ink/35 backdrop-blur-[1px]"
            onClick={() => {
              if (!submitting) resetForm();
            }}
            aria-label="Close panel"
          />

          <aside className="h-full w-full max-w-xl overflow-y-auto border-l border-navy-ink/10 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight text-navy-ink">
                {isEditMode ? "Edit banner" : "Add banner"}
              </h2>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg p-2 text-navy-ink/55 transition hover:bg-navy-ink/5 hover:text-navy-ink"
                aria-label="Close panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={onSubmit}>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                  Title
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                  Subtitle
                </label>
                <input
                  value={form.subtitle}
                  onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
                  rows={3}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                  Banner image
                </label>
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-navy-ink/20 bg-cream-warm text-navy-ink/50">
                    <Upload className="h-5 w-5" />
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-navy-ink/15 bg-white px-4 py-2 text-sm font-semibold text-navy-ink hover:bg-cream-warm">
                    <Upload className="h-4 w-4" />
                    Upload
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      onChange={onImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  value={form.image}
                  onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                  className="mt-3 w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
                  placeholder="Or paste image URL"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                  Button label
                </label>
                <input
                  value={form.ctaLabel}
                  onChange={(e) => setForm((prev) => ({ ...prev, ctaLabel: e.target.value }))}
                  className="w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
                  placeholder="Get in Touch"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                  Button URL
                </label>
                <input
                  value={form.ctaTo}
                  onChange={(e) => setForm((prev) => ({ ...prev, ctaTo: e.target.value }))}
                  className="w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
                  placeholder="/contact"
                  required
                />
              </div>

              <div className="md:col-span-2 flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-linear-to-r from-amber-brand to-gold-deep px-4 py-2.5 text-sm font-semibold text-white shadow-(--shadow-amber) disabled:opacity-60"
                >
                  {submitting ? "Saving..." : isEditMode ? "Save changes" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-navy-ink/15 bg-white px-6 py-2.5 text-sm font-semibold text-navy-ink"
                >
                  Cancel
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}

      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-ink/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-navy-ink/10 bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-navy-ink">Delete banner?</h3>
            <p className="mt-1 text-sm text-navy-ink/65">
              This will permanently remove <span className="font-semibold">{deletingItem.title}</span>.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="rounded-xl border border-navy-ink/15 bg-white px-4 py-2 text-sm font-semibold text-navy-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => onDelete(deletingItem._id)}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
