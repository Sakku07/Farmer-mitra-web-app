import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Cloud, CloudRain, CloudSun, Sun, CloudSnow, CloudLightning, CloudFog,
  Droplets, Wind, Thermometer, MapPin, AlertTriangle, Navigation, RefreshCw,
} from "lucide-react";
import api, { formatApiErrorDetail } from "../../lib/api";

function iconFor(main) {
  const m = (main || "").toLowerCase();
  if (m.includes("clear")) return Sun;
  if (m.includes("thunder")) return CloudLightning;
  if (m.includes("rain") || m.includes("drizzle")) return CloudRain;
  if (m.includes("snow")) return CloudSnow;
  if (m.includes("mist") || m.includes("fog") || m.includes("haze") || m.includes("smoke"))
    return CloudFog;
  if (m.includes("cloud")) return CloudSun;
  return Cloud;
}

export default function WeatherWidget({ compact = false }) {
  const { t } = useTranslation();
  const [coords, setCoords] = useState(null);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load(lat, lon) {
    setStatus("loading");
    setError("");
    try {
      const { data } = await api.get("/weather", { params: { lat, lon } });
      setData(data);
      setStatus("ready");
    } catch (e) {
      setError(formatApiErrorDetail(e.response?.data?.detail) || t("weather.error"));
      setStatus("error");
    }
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setNotice(t("weather.location_denied"));
      setCoords({ lat: 28.6139, lon: 77.209 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => {
        setNotice(t("weather.location_denied"));
        setCoords({ lat: 28.6139, lon: 77.209 });
      },
      { timeout: 8000 }
    );
  }

  useEffect(() => {
    detectLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (coords) load(coords.lat, coords.lon);
  }, [coords]);

  if (status === "loading" || status === "idle") {
    return (
      <div
        data-testid="weather-loading"
        className="rounded-2xl border border-gray-200 bg-gradient-to-br from-sky-50 to-emerald-50 p-6 text-center text-gray-600"
      >
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        {t("weather.loading")}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        data-testid="weather-error"
        className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800"
      >
        <div className="mb-2 flex items-center gap-2 font-semibold">
          <AlertTriangle className="h-5 w-5" />
          {t("weather.error")}
        </div>
        <p className="text-sm">{error}</p>
        <button
          onClick={() => coords && load(coords.lat, coords.lon)}
          data-testid="weather-retry-btn"
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          <RefreshCw className="h-4 w-4" /> {t("common.retry")}
        </button>
      </div>
    );
  }

  const Icon = iconFor(data.current.main);

  return (
    <div
      data-testid="weather-widget"
      className="overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50 shadow-sm"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              {data.location.name}
              {data.location.country ? `, ${data.location.country}` : ""}
            </p>
            <h3 className="font-heading text-5xl font-bold text-gray-900 sm:text-6xl">
              {Math.round(data.current.temp)}°
              <span className="align-top text-2xl text-gray-500">C</span>
            </h3>
            <p className="mt-1 text-base capitalize text-gray-700">
              {data.current.description}
            </p>
          </div>
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-emerald-600 shadow-sm">
            <Icon className="h-12 w-12" />
          </span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-white/70 p-3 text-center">
          <div data-testid="weather-humidity">
            <Droplets className="mx-auto mb-0.5 h-4 w-4 text-sky-600" />
            <p className="text-xs text-gray-500">{t("weather.humidity")}</p>
            <p className="text-base font-semibold text-gray-900">{data.current.humidity}%</p>
          </div>
          <div className="border-x border-gray-100" data-testid="weather-wind">
            <Wind className="mx-auto mb-0.5 h-4 w-4 text-gray-600" />
            <p className="text-xs text-gray-500">{t("weather.wind")}</p>
            <p className="text-base font-semibold text-gray-900">{Math.round(data.current.wind_speed)} m/s</p>
          </div>
          <div data-testid="weather-feels">
            <Thermometer className="mx-auto mb-0.5 h-4 w-4 text-amber-600" />
            <p className="text-xs text-gray-500">{t("weather.feels_like")}</p>
            <p className="text-base font-semibold text-gray-900">{Math.round(data.current.feels_like)}°</p>
          </div>
        </div>

        {notice ? (
          <p className="mt-3 text-xs text-amber-700">{notice}</p>
        ) : null}
      </div>

      {!compact && data.forecast.length > 0 && (
        <div className="border-t border-gray-100 bg-white/60 p-5">
          <h4 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-gray-700">
            {t("weather.forecast")}
          </h4>
          <ul className="grid grid-cols-3 gap-3">
            {data.forecast.map((d) => {
              const DIcon = iconFor(d.main);
              const date = new Date(d.date);
              const label = date.toLocaleDateString(undefined, {
                weekday: "short",
                day: "numeric",
              });
              return (
                <li
                  key={d.date}
                  data-testid="weather-forecast-day"
                  className="rounded-xl bg-white p-3 text-center shadow-sm"
                >
                  <p className="text-xs font-medium text-gray-500">{label}</p>
                  <DIcon className="mx-auto my-2 h-8 w-8 text-emerald-600" />
                  <p className="text-base font-bold text-gray-900">{Math.round(d.temp)}°</p>
                  <p className="text-xs capitalize text-gray-500">{d.main}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {!compact && (
        <div className="border-t border-gray-100 bg-white/60 px-5 pb-4 pt-3">
          <button
            onClick={detectLocation}
            data-testid="weather-use-location-btn"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <Navigation className="h-4 w-4" />
            {t("weather.use_location")}
          </button>
        </div>
      )}
    </div>
  );
}
