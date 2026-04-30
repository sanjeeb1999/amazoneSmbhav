"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";

type TeamItem = {
  _id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  category: string;
};

type TeamApiResponse = {
  success: boolean;
  data?: TeamItem[] | TeamItem;
  message?: string;
};

const INITIAL_FORM = {
  name: "",
  role: "",
  image: "",
  bio: "",
  category: "",
};

function shorten(text: string, max = 110) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}...`;
}

export default function AdminTeamPage() {
  const [items, setItems] = useState<TeamItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [deletingItem, setDeletingItem] = useState<TeamItem | null>(null);

  const isEditMode = useMemo(() => editingId !== null, [editingId]);

  async function fetchTeam() {
    setLoadingList(true);
    setError("");
    try {
      const res = await fetch("/api/team", { cache: "no-store" });
      const result = (await res.json()) as TeamApiResponse;

      if (!res.ok || !result.success) {
        setError(result.message ?? "Failed to fetch team");
        setItems([]);
        return;
      }

      const data = Array.isArray(result.data) ? result.data : [];
      setItems(data);
    } catch {
      setError("Failed to fetch team");
      setItems([]);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    fetchTeam();
  }, []);

  function resetForm() {
    setEditingId(null);
    setShowForm(false);
    setForm(INITIAL_FORM);
  }

  function onEdit(item: TeamItem) {
    setSuccess("");
    setError("");
    setEditingId(item._id);
    setForm({
      name: item.name ?? "",
      role: item.role ?? "",
      image: item.image ?? "",
      bio: item.bio ?? "",
      category: item.category ?? "",
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
      const res = await fetch("/api/team", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = (await res.json()) as TeamApiResponse;

      if (!res.ok || !result.success) {
        setError(result.message ?? "Failed to delete team member");
        toast.error(result.message ?? "Failed to delete team member");
        return;
      }

      setSuccess("Team member deleted");
      toast.success("Team member deleted");
      if (editingId === id) resetForm();
      await fetchTeam();
    } catch {
      setError("Failed to delete team member");
      toast.error("Failed to delete team member");
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
      name: form.name.trim(),
      role: form.role.trim(),
      image: form.image.trim(),
      bio: form.bio.trim(),
      category: form.category,
    };

    if (!payload.name || !payload.role || !payload.image || !payload.bio || !payload.category) {
      setError("name, role, image, bio, and category are required");
      toast.error("Name, role, image, bio, and category are required");
      setSubmitting(false);
      return;
    }

    try {
      const method = isEditMode ? "PUT" : "POST";
      const body = isEditMode ? { id: editingId, ...payload } : payload;

      const res = await fetch("/api/team", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await res.json()) as TeamApiResponse;

      if (!res.ok || !result.success) {
        setError(result.message ?? "Failed to save team member");
        toast.error(result.message ?? "Failed to save team member");
        return;
      }

      setSuccess(isEditMode ? "Team member updated" : "Team member created");
      toast.success(isEditMode ? "Team member updated" : "Team member created");
      resetForm();
      await fetchTeam();
    } catch {
      setError("Failed to save team member");
      toast.error("Failed to save team member");
    } finally {
      setSubmitting(false);
    }
  }

  function initialsFromName(name: string) {
    const words = name.trim().split(/\s+/).filter(Boolean);
    return words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("") || "TM";
  }

  return (
    <>
      <main className="min-h-dvh bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-50/60 p-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <header>
            <h1 className="text-2xl font-bold text-navy-ink">Team</h1>
            <p className="text-sm text-navy-ink/60">Manage your content with ease</p>
          </header>

          <section className="rounded-2xl border border-navy-ink/10 bg-white p-3 shadow-(--shadow-soft)">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="rounded-xl border border-navy-ink/10 bg-cream-warm px-4 py-2.5 text-sm text-navy-ink/75">
                {items.length} team members
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
                Add member
              </button>
            </div>
          </section>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <section>
            {loadingList ? (
              <div className="rounded-2xl border border-navy-ink/10 bg-white p-6 text-sm text-navy-ink/70">
                Loading team...
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-navy-ink/10 bg-white p-6 text-sm text-navy-ink/60">
                No team members found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <article
                    key={item._id}
                    className="rounded-2xl border border-navy-ink/10 bg-white p-4 shadow-(--shadow-soft)"
                  >
                    <div className="flex gap-3">
                      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-r from-sky-500 to-cyan-400 text-sm font-bold text-white">
                        {initialsFromName(item.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-lg font-semibold text-navy-ink">{item.name}</p>
                        <p className="text-sm font-medium text-gold-deep">{item.role}</p>
                        <p className="mt-2 text-sm text-navy-ink/65">{shorten(item.bio, 85)}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2 border-t border-navy-ink/10 pt-3">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="rounded-md p-1.5 text-navy-ink/70 hover:bg-navy-ink/5 hover:text-navy-ink"
                        aria-label={`Edit ${item.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => setDeletingItem(item)}
                        className="rounded-md p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-60"
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
                {isEditMode ? "Edit member" : "Add member"}
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
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                  Role
                </label>
                <input
                  value={form.role}
                  onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                  Category
                </label>
                <input
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
                  placeholder="Investment / Growth / Operations"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                  Photo
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
                  placeholder="Or paste photo URL"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                  Description
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
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
            <h3 className="text-lg font-semibold text-navy-ink">Delete team member?</h3>
            <p className="mt-1 text-sm text-navy-ink/65">
              This will permanently remove <span className="font-semibold">{deletingItem.name}</span>.
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
