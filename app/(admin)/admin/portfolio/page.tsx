"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ExternalLink, Pencil, Plus, Search, Trash2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";

type PortfolioItem = {
  _id: string;
  title: string;
  description: string;
  highlight?: string;
  image: string;
  category: string;
  link?: string;
};

type PortfolioApiResponse = {
  success: boolean;
  data?: PortfolioItem[] | PortfolioItem;
  message?: string;
};

const INITIAL_FORM = {
  title: "",
  description: "",
  highlight: "",
  image: "",
  category: "",
  link: "",
};

export default function AdminPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [sectorFilter, setSectorFilter] = useState("all");
  const [form, setForm] = useState(INITIAL_FORM);
  const [deletingItem, setDeletingItem] = useState<PortfolioItem | null>(null);

  const isEditMode = useMemo(() => editingId !== null, [editingId]);

  async function fetchPortfolio() {
    setLoadingList(true);
    setError("");
    try {
      const res = await fetch("/api/portfolio", { cache: "no-store" });
      const result = (await res.json()) as PortfolioApiResponse;

      if (!res.ok || !result.success) {
        setError(result.message ?? "Failed to fetch portfolio");
        setItems([]);
        return;
      }

      const data = Array.isArray(result.data) ? result.data : [];
      setItems(data);
    } catch {
      setError("Failed to fetch portfolio");
      setItems([]);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    fetchPortfolio();
  }, []);

  function resetForm() {
    setEditingId(null);
    setShowForm(false);
    setForm(INITIAL_FORM);
  }

  function onEdit(item: PortfolioItem) {
    setSuccess("");
    setError("");
    setEditingId(item._id);
    setForm({
      title: item.title ?? "",
      description: item.description ?? "",
      highlight: item.highlight ?? "",
      image: item.image ?? "",
      category: item.category ?? "",
      link: item.link ?? "",
    });
    setShowForm(true);
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
      const res = await fetch("/api/portfolio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = (await res.json()) as PortfolioApiResponse;

      if (!res.ok || !result.success) {
        setError(result.message ?? "Failed to delete portfolio item");
        toast.error(result.message ?? "Failed to delete portfolio item");
        return;
      }

      setSuccess("Portfolio item deleted");
      toast.success("Portfolio item deleted");
      if (editingId === id) resetForm();
      await fetchPortfolio();
    } catch {
      setError("Failed to delete portfolio item");
      toast.error("Failed to delete portfolio item");
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
      description: form.description.trim(),
      highlight: form.highlight.trim(),
      image: form.image.trim(),
      category: form.category.trim(),
      link: form.link.trim(),
    };

    if (!payload.title || !payload.description || !payload.image || !payload.category) {
      setError("title, description, image, and category are required");
      toast.error("Title, description, image, and category are required");
      setSubmitting(false);
      return;
    }

    try {
      const method = isEditMode ? "PUT" : "POST";
      const body = isEditMode ? { id: editingId, ...payload } : payload;

      const res = await fetch("/api/portfolio", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await res.json()) as PortfolioApiResponse;

      if (!res.ok || !result.success) {
        setError(result.message ?? "Failed to save portfolio item");
        toast.error(result.message ?? "Failed to save portfolio item");
        return;
      }

      setSuccess(isEditMode ? "Portfolio item updated" : "Portfolio item created");
      toast.success(isEditMode ? "Portfolio item updated" : "Portfolio item created");
      resetForm();
      await fetchPortfolio();
    } catch {
      setError("Failed to save portfolio item");
      toast.error("Failed to save portfolio item");
    } finally {
      setSubmitting(false);
    }
  }

  const categoryOptions = useMemo(() => {
    const normalized = items
      .map((item) => item.category?.trim())
      .filter((value): value is string => Boolean(value));
    return ["all", ...Array.from(new Set(normalized))];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (sectorFilter === "all") return items;
    return items.filter((item) => item.category === sectorFilter);
  }, [items, sectorFilter]);

  function initialsFromTitle(title: string) {
    const words = title.trim().split(/\s+/).filter(Boolean);
    const joined = words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("");
    return joined || "PF";
  }

  const isDrawerOpen = showForm || isEditMode;

  return (
    <>
      <main className="min-h-dvh bg-linear-to-br from-slate-50 via-sky-50/40 to-indigo-50/60 p-6">
        <div className="mx-auto max-w-7xl space-y-5">
        <header>
          <h1 className="text-2xl font-bold text-navy-ink">Portfolio</h1>
          <p className="text-sm text-navy-ink/60">Manage your content with ease</p>
        </header>

        <section className="rounded-2xl border border-navy-ink/10 bg-white p-3 shadow-(--shadow-soft)">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-ink/40" />
              <select
                value={sectorFilter}
                onChange={(event) => setSectorFilter(event.target.value)}
                className="w-full rounded-xl border border-navy-ink/10 bg-cream-warm py-2.5 pl-9 pr-3 text-sm text-navy-ink outline-none focus:border-amber-brand"
              >
                <option value="all">All sectors</option>
                {categoryOptions
                  .filter((option) => option !== "all")
                  .map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setEditingId(null);
                setForm(INITIAL_FORM);
                setShowForm((prev) => !prev);
              }}
              className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-brand to-gold-deep px-4 py-2.5 text-sm font-semibold text-white shadow-(--shadow-amber)"
            >
              <Plus className="h-4 w-4" />
              {showForm ? "Close form" : "Add company"}
            </button>
          </div>
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <section>
          {loadingList ? (
            <div className="rounded-2xl border border-navy-ink/10 bg-white p-6 text-sm text-navy-ink/70">
              Loading portfolio...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-navy-ink/10 bg-white p-6 text-sm text-navy-ink/60">
              No portfolio items found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <article
                  key={item._id}
                  className="rounded-2xl border border-navy-ink/10 bg-white p-4 shadow-(--shadow-soft)"
                >
                  <div className="flex items-start justify-between">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-r from-sky-500 to-cyan-400 text-xs font-bold text-white">
                      {initialsFromTitle(item.title)}
                    </span>
                    <span className="rounded-full border border-amber-brand/30 bg-amber-brand/10 px-2 py-0.5 text-[11px] font-semibold text-gold-deep">
                      {item.category}
                    </span>
                  </div>

                  <p className="mt-3 text-lg font-semibold text-navy-ink">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-navy-ink/70">{item.description}</p>

                  <div className="mt-4 border-t border-navy-ink/10 pt-3">
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-gold-deep hover:text-amber-brand"
                      >
                        Visit <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <span className="text-sm text-navy-ink/40">No external link</span>
                    )}

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
                {isEditMode ? "Edit company" : "Add company"}
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
                  Name
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
                  Sector
                </label>
                <input
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                  Website
                </label>
                <input
                  value={form.link}
                  onChange={(e) => setForm((prev) => ({ ...prev, link: e.target.value }))}
                  className="w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
                  placeholder="https://"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                  Logo
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

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="min-h-28 w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                  Why it stands out
                </label>
                <textarea
                  value={form.highlight}
                  onChange={(e) => setForm((prev) => ({ ...prev, highlight: e.target.value }))}
                  className="min-h-24 w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
                  placeholder="Short highlight shown in portfolio modal"
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
            <h3 className="text-lg font-semibold text-navy-ink">Delete company?</h3>
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
