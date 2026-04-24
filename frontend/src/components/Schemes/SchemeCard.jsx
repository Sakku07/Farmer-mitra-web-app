import { useTranslation } from "react-i18next";
import { Leaf, ExternalLink } from "lucide-react";

export default function SchemeCard({ scheme }) {
  const { t } = useTranslation();
  return (
    <article
      data-testid="scheme-card"
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:flex-row"
    >
      {scheme.image_url ? (
        <div className="relative h-40 w-full shrink-0 overflow-hidden sm:h-auto sm:w-44">
          <img
            src={scheme.image_url}
            alt={scheme.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <Leaf className="h-3 w-3" /> {scheme.category}
          </span>
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-lg font-bold leading-tight text-gray-900 sm:text-xl">
          {scheme.name}
        </h3>
        <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-emerald-700">
          {t("schemes.benefit")}
        </p>
        <p className="mt-0.5 text-base text-gray-800">{scheme.benefit}</p>
        {scheme.description ? (
          <p className="mt-3 line-clamp-2 text-sm text-gray-600">{scheme.description}</p>
        ) : null}
        <div className="mt-4 flex items-center justify-between">
          <a
            href={scheme.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`scheme-apply-${scheme.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            {t("schemes.apply_now")} <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}
