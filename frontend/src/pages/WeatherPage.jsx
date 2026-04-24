import { useTranslation } from "react-i18next";
import Layout from "../components/Layout";
import WeatherWidget from "../components/Weather/WeatherWidget";
import AdSensePlaceholder from "../components/AdSensePlaceholder";

export default function WeatherPage() {
  const { t } = useTranslation();
  return (
    <Layout showTopAd={false}>
      <div className="mb-5">
        <h1 data-testid="weather-page-title" className="font-heading text-3xl font-bold text-gray-900 sm:text-4xl">
          {t("weather.title")}
        </h1>
        <p className="mt-1 text-base text-gray-600">{t("weather.subtitle")}</p>
      </div>
      <AdSensePlaceholder slot="banner" className="mb-5" />
      <WeatherWidget />
    </Layout>
  );
}
