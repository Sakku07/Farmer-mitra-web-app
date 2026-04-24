import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Layout from "../components/Layout";
import ProductCard from "../components/Products/ProductCard";
import AdSensePlaceholder from "../components/AdSensePlaceholder";
import api, { formatApiErrorDetail } from "../lib/api";

export default function ProductsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");

  async function fetchItems() {
    setStatus("loading");
    try {
      const { data } = await api.get("/products");
      setItems(data);
      setStatus("ready");
    } catch (e) {
      setError(formatApiErrorDetail(e.response?.data?.detail) || t("products.error"));
      setStatus("error");
    }
  }

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(items.map((p) => p.category))).sort(),
    [items]
  );
  const filtered = category ? items.filter((p) => p.category === category) : items;

  return (
    <Layout showTopAd={false}>
      <div className="mb-5">
        <h1 data-testid="products-page-title" className="font-heading text-3xl font-bold text-gray-900 sm:text-4xl">
          {t("products.title")}
        </h1>
        <p className="mt-1 text-base text-gray-600">{t("products.subtitle")}</p>
      </div>
      <AdSensePlaceholder slot="banner" className="mb-5" />

      {status === "ready" && categories.length > 0 && (
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1" data-testid="products-category-filter">
          <button
            onClick={() => setCategory("")}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              category === ""
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-emerald-500"
            }`}
          >
            {t("products.all")}
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              data-testid={`category-btn-${c}`}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                category === c
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-emerald-500"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {status === "loading" && (
        <div data-testid="products-loading" className="py-10 text-center text-gray-500">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          {t("products.loading")}
        </div>
      )}

      {status === "error" && (
        <div data-testid="products-error" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-5 w-5" />
            {t("products.error")}
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

      {status === "ready" && filtered.length === 0 && (
        <div data-testid="products-empty" className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500">
          {t("products.no_products")}
        </div>
      )}

      {status === "ready" && filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </Layout>
  );
}
