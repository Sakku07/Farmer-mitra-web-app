import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Leaf, Tractor, Store, Cloud, RefreshCw, Clock } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Layout from "../components/Layout";
import WeatherWidget from "../components/Weather/WeatherWidget";
import MandiBhav from "../components/Mandi/MandiBhav";
import SchemeCard from "../components/Schemes/SchemeCard";
import ProductCard from "../components/Products/ProductCard";
import AdSensePlaceholder from "../components/AdSensePlaceholder";
import { SkeletonCard, SkeletonList } from "../components/Skeleton";
import api, { formatApiErrorDetail } from "../lib/api";
import { swrFetch } from "../lib/cache";

export default function Home() {
  const { t } = useTranslation();
  const [schemes, setSchemes] = useState(null);
  const [products, setProducts] = useState(null);
  const [homeError, setHomeError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(
    async (force = false) => {
      setRefreshing(true);
      setHomeError("");
      try {
        // Parallel fetch for zero-lag — Promise.all so both complete together.
        const [schemesRes, productsRes] = await Promise.all([
          swrFetch(
            "home:schemes",
            () => api.get("/schemes").then((r) => r.data),
            {
              ttl: force ? 0 : 30 * 60 * 1000,
              onRevalidate: (d) =>
                setSchemes(Array.isArray(d) ? d.slice(0, 2) : []),
            }
          ),
          swrFetch(
            "home:products",
            () => api.get("/products").then((r) => r.data),
            {
              ttl: force ? 0 : 30 * 60 * 1000,
              onRevalidate: (d) =>
                setProducts(Array.isArray(d) ? d.slice(0, 4) : []),
            }
          ),
        ]);
        const schemesData = Array.isArray(schemesRes.data)
          ? schemesRes.data
          : [];
        const productsData = Array.isArray(productsRes.data)
          ? productsRes.data
          : [];
        setSchemes(schemesData.slice(0, 2));
        setProducts(productsData.slice(0, 4));
        setLastUpdated(new Date());
      } catch (e) {
        // Backend down earlier left Home stuck on skeletons forever with no
        // error UI. Surface the error + retry instead.
        setHomeError(
          formatApiErrorDetail(e.response?.data?.detail) ||
            "Backend se data nahi aa raha. Thodi der baad retry karein."
        );
      } finally {
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return (
    <Layout showTopAd={false}>
      {/* Greeting + Global refresh */}
      <div
        data-testid="home-greeting"
        className="mb-5 flex items-start justify-between gap-3"
      >
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900 sm:text-4xl">
            {t("home.greeting")}
          </h1>
          <p className="mt-1 text-base text-slate-600">{t("home.subtitle")}</p>
          {lastUpdated && (
            <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              {t("home.last_updated")}: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={() => loadAll(true)}
          disabled={refreshing}
          data-testid="home-refresh-btn"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-70"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {t("mandi.refresh")}
        </button>
      </div>

      <AdSensePlaceholder slot="banner" className="mb-6" />

      {homeError && schemes === null && products === null ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="text-sm font-semibold">Data load nahi hua</p>
          <p className="mt-1 text-sm">{homeError}</p>
          <button
            onClick={() => loadAll(true)}
            disabled={refreshing}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-70"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Retry
          </button>
        </div>
      ) : null}

      {/* Weather container (light emerald) */}
      <FeatureContainer
        testid="home-weather-container"
        icon={Cloud}
        title={t("weather.title")}
        subtitle={t("weather.subtitle")}
        tone="emerald"
        ctaLink="/weather"
        ctaLabel={t("home.view_all")}
      >
        <WeatherWidget compact />
      </FeatureContainer>

      {/* Mandi container (white/slate) */}
      <FeatureContainer
        testid="home-mandi-container"
        icon={Tractor}
        title={t("mandi.title")}
        subtitle={t("home.todays_mandi")}
        tone="slate"
        ctaLink="/mandi"
        ctaLabel={t("home.view_all")}
      >
        <MandiBhav compact initialLimit={15} />
      </FeatureContainer>

      <AdSensePlaceholder slot="inline" className="mb-6" />

      {/* Schemes container (amber tint) */}
      <FeatureContainer
        testid="home-schemes-container"
        icon={Leaf}
        title={t("home.featured_schemes")}
        subtitle={t("schemes.subtitle")}
        tone="amber"
        ctaLink="/schemes"
        ctaLabel={t("home.view_all")}
      >
        {schemes === null ? (
          <SkeletonList count={2} />
        ) : schemes.length === 0 ? (
          <p className="text-sm text-slate-500">{t("schemes.no_schemes")}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {schemes.map((s) => (
              <SchemeCard key={s.id} scheme={s} />
            ))}
          </div>
        )}
      </FeatureContainer>

      {/* Products container (slate) */}
      <FeatureContainer
        testid="home-products-container"
        icon={Store}
        title={t("home.popular_products")}
        subtitle={t("products.subtitle")}
        tone="slate"
        ctaLink="/products"
        ctaLabel={t("home.view_all")}
      >
        {products === null ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </FeatureContainer>
    </Layout>
  );
}

const TONE_STYLES = {
  emerald: {
    wrap: "bg-emerald-50/70 border-emerald-100",
    iconWrap: "bg-emerald-600 text-white",
    label: "text-emerald-800",
    ring: "ring-emerald-100",
  },
  slate: {
    wrap: "bg-white border-slate-200",
    iconWrap: "bg-slate-900 text-white",
    label: "text-slate-600",
    ring: "ring-slate-100",
  },
  amber: {
    wrap: "bg-amber-50/60 border-amber-100",
    iconWrap: "bg-amber-600 text-white",
    label: "text-amber-800",
    ring: "ring-amber-100",
  },
};

function FeatureContainer({
  icon: Icon,
  title,
  subtitle,
  tone = "slate",
  ctaLink,
  ctaLabel,
  children,
  testid,
}) {
  const s = TONE_STYLES[tone] || TONE_STYLES.slate;
  return (
    <section
      data-testid={testid}
      className={`mb-6 overflow-hidden rounded-2xl border ${s.wrap} shadow-sm`}
    >
      <header className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ${s.iconWrap} ${s.ring}`}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-heading text-lg font-bold leading-tight text-slate-900 sm:text-xl">
              {title}
            </h2>
            {subtitle ? (
              <p className={`text-xs font-medium ${s.label}`}>{subtitle}</p>
            ) : null}
          </div>
        </div>
        {ctaLink ? (
          <Link
            to={ctaLink}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/60 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm hover:border-emerald-400"
          >
            {ctaLabel} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </header>
      <div className="px-4 pb-5 sm:px-5">{children}</div>
    </section>
  );
}
