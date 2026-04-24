import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search, Tractor, MapPin, AlertTriangle, RefreshCw, ChevronRight,
  Filter, Tag, BadgeCheck, CalendarDays,
} from "lucide-react";
import api, { formatApiErrorDetail } from "../../lib/api";
import { SkeletonList, EmptyState } from "../Skeleton";
import { useDebounce } from "../../hooks/useDebounce";

const INDIAN_STATES = [
  "Andhra Pradesh", "Bihar", "Chhattisgarh", "Gujarat", "Haryana", "Himachal Pradesh",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab",
  "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const COMMON_CROPS = [
  "Wheat", "Paddy(Dhan)(Common)", "Onion", "Potato", "Tomato", "Maize",
  "Soyabean", "Cotton", "Groundnut", "Sugarcane", "Bajra", "Jowar(Sorghum)",
];

// Canonical keys already surfaced in the primary card. Any *other* key from
// data.gov.in will be rendered automatically in an "Additional details" row.
const PRIMARY_KEYS = new Set([
  "state", "district", "market", "commodity", "variety", "grade",
  "arrival_date", "min_price", "max_price", "modal_price",
  "Commodity_Code", "State", "District", "Market",
  "Variety", "Grade", "Arrival_Date", "Min_Price", "Max_Price", "Modal_Price",
  "min_x0020_price", "max_x0020_price", "modal_x0020_price",
]);

function formatKey(k) {
  return k
    .replace(/_/g, " ")
    .replace(/\bx0020\b/g, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function MandiBhav({ compact = false, initialLimit }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [districts, setDistricts] = useState([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [commodity, setCommodity] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [refreshedAt, setRefreshedAt] = useState(null);

  // Compute limit: prefer prop, else 500 for full page to avoid artificial caps
  const limit = initialLimit ?? 500;

  async function fetchData() {
    setStatus("loading");
    setError("");
    try {
      const params = { limit };
      if (state) params.state = state;
      if (district) params.district = district;
      if (commodity) params.commodity = commodity;
      const { data } = await api.get("/mandi", { params });
      setRecords(data.records || []);
      setRefreshedAt(new Date());
      setStatus("ready");
    } catch (e) {
      setError(formatApiErrorDetail(e.response?.data?.detail) || t("mandi.error"));
      setStatus("error");
    }
  }

  // Load districts when state changes
  useEffect(() => {
    setDistrict("");
    setDistricts([]);
    if (!state) return;
    let cancelled = false;
    setDistrictsLoading(true);
    api
      .get("/mandi/districts", { params: { state } })
      .then((r) => {
        if (!cancelled) setDistricts(r.data.districts || []);
      })
      .catch(() => {
        if (!cancelled) setDistricts([]);
      })
      .finally(() => {
        if (!cancelled) setDistrictsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [state]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, district, commodity, limit]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) =>
      [r.commodity, r.market, r.district, r.state, r.variety, r.grade]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [records, debouncedSearch]);

  const shown = compact ? filtered.slice(0, 5) : filtered;

  function openInsights(rec) {
    const qs = new URLSearchParams();
    if (rec.state) qs.set("state", rec.state);
    if (rec.district) qs.set("district", rec.district);
    if (rec.market) qs.set("market", rec.market);
    const path = `/insights/${encodeURIComponent(rec.commodity)}?${qs.toString()}`;
    navigate(path, { state: { from: location.pathname } });
  }

  return (
    <section data-testid="mandi-section">
      {!compact && (
        <div
          data-testid="mandi-filters"
          className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
        >
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              data-testid="mandi-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("mandi.search_placeholder")}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-base focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <select
              data-testid="mandi-state-select"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">{`${t("mandi.state")}: ${t("mandi.any")}`}</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              data-testid="mandi-district-select"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={!state || districtsLoading}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">
                {!state
                  ? t("mandi.select_state_first")
                  : districtsLoading
                  ? t("mandi.loading_districts")
                  : `${t("mandi.district")}: ${t("mandi.any")}`}
              </option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              data-testid="mandi-commodity-select"
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">{`${t("mandi.commodity")}: ${t("mandi.any")}`}</option>
              {COMMON_CROPS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="h-3.5 w-3.5" />
              {status === "ready" ? `${filtered.length} ${t("mandi.results")}` : t("mandi.loading")}
              {refreshedAt ? (
                <>
                  <span className="mx-1">·</span>
                  <span>{t("mandi.updated")}: {refreshedAt.toLocaleTimeString()}</span>
                </>
              ) : null}
            </p>
            <button
              data-testid="mandi-refresh-btn"
              onClick={fetchData}
              disabled={status === "loading"}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-70"
            >
              <RefreshCw className={`h-4 w-4 ${status === "loading" ? "animate-spin" : ""}`} />
              {t("mandi.refresh")}
            </button>
          </div>
        </div>
      )}

      {status === "loading" && <SkeletonList count={compact ? 3 : 6} />}

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
        <EmptyState
          title={t("mandi.no_results")}
          hint={t("mandi.no_results_hint")}
          icon={Tractor}
        />
      )}

      {status === "ready" && shown.length > 0 && (
        <ul data-testid="mandi-list" className="space-y-3">
          {shown.map((r, i) => {
            const extras = Object.entries(r).filter(
              ([k, v]) =>
                !PRIMARY_KEYS.has(k) &&
                !k.startsWith("_") &&
                v !== null &&
                v !== undefined &&
                v !== "" &&
                typeof v !== "object"
            );
            return (
              <li
                key={`${r.market}-${r.commodity}-${i}`}
                data-testid="mandi-card"
                onClick={() => openInsights(r)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openInsights(r);
                  }
                }}
                role="button"
                tabIndex={0}
                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                        <Tractor className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate font-heading text-base font-semibold text-slate-900">
                          {r.commodity}
                        </h3>
                        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">
                            {r.market}, {r.district}, {r.state}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {r.variety && r.variety !== "Other" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                          <Tag className="h-3 w-3" /> {r.variety}
                        </span>
                      ) : null}
                      {r.grade && r.grade !== "FAQ" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                          <BadgeCheck className="h-3 w-3" /> {r.grade}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                      <CalendarDays className="h-3 w-3" />
                      {r.arrival_date}
                    </span>
                    <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{t("mandi.min_price")}</p>
                    <p className="text-base font-bold text-slate-900">₹{r.min_price}</p>
                  </div>
                  <div className="border-x border-slate-100">
                    <p className="text-xs uppercase tracking-wide text-slate-500">{t("mandi.modal_price")}</p>
                    <p className="text-base font-bold text-emerald-700">₹{r.modal_price}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{t("mandi.max_price")}</p>
                    <p className="text-base font-bold text-slate-900">₹{r.max_price}</p>
                  </div>
                </div>

                {extras.length > 0 && (
                  <div className="mt-3 border-t border-slate-100 pt-2">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {t("mandi.extra_fields")}
                    </p>
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                      {extras.map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-2">
                          <dt className="truncate text-slate-500">{formatKey(k)}</dt>
                          <dd className="truncate font-medium text-slate-700">{String(v)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                <p className="mt-2 text-right text-xs text-slate-400">{t("mandi.per_quintal")}</p>
              </li>
            );
          })}
        </ul>
      )}

      {compact && status === "ready" && shown.length > 0 && (
        <Link
          to="/mandi"
          className="mt-3 block rounded-xl border border-dashed border-slate-300 bg-white py-3 text-center text-sm font-semibold text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50"
        >
          {t("home.view_all")} →
        </Link>
      )}
    </section>
  );
}
