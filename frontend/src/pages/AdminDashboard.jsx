import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import { LogOut, Plus, Pencil, Trash2, X, Save, Leaf, Store } from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import api, { formatApiErrorDetail } from "../lib/api";

const SCHEME_FIELDS = [
  { key: "name", type: "text", required: true },
  { key: "benefit", type: "text", required: true, span: true },
  { key: "description", type: "textarea" },
  { key: "eligibility", type: "textarea" },
  { key: "apply_url", type: "url", required: true },
  { key: "image_url", type: "url" },
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

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user, loading, logout } = useAuth();
  const [tab, setTab] = useState("schemes");

  if (loading) return null;
  if (!user || user.role !== "admin") return <Navigate to="/admin" replace />;

  return (
    <Layout showTopAd={false}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 data-testid="admin-dashboard-title" className="font-heading text-3xl font-bold text-gray-900">
            {t("admin.dashboard")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">Signed in as {user.email}</p>
        </div>
        <button
          data-testid="admin-logout-btn"
          onClick={logout}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:border-red-300 hover:text-red-700"
        >
          <LogOut className="h-4 w-4" /> {t("admin.logout")}
        </button>
      </div>

      <div className="mb-5 flex gap-2 rounded-xl border border-gray-200 bg-white p-1">
        <button
          onClick={() => setTab("schemes")}
          data-testid="admin-tab-schemes"
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            tab === "schemes"
              ? "bg-emerald-600 text-white"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Leaf className="h-4 w-4" /> {t("admin.manage_schemes")}
        </button>
        <button
          onClick={() => setTab("products")}
          data-testid="admin-tab-products"
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            tab === "products"
              ? "bg-emerald-600 text-white"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Store className="h-4 w-4" /> {t("admin.manage_products")}
        </button>
      </div>

      {tab === "schemes" ? (
        <CrudTable
          resource="/schemes"
          testidPrefix="scheme"
          addLabel={t("admin.add_scheme")}
          fields={SCHEME_FIELDS}
          renderRow={(s) => (
            <>
              <p className="font-heading text-base font-bold text-gray-900">{s.name}</p>
              <p className="text-sm text-emerald-700">{s.benefit}</p>
              <p className="mt-0.5 text-xs text-gray-500">{s.category}</p>
            </>
          )}
          defaultValues={{
            name: "",
            benefit: "",
            description: "",
            eligibility: "",
            apply_url: "",
            image_url: "",
            category: "General",
          }}
        />
      ) : (
        <CrudTable
          resource="/products"
          testidPrefix="product"
          addLabel={t("admin.add_product")}
          fields={PRODUCT_FIELDS}
          renderRow={(p) => (
            <>
              <p className="font-heading text-base font-bold text-gray-900">{p.name}</p>
              <p className="text-sm text-gray-700">
                ₹{Number(p.price).toLocaleString("en-IN")}{" "}
                <span className="text-xs text-gray-400">· {p.category}</span>
              </p>
            </>
          )}
          defaultValues={{
            name: "",
            category: "Seeds",
            price: 0,
            image_url: "",
            amazon_url: "",
            description: "",
          }}
        />
      )}
    </Layout>
  );
}

function CrudTable({ resource, testidPrefix, addLabel, fields, renderRow, defaultValues }) {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // object or null
  const [form, setForm] = useState(defaultValues);
  const [saving, setSaving] = useState(false);

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
      } else {
        await api.post(resource, payload);
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
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      setError(formatApiErrorDetail(e.response?.data?.detail) || "Delete failed");
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-gray-500">{items.length} items</p>
        <button
          onClick={openNew}
          data-testid={`${testidPrefix}-add-btn`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> {addLabel}
        </button>
      </div>

      {error ? (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="py-10 text-center text-gray-500">Loading…</div>
      ) : (
        <ul className="space-y-2" data-testid={`${testidPrefix}-list`}>
          {items.map((it) => (
            <li
              key={it.id}
              data-testid={`${testidPrefix}-row-${it.id}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3"
            >
              <div className="min-w-0 flex-1">{renderRow(it)}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(it)}
                  data-testid={`${testidPrefix}-edit-${it.id}`}
                  className="rounded-lg border border-gray-200 bg-white p-2 text-gray-700 hover:border-emerald-500 hover:text-emerald-700"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(it.id)}
                  data-testid={`${testidPrefix}-delete-${it.id}`}
                  className="rounded-lg border border-gray-200 bg-white p-2 text-gray-700 hover:border-red-400 hover:text-red-700"
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
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
              <h3 className="font-heading text-lg font-bold text-gray-900">
                {editing.id ? t("admin.edit") : addLabel}
              </h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {fields.map((f) => (
                  <label
                    key={f.key}
                    className={f.span ? "sm:col-span-2" : ""}
                  >
                    <span className="mb-1 block text-sm font-semibold text-gray-700">
                      {t(`admin.${f.key}`, { defaultValue: f.key })}
                      {f.required ? <span className="text-red-600"> *</span> : null}
                    </span>
                    {f.type === "textarea" ? (
                      <textarea
                        required={!!f.required}
                        value={form[f.key] || ""}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        rows={3}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      />
                    ) : (
                      <input
                        required={!!f.required}
                        type={f.type}
                        value={form[f.key] ?? ""}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-gray-200 bg-gray-50 px-5 py-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
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
