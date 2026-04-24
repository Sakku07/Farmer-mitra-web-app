import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import {
  LogOut, Plus, Pencil, Trash2, X, Save, Leaf, Store, Bell,
  Send, ArrowLeft, Menu, ShieldCheck, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import api, { formatApiErrorDetail } from "../lib/api";

const SCHEME_FIELDS = [
  { key: "name", type: "text", required: true, span: true },
  { key: "benefit", type: "text", required: true, span: true },
  { key: "description", type: "textarea", span: true },
  { key: "eligibility", type: "textarea", span: true },
  { key: "apply_url", type: "url", required: true, span: true },
  { key: "image_url", type: "url", span: true },
  { key: "category", type: "text" },
];

const PRODUCT_FIELDS = [
  { key: "name", type: "text", required: true, span: true },
  { key: "category", type: "text", required: true },
  { key: "price", type: "number", required: true },
  { key: "image_url", type: "url", required: true, span: true },
  { key: "amazon_url", type: "url", required: true, span: true },
  { key: "description", type: "textarea", span: true },
];

const NAV = [
  { key: "schemes", icon: Leaf, labelKey: "admin.manage_schemes" },
  { key: "products", icon: Store, labelKey: "admin.manage_products" },
  { key: "notifications", icon: Bell, labelKey: "admin.notifications" },
];

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user, loading, logout } = useAuth();
  const [tab, setTab] = useState("schemes");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (loading) return null;
  if (!user || user.role !== "admin") return <Navigate to="/admin" replace />;

  return (
    <Layout showTopAd={false}>
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setMobileNavOpen(true)}
            data-testid="admin-menu-btn"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1
              data-testid="admin-dashboard-title"
              className="truncate font-heading text-2xl font-bold text-slate-900 sm:text-3xl"
            >
              {t("admin.dashboard")}
            </h1>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
        <button
          data-testid="admin-logout-btn"
          onClick={logout}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-red-300 hover:text-red-700"
        >
          <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">{t("admin.logout")}</span>
        </button>
      </div>

      <div className="flex gap-5">
        {/* Sidebar (desktop) */}
        <aside
          data-testid="admin-sidebar"
          className="hidden w-56 shrink-0 md:block"
        >
          <nav className="sticky top-20 space-y-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <div className="mb-1 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Control Center</span>
            </div>
            {NAV.map((n) => (
              <SidebarLink
                key={n.key}
                testid={`sidebar-${n.key}`}
                active={tab === n.key}
                onClick={() => setTab(n.key)}
                icon={n.icon}
                label={t(n.labelKey)}
              />
            ))}
            <div className="my-2 h-px bg-slate-100" />
            <SidebarLink
              testid="sidebar-back-to-app"
              onClick={() => (window.location.href = "/")}
              icon={ArrowLeft}
              label={t("admin.back_to_app")}
            />
          </nav>
        </aside>

        {/* Drawer (mobile) */}
        {mobileNavOpen && (
          <div
            className="fixed inset-0 z-[60] md:hidden"
            onClick={() => setMobileNavOpen(false)}
          >
            <div className="absolute inset-0 bg-black/40" />
            <nav
              onClick={(e) => e.stopPropagation()}
              data-testid="admin-mobile-nav"
              className="absolute left-0 top-0 h-full w-72 overflow-y-auto border-r border-slate-200 bg-white p-3 shadow-xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-emerald-700">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Control Center</span>
                </span>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-1">
                {NAV.map((n) => (
                  <SidebarLink
                    key={n.key}
                    testid={`mnav-${n.key}`}
                    active={tab === n.key}
                    onClick={() => {
                      setTab(n.key);
                      setMobileNavOpen(false);
                    }}
                    icon={n.icon}
                    label={t(n.labelKey)}
                  />
                ))}
                <div className="my-2 h-px bg-slate-100" />
                <SidebarLink
                  testid="mnav-back-to-app"
                  onClick={() => (window.location.href = "/")}
                  icon={ArrowLeft}
                  label={t("admin.back_to_app")}
                />
              </div>
            </nav>
          </div>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          {tab === "schemes" && (
            <CrudTable
              resource="/schemes"
              notifyResource="/notifications/broadcast-scheme"
              testidPrefix="scheme"
              addLabel={t("admin.add_scheme")}
              fields={SCHEME_FIELDS}
              renderRow={(s) => (
                <>
                  <p className="font-heading text-base font-bold text-slate-900">{s.name}</p>
                  <p className="text-sm text-emerald-700">{s.benefit}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{s.category}</p>
                </>
              )}
              defaultValues={{
                name: "", benefit: "", description: "", eligibility: "",
                apply_url: "", image_url: "", category: "General",
              }}
            />
          )}
          {tab === "products" && (
            <CrudTable
              resource="/products"
              notifyResource="/notifications/broadcast-product"
              testidPrefix="product"
              addLabel={t("admin.add_product")}
              fields={PRODUCT_FIELDS}
              renderRow={(p) => (
                <>
                  <p className="font-heading text-base font-bold text-slate-900">{p.name}</p>
                  <p className="text-sm text-slate-700">
                    ₹{Number(p.price).toLocaleString("en-IN")}{" "}
                    <span className="text-xs text-slate-400">· {p.category}</span>
                  </p>
                </>
              )}
              defaultValues={{
                name: "", category: "Seeds", price: 0,
                image_url: "", amazon_url: "", description: "",
              }}
            />
          )}
          {tab === "notifications" && <NotificationsPanel />}
        </div>
      </div>
    </Layout>
  );
}

function SidebarLink({ icon: Icon, label, active, onClick, testid }) {
  return (
    <button
      onClick={onClick}
      data-testid={testid}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
        active
          ? "bg-emerald-600 text-white shadow-sm"
          : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function CrudTable({
  resource, notifyResource, testidPrefix, addLabel, fields,
  renderRow, defaultValues,
}) {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultValues);
  const [saving, setSaving] = useState(false);
  const [notifyingId, setNotifyingId] = useState("");

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(resource);
      setItems(data);
    } catch (e) {
      setError(formatApiErrorDetail(e.response?.data?.detail) || "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  function openNew() {
    setForm(defaultValues);
    setEditing({});
  }
  function openEdit(it) {
    const { id: _, created_at: __, ...rest } = it;
    setForm({ ...defaultValues, ...rest });
    setEditing(it);
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form };
      if (payload.price !== undefined) payload.price = Number(payload.price);
      if (editing && editing.id) {
        await api.put(`${resource}/${editing.id}`, payload);
        toast.success(t("admin.updated"));
      } else {
        await api.post(resource, payload);
        toast.success(t("admin.created"));
      }
      setEditing(null);
      await load();
    } catch (e) {
      setError(formatApiErrorDetail(e.response?.data?.detail) || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm(t("admin.confirm_delete"))) return;
    try {
      await api.delete(`${resource}/${id}`);
      setItems((p) => p.filter((x) => x.id !== id));
      toast.success(t("admin.deleted"));
    } catch (e) {
      setError(formatApiErrorDetail(e.response?.data?.detail) || "Delete failed");
    }
  }

  async function notifyUsers(id) {
    setNotifyingId(id);
    try {
      await api.post(`${notifyResource}/${id}`);
      toast.success(t("admin.notify_sent"));
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Notify failed");
    } finally {
      setNotifyingId("");
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-slate-500">{items.length} items</p>
        <button
          onClick={openNew}
          data-testid={`${testidPrefix}-add-btn`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> {addLabel}
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-slate-500">Loading…</div>
      ) : (
        <ul className="space-y-2" data-testid={`${testidPrefix}-list`}>
          {items.map((it) => (
            <li
              key={it.id}
              data-testid={`${testidPrefix}-row-${it.id}`}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">{renderRow(it)}</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => notifyUsers(it.id)}
                  disabled={notifyingId === it.id}
                  data-testid={`${testidPrefix}-notify-${it.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                >
                  <Send className={`h-3.5 w-3.5 ${notifyingId === it.id ? "animate-pulse" : ""}`} />
                  {t("admin.notify_users")}
                </button>
                <button
                  onClick={() => openEdit(it)}
                  data-testid={`${testidPrefix}-edit-${it.id}`}
                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:border-emerald-500 hover:text-emerald-700"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(it.id)}
                  data-testid={`${testidPrefix}-delete-${it.id}`}
                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:border-red-400 hover:text-red-700"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onClick={() => setEditing(null)}
        >
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            data-testid={`${testidPrefix}-form`}
            className="w-full max-w-lg overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <h3 className="font-heading text-lg font-bold text-slate-900">
                {editing.id ? t("admin.edit") : addLabel}
              </h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {fields.map((f) => (
                  <label key={f.key} className={f.span ? "sm:col-span-2" : ""}>
                    <span className="mb-1 block text-sm font-semibold text-slate-700">
                      {t(`admin.${f.key}`, { defaultValue: f.key })}
                      {f.required ? <span className="text-red-600"> *</span> : null}
                    </span>
                    {f.type === "textarea" ? (
                      <textarea
                        required={!!f.required}
                        value={form[f.key] || ""}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        rows={3}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      />
                    ) : (
                      <input
                        required={!!f.required}
                        type={f.type}
                        value={form[f.key] ?? ""}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                {t("admin.cancel")}
              </button>
              <button
                type="submit"
                disabled={saving}
                data-testid={`${testidPrefix}-save-btn`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? "…" : t("admin.save")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function NotificationsPanel() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [sending, setSending] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/notifications", { params: { limit: 50 } });
      setItems(data);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function send(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSending(true);
    try {
      await api.post("/notifications", {
        title: title.trim(),
        body: body.trim(),
        link: link.trim(),
        type: "general",
      });
      toast.success(t("admin.notify_sent"));
      setTitle("");
      setBody("");
      setLink("");
      await load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed");
    } finally {
      setSending(false);
    }
  }

  async function removeNotif(id) {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm(t("admin.confirm_delete"))) return;
    try {
      await api.delete(`/notifications/${id}`);
      setItems((p) => p.filter((x) => x.id !== id));
    } catch {
      toast.error("Delete failed");
    }
  }

  return (
    <div data-testid="notifications-panel">
      <form
        onSubmit={send}
        data-testid="notifications-form"
        className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h3 className="mb-3 flex items-center gap-2 font-heading text-base font-bold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          {t("admin.broadcast_title")}
        </h3>
        <div className="space-y-3">
          <input
            data-testid="notif-title-input"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("admin.notif_title_ph")}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
          <textarea
            data-testid="notif-body-input"
            rows={2}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("admin.notif_body_ph")}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
          <input
            data-testid="notif-link-input"
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="/schemes or /products (optional)"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
          <button
            type="submit"
            disabled={sending}
            data-testid="notif-send-btn"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            <Send className={`h-4 w-4 ${sending ? "animate-pulse" : ""}`} />
            {t("admin.send_broadcast")}
          </button>
        </div>
      </form>

      <h3 className="mb-3 font-heading text-base font-bold text-slate-900">{t("admin.sent_updates")}</h3>
      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500">{t("admin.no_notifications")}</p>
      ) : (
        <ul data-testid="notifications-list" className="space-y-2">
          {items.map((n) => (
            <li
              key={n.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-heading text-sm font-bold text-slate-900">{n.title}</p>
                {n.body ? <p className="mt-0.5 text-xs text-slate-600">{n.body}</p> : null}
                <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">
                  {n.type} · {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => removeNotif(n.id)}
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:border-red-400 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
