import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Leaf, Tractor, Store } from "lucide-react";
import Layout from "../components/Layout";
import WeatherWidget from "../components/Weather/WeatherWidget";
import MandiBhav from "../components/Mandi/MandiBhav";
import SchemeCard from "../components/Schemes/SchemeCard";
import ProductCard from "../components/Products/ProductCard";
import AdSensePlaceholder from "../components/AdSensePlaceholder";
import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Home() {
  const { t } = useTranslation();
  const [schemes, setSchemes] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/schemes").then((r) => setSchemes(r.data.slice(0, 2))).catch(() => {});
    api.get("/products").then((r) => setProducts(r.data.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <Layout showTopAd={true}>
      {/* Greeting */}
      <div data-testid="home-greeting" className="mb-5">
        <h1 className="font-heading text-3xl font-bold text-gray-900 sm:text-4xl">
          {t("home.greeting")}
        </h1>
        <p className="mt-1 text-base text-gray-600">{t("home.subtitle")}</p>
      </div>

      {/* Weather */}
      <section className="mb-6">
        <WeatherWidget compact={true} />
      </section>

      {/* Mandi preview */}
      <section className="mb-8">
        <HeaderRow
          to="/mandi"
          icon={Tractor}
          title={t("home.todays_mandi")}
          viewAll={t("home.view_all")}
        />
        <MandiBhav compact={true} initialLimit={20} />
      </section>

      <AdSensePlaceholder slot="inline" className="mb-8" />

      {/* Schemes preview */}
      <section className="mb-8">
        <HeaderRow
          to="/schemes"
          icon={Leaf}
          title={t("home.featured_schemes")}
          viewAll={t("home.view_all")}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {schemes.map((s) => (
            <SchemeCard key={s.id} scheme={s} />
          ))}
        </div>
      </section>

      {/* Products preview */}
      <section className="mb-6">
        <HeaderRow
          to="/products"
          icon={Store}
          title={t("home.popular_products")}
          viewAll={t("home.view_all")}
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </Layout>
  );
}

function HeaderRow({ to, icon: Icon, title, viewAll }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-2">
      <h2 className="font-heading text-xl font-bold text-gray-900 sm:text-2xl flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </h2>
      <Link
        to={to}
        className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        {viewAll} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
