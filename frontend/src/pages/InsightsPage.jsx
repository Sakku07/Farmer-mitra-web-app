import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus, MapPin, CalendarDays,
  RefreshCw, AlertTriangle, Tractor, LineChart as LineIcon, BarChart3,
  Package, History, Tag, BadgeCheck,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";
import Layout from "../components/Layout";
import { SkeletonStat, SkeletonList, EmptyState } from "../components/Skeleton";
import api, { formatApiErrorDetail } from "../lib/api";

const HIDE_KEYS = new Set([
  "state", "district", "market", "commodity", "variety", "grade",
  "arrival_date", "min_price", "max_price", "modal_price",
  "Commodity_Code", "State", "District", "Market", "Variety", "Grade",
  "Arrival_Date", "Min_Price", "Max_Price", "Modal_Price",
  "min_x0020_price", "max_x0020_price", "modal_x0020_price", "_date",
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

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
}

export default function InsightsPage() {
  const { t } = useTranslation();
  const { commodity } = useParams();
  const [sp] = useSearchParams();
  const state = sp.get("state") || "";
  const district = sp.get("district") || "";
  const market = sp.get("market") || "";

  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [refreshedAt, setRefreshedAt] = useState(null);

  async function load() {
    setStatus("loading");
    setError("");
    try {
      const { data } = await api.get("/mandi/insights", {
        params: {
          commodity: decodeURIComponent(commodity),
          ...(state ? { state } : {}),
          ...(district ? { district } : {}),
          ...(market ? { market } : {}),
        },
      });
      setData(data);
      setRefreshedAt(new Date());
      setStatus("ready");
    } catch (e) {
      setError(formatApiErrorDetail(e.response?.data?.detail) || t("insights.error"));
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commodity, state, district, market]);

  const latest = data?.latest;
  const trend = data?.trend_7day || [];
  const markets = data?.markets || [];
  const history = data?.history || [];

  // Trend direction (compare last two points)
  let direction = "flat";
  if (trend.length >= 2) {
    const last = trend[trend.length - 1].avg_modal;
    const prev = trend[trend.length - 2].avg_modal;
    if (last > prev) direction = "up";
    else if (last < prev) direction = "down";
  }

  return (
    <Layout showTopAd={false}>
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to="/mandi"
            data-testid="insights-back-link"
            className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("insights.back")}
          </Link>
          <h1
            data-testid="insights-title"
            className="font-heading text-3xl font-bold leading-tight text-slate-900 sm:text-4xl"
          >
            {decodeURIComponent(commodity)}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-slate-600">
            <MapPin className="h-4 w-4 text-emerald-600" />
            {[market, district, state].filter(Boolean).join(", ") || t("insights.all_india")}
          </p>
        </div>
        <button
          onClick={load}
          disabled={status === "loading"}
          data-testid="insights-refresh-btn"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-70"
        >
          <RefreshCw className={`h-4 w-4 ${status === "loading" ? "animate-spin" : ""}`} />
          {t("mandi.refresh")}
        </button>
      </div>

      {status === "loading" && (
        <>
          <div className="mb-5 grid grid-cols-3 gap-3">
            <SkeletonStat /><SkeletonStat /><SkeletonStat />
          </div>
          <div className="mb-5 h-64 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="fh-skeleton h-full w-full rounded-lg" />
          </div>
          <SkeletonList count={4} />
        </>
      )}

      {status === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800" data-testid="insights-error">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-5 w-5" /> {t("insights.error")}
          </div>
          <p className="text-sm">{error}</p>
          <button
            onClick={load}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4" /> {t("common.retry")}
          </button>
        </div>
      )}

      {status === "ready" && data && (
        <>
          {/* Price headline */}
          {latest ? (
            <>
              <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
                <PriceStat
                  testid="price-min"
                  label={t("mandi.min_price")}
                  value={latest.min_price}
                  tone="slate"
                />
                <PriceStat
                  testid="price-modal"
                  label={t("mandi.modal_price")}
                  value={latest.modal_price}
                  tone="emerald"
                  direction={direction}
                />
                <PriceStat
                  testid="price-max"
                  label={t("mandi.max_price")}
                  value={latest.max_price}
                  tone="slate"
                />
              </div>

              <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-600">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>{t("insights.as_of")}: {latest.arrival_date}</span>
                {latest.market ? (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{latest.market}</span>
                  </>
                ) : null}
                {latest.variety && latest.variety !== "Other" ? (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{latest.variety}</span>
                  </>
                ) : null}
                {latest.grade ? (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1"><BadgeCheck className="h-3 w-3" />{latest.grade}</span>
                  </>
                ) : null}
                {refreshedAt ? (
                  <span className="ml-auto">{t("mandi.updated")}: {refreshedAt.toLocaleTimeString()}</span>
                ) : null}
              </div>
            </>
          ) : null}

          {/* 7-day trend chart */}
          <SectionTitle icon={BarChart3} title={t("insights.trend_7day")} />
          {trend.length >= 2 ? (
            <div
              data-testid="insights-trend-chart"
              className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trend} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={(v) => `₹${Math.round(v)}`}
                      width={60}
                    />
                    <Tooltip
                      cursor={{ fill: "#f0fdf4" }}
                      contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
                      labelFormatter={(l) => `Date: ${formatDate(l)}`}
                      formatter={(v, name) => [`₹${v}`, name === "avg_modal" ? t("mandi.modal_price") : name]}
                    />
                    <Bar dataKey="avg_modal" radius={[6, 6, 0, 0]}>
                      {trend.map((entry, idx) => {
                        let color = "#059669"; // emerald-600
                        if (idx > 0) {
                          const prev = trend[idx - 1].avg_modal;
                          if (entry.avg_modal > prev) color = "#10b981";
                          else if (entry.avg_modal < prev) color = "#f59e0b";
                        }
                        return <Cell key={idx} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <EmptyState
                title={t("insights.trend_updating")}
                hint={t("insights.trend_updating_hint")}
                icon={LineIcon}
              />
            </div>
          )}

          {/* Market arrivals — data.gov.in doesn't expose volume for most mandis */}
          <SectionTitle icon={Package} title={t("insights.market_arrivals")} />
          <MarketArrivals markets={markets} t={t} />

          {/* Historical price list */}
          <SectionTitle icon={History} title={t("insights.history")} />
          {history.length === 0 ? (
            <EmptyState
              title={t("insights.no_history")}
              hint={t("insights.no_history_hint")}
              icon={History}
            />
          ) : (
            <ul className="space-y-2" data-testid="insights-history-list">
              {history.slice(0, 25).map((h, i) => (
                <li
                  key={i}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                      <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                      {h.arrival_date}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{h.market || "—"}, {h.district || "—"}</span>
                    </p>
                  </div>
                  <div className="flex items-baseline gap-3 text-sm">
                    <span className="text-slate-500">{t("mandi.min_price")}: <b className="text-slate-900">₹{h.min_price ?? "—"}</b></span>
                    <span className="text-emerald-700 font-semibold">₹{h.modal_price ?? "—"}</span>
                    <span className="text-slate-500">{t("mandi.max_price")}: <b className="text-slate-900">₹{h.max_price ?? "—"}</b></span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Auto-adaptive: show any extra fields present on latest */}
          {latest ? <ExtraFieldsBlock record={latest} t={t} /> : null}
        </>
      )}
    </Layout>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <h2 className="mb-3 mt-4 flex items-center gap-2 font-heading text-lg font-bold text-slate-900 sm:text-xl">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        <Icon className="h-4 w-4" />
      </span>
      {title}
    </h2>
  );
}

function PriceStat({ label, value, tone = "slate", direction, testid }) {
  const color =
    tone === "emerald"
      ? "text-emerald-700 bg-emerald-50 border-emerald-100"
      : "text-slate-900 bg-white border-slate-200";
  const DIcon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;
  const dColor = direction === "up" ? "text-emerald-600" : direction === "down" ? "text-amber-600" : "text-slate-400";
  return (
    <div
      data-testid={testid}
      className={`rounded-2xl border p-4 shadow-sm ${color}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-heading text-2xl font-bold leading-none sm:text-3xl">₹{value ?? "—"}</span>
        {tone === "emerald" ? <DIcon className={`h-4 w-4 shrink-0 ${dColor}`} /> : null}
      </div>
      <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">/quintal</p>
    </div>
  );
}

function MarketArrivals({ markets, t }) {
  if (!markets || markets.length === 0) {
    return (
      <div className="mb-6">
        <EmptyState
          title={t("insights.arrivals_updating")}
          hint={t("insights.arrivals_updating_hint")}
          icon={Package}
        />
      </div>
    );
  }
  // No true "volume" field in data.gov.in response — show per-market modal prices
  // with price delta between min and max as a proxy "spread".
  return (
    <ul data-testid="insights-markets-list" className="mb-6 space-y-2">
      {markets.map((m, i) => {
        const spread =
          m.max_price != null && m.min_price != null
            ? Math.round((m.max_price - m.min_price))
            : null;
        const spreadPct =
          spread != null && m.min_price
            ? Math.round((spread / m.min_price) * 100)
            : null;
        return (
          <li
            key={i}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900">
                <Tractor className="mr-1.5 inline-block h-4 w-4 text-emerald-600" />
                {m.market || "—"}
              </p>
              <p className="text-xs text-slate-500">
                {m.district}, {m.state}
              </p>
            </div>
            <div className="text-right">
              <p className="font-heading text-lg font-bold text-emerald-700">₹{m.modal_price ?? "—"}</p>
              {spread != null ? (
                <p className="text-xs text-slate-500">
                  {t("insights.spread")}: ₹{spread}
                  {spreadPct != null ? ` (${spreadPct}%)` : ""}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function ExtraFieldsBlock({ record, t }) {
  const extras = Object.entries(record).filter(
    ([k, v]) =>
      !HIDE_KEYS.has(k) &&
      !k.startsWith("_") &&
      v !== null &&
      v !== undefined &&
      v !== "" &&
      typeof v !== "object"
  );
  if (extras.length === 0) return null;
  return (
    <>
      <SectionTitle icon={BarChart3} title={t("insights.additional_info")} />
      <dl
        data-testid="insights-extra-fields"
        className="mb-6 grid grid-cols-1 gap-2 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2"
      >
        {extras.map(([k, v]) => (
          <div
            key={k}
            className="flex items-start justify-between gap-3 border-b border-slate-100 py-1.5 last:border-b-0"
          >
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {formatKey(k)}
            </dt>
            <dd className="truncate text-sm font-medium text-slate-800">{String(v)}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
