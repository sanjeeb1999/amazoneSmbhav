"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type BannerItem = {
  _id: string;
  title: string;
  subtitle: string;
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
    setForm(INITIAL_FORM);
  }

  function onEdit(item: BannerItem) {
    setSuccess("");
    setError("");
    setEditingId(item._id);
    setForm({
      title: item.title ?? "",
      subtitle: item.subtitle ?? "",
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
      image: form.image.trim(),
      ctaLabel: form.ctaLabel.trim(),
      ctaTo: form.ctaTo.trim(),
    };

    if (
      !payload.title ||
      !payload.subtitle ||
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

  return (
    <main className="min-h-dvh bg-cream-warm p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-2xl border border-navy-ink/10 bg-card p-6 shadow-(--shadow-soft)">
          <h1 className="text-2xl font-bold text-navy-ink">Banner Management</h1>
          <p className="mt-1 text-sm text-navy-ink/70">
            Create, edit, and delete homepage banners.
          </p>

          <form className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-navy-ink">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-lg border border-navy-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-amber-brand"
                placeholder="Banner title"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-navy-ink">Subtitle</label>
              <input
                value={form.subtitle}
                onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                className="w-full rounded-lg border border-navy-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-amber-brand"
                placeholder="Banner subtitle"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-navy-ink">Image URL</label>
              <input
                value={form.image}
                onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                className="w-full rounded-lg border border-navy-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-amber-brand"
                placeholder="https://example.com/banner.jpg"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-navy-ink">
                Or Upload Image (JPG/JPEG/PNG)
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={onImageFileChange}
                className="w-full rounded-lg border border-navy-ink/20 bg-white px-3 py-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-navy-ink file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-navy-ink">Button Label</label>
              <input
                value={form.ctaLabel}
                onChange={(e) => setForm((prev) => ({ ...prev, ctaLabel: e.target.value }))}
                className="w-full rounded-lg border border-navy-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-amber-brand"
                placeholder="Explore Portfolio"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-navy-ink">Button URL</label>
              <input
                value={form.ctaTo}
                onChange={(e) => setForm((prev) => ({ ...prev, ctaTo: e.target.value }))}
                className="w-full rounded-lg border border-navy-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-amber-brand"
                placeholder="/portfolio"
                required
              />
            </div>

            <div className="md:col-span-2 flex flex-wrap items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-navy-ink px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Saving..." : isEditMode ? "Update Banner" : "Create Banner"}
              </button>

              {isEditMode && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-navy-ink/20 bg-white px-4 py-2.5 text-sm font-semibold text-navy-ink"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </section>

        <section className="rounded-2xl border border-navy-ink/10 bg-card p-6 shadow-(--shadow-soft)">
          <h2 className="text-lg font-semibold text-navy-ink">All Banners</h2>

          {loadingList ? (
            <p className="mt-4 text-sm text-navy-ink/70">Loading banners...</p>
          ) : items.length === 0 ? (
            <p className="mt-4 text-sm text-navy-ink/60">No banners found.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col gap-4 rounded-xl border border-navy-ink/10 bg-white p-4 md:flex-row md:items-start md:justify-between"
                >
                  <div className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-16 w-24 rounded-md border border-navy-ink/10 object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-navy-ink">{item.title}</p>
                      <p className="mt-1 text-sm text-navy-ink/70">{item.subtitle}</p>
                      <p className="mt-1 text-xs text-navy-ink/60">
                        Button: {item.ctaLabel} ({item.ctaTo})
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="rounded-lg border border-navy-ink/20 bg-white px-3 py-1.5 text-sm font-medium text-navy-ink"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => setDeletingItem(item)}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

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
    </main>
  );
}
