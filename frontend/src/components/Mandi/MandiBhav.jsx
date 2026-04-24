import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Tractor, MapPin, AlertTriangle, RefreshCw } from "lucide-react";
import api, { formatApiErrorDetail } from "../../lib/api";

const INDIAN_STATES = [
  "Andhra Pradesh", "Bihar", "Chhattisgarh", "Gujarat", "Haryana", "Himachal Pradesh",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab",
  "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const COMMON_CROPS = [
  "Wheat", "Paddy(Dhan)(Common)", "Onion", "Potato", "Tomato", "Maize",
  "Soyabean", "Cotton", "Groundnut", "Sugarcane", "Bajra", "Jowar(Sorghum)",
];

export default function MandiBhav({ compact = false, initialLimit = 50 }) {
  const { t } = useTranslation();
  const [state, setState] = useState("");
  const [commodity, setCommodity] = useState("");
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState("");

  async function fetchData() {
    setStatus("loading");
    setError("");
    try {
      const params = { limit: initialLimit };
      if (state) params.state = state;
      if (commodity) params.commodity = commodity;
      const { data } = await api.get("/mandi", { params });
      setRecords(data.records || []);
      setStatus("ready");
    } catch (e) {
      setError(formatApiErrorDetail(e.response?.data?.detail) || t("mandi.error"));
      setStatus("error");
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, commodity, initialLimit]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) =>
      [r.commodity, r.market, r.district, r.state, r.variety]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [records, search]);

  const shown = compact ? filtered.slice(0, 5) : filtered;

  return (
    <section data-testid="mandi-section">
      {!compact && (
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative sm:col-span-3">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              data-testid="mandi-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("mandi.search_placeholder")}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <select
            data-testid="mandi-state-select"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          >
            <option value="">{`${t("mandi.state")}: ${t("mandi.any")}`}</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            data-testid="mandi-commodity-select"
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          >
            <option value="">{`${t("mandi.commodity")}: ${t("mandi.any")}`}</option>
            {COMMON_CROPS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            data-testid="mandi-refresh-btn"
            onClick={fetchData}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            <RefreshCw className="h-4 w-4" /> {t("common.retry")}
          </button>
        </div>
      )}

      {status === "loading" && (
        <div data-testid="mandi-loading" className="py-10 text-center text-gray-500">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          {t("mandi.loading")}
        </div>
      )}

      {status === "error" && (
        <div
          data-testid="mandi-error"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
        >
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-5 w-5" />
            {t("mandi.error")}
          </div>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchData}
            data-testid="mandi-retry-btn"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4" /> {t("common.retry")}
          </button>
        </div>
      )}

      {status === "ready" && shown.length === 0 && (
        <div data-testid="mandi-empty" className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500">
          {t("mandi.no_results")}
        </div>
      )}

      {status === "ready" && shown.length > 0 && (
        <ul data-testid="mandi-list" className="space-y-3">
          {shown.map((r, i) => (
            <li
              key={`${r.market}-${r.commodity}-${i}`}
              data-testid="mandi-card"
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <Tractor className="h-4 w-4" />
                    </span>
                    <h3 className="truncate font-heading text-base font-semibold text-gray-900">
                      {r.commodity}
                      {r.variety && r.variety !== "Other" ? (
                        <span className="ml-1 text-sm font-normal text-gray-500">
                          · {r.variety}
                        </span>
                      ) : null}
                    </h3>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin className="h-3.5 w-3.5" />
                    {r.market}, {r.district}, {r.state}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                  {r.arrival_date}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 text-center">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">{t("mandi.min_price")}</p>
                  <p className="text-base font-bold text-gray-900">₹{r.min_price}</p>
                </div>
                <div className="border-x border-gray-100">
                  <p className="text-xs uppercase tracking-wide text-gray-500">{t("mandi.modal_price")}</p>
                  <p className="text-base font-bold text-emerald-700">₹{r.modal_price}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">{t("mandi.max_price")}</p>
                  <p className="text-base font-bold text-gray-900">₹{r.max_price}</p>
                </div>
              </div>
              <p className="mt-2 text-right text-xs text-gray-400">{t("mandi.per_quintal")}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
