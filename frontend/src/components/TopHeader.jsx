import { Link } from "react-router-dom";
import { Sprout, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

export default function TopHeader() {
  const { t } = useTranslation();
  return (
    <header
      data-testid="top-header"
      className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Sprout className="h-5 w-5" />
          </span>
          <span className="font-heading text-lg font-bold leading-tight text-gray-900">
            {t("app.name")}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            to="/admin"
            data-testid="header-admin-link"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            {t("common.login")}
          </Link>
        </div>
      </div>
    </header>
  );
}
