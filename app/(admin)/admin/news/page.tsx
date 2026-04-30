"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ExternalLink, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";

type NewsItem = {
  _id: string;
  title: string;
  content: string;
  image: string;
  date: string;
  externalLink?: string;
};

type NewsApiResponse = {
  success: boolean;
  data?: NewsItem[] | NewsItem;
  message?: string;
};

const INITIAL_FORM = {
  title: "",
  content: "",
  image: "",
  date: "",
  externalLink: "",
};

function shorten(text: string, max = 120) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}...`;
}

function toDateInputValue(input: string) {
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function formatDate(input: string) {
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return "Invalid date";
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function AdminNewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [deletingItem, setDeletingItem] = useState<NewsItem | null>(null);

  const isEditMode = useMemo(() => editingId !== null, [editingId]);

  async function fetchNews() {
    setLoadingList(true);
    setError("");
    try {
      const res = await fetch("/api/news", { cache: "no-store" });
      const result = (await res.json()) as NewsApiResponse;

      if (!res.ok || !result.success) {
        setError(result.message ?? "Failed to fetch news");
        setItems([]);
        return;
      }

      const data = Array.isArray(result.data) ? result.data : [];
      setItems(data);
    } catch {
      setError("Failed to fetch news");
      setItems([]);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    fetchNews();
  }, []);

  function resetForm() {
    setEditingId(null);
    setShowForm(false);
    setForm(INITIAL_FORM);
  }

  function onEdit(item: NewsItem) {
    setSuccess("");
    setError("");
    setEditingId(item._id);
    setForm({
      title: item.title ?? "",
      content: item.content ?? "",
      image: item.image ?? "",
      date: toDateInputValue(item.date),
      externalLink: item.externalLink ?? "",
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
      const res = await fetch("/api/news", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = (await res.json()) as NewsApiResponse;

      if (!res.ok || !result.success) {
        setError(result.message ?? "Failed to delete news item");
        toast.error(result.message ?? "Failed to delete news item");
        return;
      }

      setSuccess("News item deleted");
      toast.success("News item deleted");
      if (editingId === id) resetForm();
      await fetchNews();
    } catch {
      setError("Failed to delete news item");
      toast.error("Failed to delete news item");
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
      content: form.content.trim(),
      image: form.image.trim(),
      date: form.date.trim(),
      externalLink: form.externalLink.trim(),
    };

    if (!payload.title || !payload.content || !payload.image || !payload.date) {
      setError("title, content, image, and date are required");
      toast.error("Title, content, image, and date are required");
      setSubmitting(false);
      return;
    }

    try {
      const method = isEditMode ? "PUT" : "POST";
      const body = isEditMode ? { id: editingId, ...payload } : payload;

      const res = await fetch("/api/news", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await res.json()) as NewsApiResponse;

      if (!res.ok || !result.success) {
        setError(result.message ?? "Failed to save news item");
        toast.error(result.message ?? "Failed to save news item");
        return;
      }

      setSuccess(isEditMode ? "News item updated" : "News item created");
      toast.success(isEditMode ? "News item updated" : "News item created");
      resetForm();
      await fetchNews();
    } catch {
      setError("Failed to save news item");
      toast.error("Failed to save news item");
    } finally {
      setSubmitting(false);
    }
  }

  function initialsFromTitle(title: string) {
    const words = title.trim().split(/\s+/).filter(Boolean);
    return words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("") || "NW";
  }

  return (
    <>
      <main className="min-h-dvh bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-50/60 p-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <header>
            <h1 className="text-2xl font-bold text-navy-ink">News & Events</h1>
            <p className="text-sm text-navy-ink/60">Manage your content with ease</p>
          </header>

          <section className="rounded-2xl border border-navy-ink/10 bg-white p-3 shadow-(--shadow-soft)">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="rounded-xl border border-navy-ink/10 bg-cream-warm px-4 py-2.5 text-sm text-navy-ink/75">
                {items.length} published items
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
                Add news
              </button>
            </div>
          </section>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <section>
            {loadingList ? (
              <div className="rounded-2xl border border-navy-ink/10 bg-white p-6 text-sm text-navy-ink/70">
                Loading news...
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-navy-ink/10 bg-white p-6 text-sm text-navy-ink/60">
                No news items found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <article
                    key={item._id}
                    className="rounded-2xl border border-navy-ink/10 bg-white p-4 shadow-(--shadow-soft)"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-r from-sky-500 to-cyan-400 text-xs font-bold text-white">
                        {initialsFromTitle(item.title)}
                      </span>
                      <span className="rounded-full border border-amber-brand/30 bg-amber-brand/10 px-2 py-0.5 text-xs font-semibold text-gold-deep">
                        {formatDate(item.date)}
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-1 text-lg font-semibold text-navy-ink">{item.title}</p>
                    <p className="mt-1 line-clamp-3 text-sm text-navy-ink/70">{shorten(item.content)}</p>

                    <div className="mt-4 border-t border-navy-ink/10 pt-3">
                      {item.externalLink ? (
                        <a
                          href={item.externalLink}
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

      {(showForm || isEditMode) && (
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
                {isEditMode ? "Edit news" : "Add news"}
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
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                  External link
                </label>
                <input
                  value={form.externalLink}
                  onChange={(e) => setForm((prev) => ({ ...prev, externalLink: e.target.value }))}
                  className="w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
                  placeholder="https://example.com/article"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                  Image
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
                  Content
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                  className="min-h-28 w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
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
            <h3 className="text-lg font-semibold text-navy-ink">Delete news item?</h3>
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
