import axios from "axios";

// Resolve backend base URL robustly.
// - CRA inlines REACT_APP_* vars at BUILD time only, so Netlify must set
//   REACT_APP_BACKEND_URL before `npm run build`.
// - Older builds used REACT_APP_API_URL, keep it as a fallback.
// - Final fallback is the WORKING backend — the old mykisanmitra service
//   on Render, which already has its env vars (MONGO_URL etc.).
//   The new farmer-mitra service has blank env, so it must NOT be
//   the fallback, or the frontend would call a dead backend again.
const RAW_BASE =
  process.env.REACT_APP_BACKEND_URL ||
  process.env.REACT_APP_API_URL ||
  "https://mykisanmitra.onrender.com";

const BASE = String(RAW_BASE || "").replace(/\/+$/, "");
export const API = `${BASE}/api`;

const api = axios.create({
  baseURL: API,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fh_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export default api;
