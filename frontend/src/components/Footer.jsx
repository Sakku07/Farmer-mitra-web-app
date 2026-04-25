import { Link } from "react-router-dom";
import { Sprout, Mail, FileText, ShieldCheck } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      data-testid="site-footer"
      className="mt-10 border-t border-slate-200 bg-white/60"
    >
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Sprout className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="font-heading text-sm font-bold text-slate-900">
                Farmer Helper
              </p>
              <p className="text-[11px] text-slate-500">
                Mandi Bhav · Weather · Govt Schemes
              </p>
            </div>
          </div>

          <nav
            data-testid="footer-links"
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-slate-600"
          >
            <Link
              to="/about"
              data-testid="footer-about-link"
              className="hover:text-emerald-700"
            >
              About
            </Link>
            <Link
              to="/terms"
              data-testid="footer-terms-link"
              className="inline-flex items-center gap-1 hover:text-emerald-700"
            >
              <FileText className="h-3.5 w-3.5" /> Terms
            </Link>
            <Link
              to="/privacy"
              data-testid="footer-privacy-link"
              className="inline-flex items-center gap-1 hover:text-emerald-700"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Privacy
            </Link>
            <Link
              to="/contact"
              data-testid="footer-contact-link"
              className="inline-flex items-center gap-1 hover:text-emerald-700"
            >
              <Mail className="h-3.5 w-3.5" /> Contact
            </Link>
          </nav>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          © {year} Farmer Helper. Mandi prices are sourced from{" "}
          <a
            href="https://data.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-emerald-700"
          >
            data.gov.in
          </a>
          ; weather data from{" "}
          <a
            href="https://openweathermap.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-emerald-700"
          >
            OpenWeather
          </a>
          . Information is provided for guidance only and is not a guarantee of
          outcomes.
        </p>
      </div>
    </footer>
  );
}
