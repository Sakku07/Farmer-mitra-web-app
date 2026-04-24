import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Layout from "../components/Layout";
import SchemeCard from "../components/Schemes/SchemeCard";
import AdSensePlaceholder from "../components/AdSensePlaceholder";
import api, { formatApiErrorDetail } from "../lib/api";

export default function SchemesPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  async function fetchItems() {
    setStatus("loading");
    try {
      const { data } = await api.get("/schemes");
      setItems(data);
      setStatus("ready");
    } catch (e) {
      setError(formatApiErrorDetail(e.response?.data?.detail) || t("schemes.error"));
      setStatus("error");
    }
  }

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout showTopAd={false}>
      <div className="mb-5">
        <h1 data-testid="schemes-page-title" className="font-heading text-3xl font-bold text-gray-900 sm:text-4xl">
          {t("schemes.title")}
        </h1>
        <p className="mt-1 text-base text-gray-600">{t("schemes.subtitle")}</p>
      </div>
      <AdSensePlaceholder slot="banner" className="mb-5" />

      {status === "loading" && (
        <div data-testid="schemes-loading" className="py-10 text-center text-gray-500">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          {t("schemes.loading")}
        </div>
      )}

      {status === "error" && (
        <div data-testid="schemes-error" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-5 w-5" />
            {t("schemes.error")}
          </div>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchItems}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4" /> {t("common.retry")}
          </button>
        </div>
      )}

      {status === "ready" && items.length === 0 && (
        <div data-testid="schemes-empty" className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500">
          {t("schemes.no_schemes")}
        </div>
      )}

      {status === "ready" && items.length > 0 && (
        <div className="space-y-4">
          {items.map((s, idx) => (
            <div key={s.id}>
              <SchemeCard scheme={s} />
              {(idx + 1) % 3 === 0 && (
                <AdSensePlaceholder slot="inline" className="mt-4" />
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
