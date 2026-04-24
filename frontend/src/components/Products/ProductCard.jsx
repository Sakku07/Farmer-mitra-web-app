import { useTranslation } from "react-i18next";
import { ShoppingCart } from "lucide-react";

export default function ProductCard({ product }) {
  const { t } = useTranslation();
  return (
    <article
      data-testid="product-card"
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          {product.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-heading text-base font-semibold text-gray-900">
          {product.name}
        </h3>
        <p className="mt-2 font-heading text-xl font-bold text-gray-900">
          ₹{Number(product.price).toLocaleString("en-IN")}
        </p>
        <a
          href={product.amazon_url}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={`product-buy-${product.id}`}
          className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
        >
          <ShoppingCart className="h-4 w-4" />
          {t("products.buy_amazon")}
        </a>
      </div>
    </article>
  );
}
