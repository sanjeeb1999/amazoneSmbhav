"use client";

import { FormEvent, useEffect, useState } from "react";
import { Mail, Pencil, Plus, ShieldCheck, Trash2, User, X } from "lucide-react";
import toast from "react-hot-toast";

type UserItem = {
  _id: string;
  email: string;
  role: "admin" | "user";
};

type UsersApiResponse = {
  success: boolean;
  data?: UserItem[] | UserItem;
  message?: string;
};

type MeResponse = {
  success: boolean;
  data?: {
    role: "admin" | "user";
  };
};

const INITIAL_FORM = {
  email: "",
  password: "",
  role: "user" as "admin" | "user",
};

export default function AdminUsersPage() {
  const [items, setItems] = useState<UserItem[]>([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);

  async function fetchUsers() {
    setLoadingList(true);
    setError("");
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      const result = (await res.json()) as UsersApiResponse;

      if (!res.ok || !result.success) {
        setError(result.message ?? "Failed to load users");
        setItems([]);
        return;
      }

      const data = Array.isArray(result.data) ? result.data : [];
      setItems(data);
    } catch {
      setError("Failed to load users");
      setItems([]);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const result = (await res.json()) as MeResponse;
        if (!cancelled) {
          setIsAdmin(Boolean(res.ok && result.success && result.data?.role === "admin"));
        }
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    if (!isAdmin) {
      setError("Only admins can manage users");
      toast.error("Only admins can manage users");
      setSubmitting(false);
      return;
    }

    const payload = {
      email: form.email.trim(),
      password: form.password,
      role: form.role,
    };

    if (!payload.email || !payload.role || (!editingUser && !payload.password)) {
      setError("email and role are required. Password is required for new users.");
      toast.error("Email and role are required. Password is required for new users.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: editingUser ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser ? { id: editingUser._id, ...payload } : payload),
      });
      const result = (await res.json()) as UsersApiResponse;

      if (!res.ok || !result.success) {
        const action = editingUser ? "update" : "create";
        setError(result.message ?? `Failed to ${action} user`);
        toast.error(result.message ?? `Failed to ${action} user`);
        return;
      }

      setSuccess(editingUser ? "User updated successfully" : "User created successfully");
      toast.success(editingUser ? "User updated successfully" : "User created successfully");
      setForm(INITIAL_FORM);
      setEditingUser(null);
      setShowForm(false);
      await fetchUsers();
    } catch {
      const action = editingUser ? "update" : "create";
      setError(`Failed to ${action} user`);
      toast.error(`Failed to ${action} user`);
    } finally {
      setSubmitting(false);
    }
  }

  function onEdit(user: UserItem) {
    if (!isAdmin) return;
    setError("");
    setSuccess("");
    setEditingUser(user);
    setForm({ email: user.email, password: "", role: user.role });
    setShowForm(true);
  }

  async function onDelete(id: string) {
    if (!isAdmin) {
      setError("Only admins can manage users");
      toast.error("Only admins can manage users");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = (await res.json()) as UsersApiResponse;

      if (!res.ok || !result.success) {
        setError(result.message ?? "Failed to delete user");
        toast.error(result.message ?? "Failed to delete user");
        return;
      }

      setSuccess("User deleted successfully");
      toast.success("User deleted successfully");
      setDeletingUser(null);
      await fetchUsers();
    } catch {
      setError("Failed to delete user");
      toast.error("Failed to delete user");
    } finally {
      setSubmitting(false);
    }
  }

  function initialsFromEmail(email: string) {
    const prefix = email.split("@")[0] ?? "";
    const words = prefix.split(/[._-]+/).filter(Boolean);
    return words.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "US";
  }

  return (
    <>
      <main className="min-h-dvh bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-50/60 p-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <header>
            <h1 className="text-2xl font-bold text-navy-ink">Users & Roles</h1>
            <p className="text-sm text-navy-ink/60">Manage user access and roles</p>
          </header>

          <section className="rounded-2xl border border-navy-ink/10 bg-white p-3 shadow-(--shadow-soft)">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="rounded-xl border border-navy-ink/10 bg-cream-warm px-4 py-2.5 text-sm text-navy-ink/75">
                {items.length} registered users
              </p>
              <button
                type="button"
                disabled={!isAdmin}
                onClick={() => {
                  if (!isAdmin) return;
                  setError("");
                  setSuccess("");
                  setForm(INITIAL_FORM);
                  setEditingUser(null);
                  setShowForm(true);
                }}
                className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-brand to-gold-deep px-4 py-2.5 text-sm font-semibold text-white shadow-(--shadow-amber) disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add user
              </button>
            </div>
          </section>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <section>
            {loadingList ? (
              <div className="rounded-2xl border border-navy-ink/10 bg-white p-6 text-sm text-navy-ink/70">
                Loading users...
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-navy-ink/10 bg-white p-6 text-sm text-navy-ink/60">
                No users found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((user) => (
                  <article
                    key={user._id}
                    className="rounded-2xl border border-navy-ink/10 bg-white p-4 shadow-(--shadow-soft)"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-r from-sky-500 to-cyan-400 text-xs font-bold text-white">
                        {initialsFromEmail(user.email)}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          user.role === "admin"
                            ? "border border-amber-brand/30 bg-amber-brand/10 text-gold-deep"
                            : "border border-navy-ink/15 bg-navy-ink/5 text-navy-ink/80"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>

                    <p className="mt-3 break-all text-sm font-medium text-navy-ink">{user.email}</p>
                    <p className="mt-2 inline-flex items-center gap-1 text-xs text-navy-ink/60">
                      {user.role === "admin" ? (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Full admin access
                        </>
                      ) : (
                        <>
                          <User className="h-3.5 w-3.5" />
                          Standard user access
                        </>
                      )}
                    </p>
                    <div className="mt-3 flex justify-end gap-2 border-t border-navy-ink/10 pt-3">
                      {user.role !== "admin" && (
                        <button
                          type="button"
                          disabled={!isAdmin || submitting}
                          onClick={() => onEdit(user)}
                          className="rounded-md p-1.5 text-navy-ink/70 hover:bg-navy-ink/5 hover:text-navy-ink disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Edit ${user.email}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      {user.role !== "admin" && (
                        <button
                          type="button"
                          disabled={!isAdmin || submitting}
                          onClick={() => setDeletingUser(user)}
                          className="rounded-md p-1.5 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Delete ${user.email}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-40 flex">
          <button
            type="button"
            className="h-full flex-1 bg-navy-ink/35 backdrop-blur-[1px]"
            onClick={() => {
              if (!submitting) {
                setShowForm(false);
                setEditingUser(null);
                setForm(INITIAL_FORM);
              }
            }}
            aria-label="Close panel"
          />
          <aside className="h-full w-full max-w-xl overflow-y-auto border-l border-navy-ink/10 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight text-navy-ink">
                {editingUser ? "Edit user" : "Add user"}
              </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingUser(null);
                    setForm(INITIAL_FORM);
                  }}
                  className="rounded-lg p-2 text-navy-ink/55 transition hover:bg-navy-ink/5 hover:text-navy-ink"
                  aria-label="Close panel"
                >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="mt-6 grid grid-cols-1 gap-4" onSubmit={onSubmit}>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-ink/45" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-xl border border-navy-ink/10 bg-cream-warm py-2.5 pl-9 pr-3 text-sm text-navy-ink outline-none focus:border-amber-brand"
                    placeholder="user@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                  Password {editingUser ? "(optional)" : ""}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
                  placeholder={editingUser ? "Leave blank to keep current password" : "••••••••"}
                  required={!editingUser}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-ink/65">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      role: e.target.value as "admin" | "user",
                    }))
                  }
                  className="w-full rounded-xl border border-navy-ink/10 bg-cream-warm px-3 py-2.5 text-sm text-navy-ink outline-none focus:border-amber-brand"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-linear-to-r from-emerald-600 to-green-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 disabled:opacity-60"
                >
                  {submitting ? (editingUser ? "Saving..." : "Creating...") : editingUser ? "Save" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingUser(null);
                    setForm(INITIAL_FORM);
                  }}
                  className="rounded-xl border border-navy-ink/15 bg-white px-6 py-2.5 text-sm font-semibold text-navy-ink"
                >
                  Cancel
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-ink/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-navy-ink/10 bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-navy-ink">Delete user?</h3>
            <p className="mt-1 text-sm text-navy-ink/65">
              This will permanently remove <span className="font-semibold">{deletingUser.email}</span>.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="rounded-xl border border-navy-ink/15 bg-white px-4 py-2 text-sm font-semibold text-navy-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => onDelete(deletingUser._id)}
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
