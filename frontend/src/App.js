import "@/App.css";
import "@/i18n";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import Home from "@/pages/Home";
import MandiPage from "@/pages/MandiPage";
import WeatherPage from "@/pages/WeatherPage";
import SchemesPage from "@/pages/SchemesPage";
import ProductsPage from "@/pages/ProductsPage";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mandi" element={<MandiPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/schemes" element={<SchemesPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-center" />
    </AuthProvider>
  );
}

export default App;
