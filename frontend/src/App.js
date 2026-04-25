import "@/App.css";
import "@/i18n";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import Home from "@/pages/Home";
import MandiPage from "@/pages/MandiPage";
import WeatherPage from "@/pages/WeatherPage";
import SchemesPage from "@/pages/SchemesPage";
import ProductsPage from "@/pages/ProductsPage";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import InsightsPage from "@/pages/InsightsPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";
import ContactPage from "@/pages/ContactPage";
import AboutPage from "@/pages/AboutPage";

function App() {
  useEffect(() => {
    // Remove the Emergent badge for a clean, custom brand look
    const strip = () => {
      document
        .querySelectorAll('#emergent-badge, a[href*="app.emergent.sh"]')
        .forEach((el) => el.remove());
    };
    strip();
    const mo = new MutationObserver(strip);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);

  return (
    <AuthProvider>
      <NotificationsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mandi" element={<MandiPage />} />
            <Route path="/insights/:commodity" element={<InsightsPage />} />
            <Route path="/weather" element={<WeatherPage />} />
            <Route path="/schemes" element={<SchemesPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-center" />
      </NotificationsProvider>
    </AuthProvider>
  );
}

export default App;
