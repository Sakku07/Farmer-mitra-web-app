import { useTranslation } from "react-i18next";

export default function AdSensePlaceholder({ slot = "banner", className = "" }) {
  const { t } = useTranslation();
  const heights = {
    banner: "h-20 sm:h-24",
    inline: "h-24",
    sidebar: "h-64",
    square: "h-40",
  };
  const h = heights[slot] || heights.banner;
  return (
    <div
      data-testid={`ad-placeholder-${slot}`}
      className={`ad-placeholder w-full ${h} ${className}`}
      aria-hidden="true"
    >
      <span className="uppercase tracking-wide text-xs font-medium">
        {t("common.ad_placeholder")} · {slot}
      </span>
    </div>
  );
}
