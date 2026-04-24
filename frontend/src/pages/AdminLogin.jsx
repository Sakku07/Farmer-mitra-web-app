import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldCheck, AlertTriangle, Sprout } from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const { t } = useTranslation();
  const { user, login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user && user.role === "admin") return <Navigate to="/admin/dashboard" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setSubmitting(true);
    const res = await login(email.trim().toLowerCase(), password);
    setSubmitting(false);
    if (!res.ok) setErr(res.error || t("admin.login_failed"));
  }

  return (
    <Layout showTopAd={false}>
      <div className="mx-auto mt-4 max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow">
            <ShieldCheck className="h-7 w-7" />
          </span>
          <h1 className="mt-3 font-heading text-2xl font-bold text-gray-900">
            {t("admin.login_title")}
          </h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <Sprout className="h-3.5 w-3.5 text-emerald-600" />
            {t("app.name")}
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          data-testid="admin-login-form"
          className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              {t("admin.email")}
            </label>
            <input
              data-testid="admin-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="admin@farmhelper.in"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              {t("admin.password")}
            </label>
            <input
              data-testid="admin-password-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {err ? (
            <div
              data-testid="admin-login-error"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{err}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            data-testid="admin-login-submit"
            className="w-full rounded-lg bg-emerald-600 py-3 text-base font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? "…" : t("admin.login")}
          </button>
        </form>
      </div>
    </Layout>
  );
}
