/**
 * AdSense-ready ad slot.
 *
 * Behaviour:
 * - When `REACT_APP_ADSENSE_CLIENT` (e.g. "ca-pub-XXXXXXXXXXXXXXXX") is set
 *   AND a non-empty `slotId` is provided (prop or env), this renders a real
 *   `<ins class="adsbygoogle">` element so that Google AdSense fills it after
 *   approval.
 * - Otherwise it renders a clean, professional placeholder marked "Sponsored"
 *   that reserves the same vertical space — preventing CLS and looking native
 *   to the page until the ad serves.
 */
import { useEffect, useRef } from "react";

const SIZE_CLASS = {
  banner: "h-24 sm:h-28",
  inline: "h-24",
  sidebar: "h-64",
  square: "h-[280px]",
};

export default function AdSensePlaceholder({
  slot = "banner",
  slotId,
  className = "",
  format = "auto",
}) {
  const client = process.env.REACT_APP_ADSENSE_CLIENT;
  const adRef = useRef(null);

  useEffect(() => {
    if (!client || !slotId) return;
    try {
      // eslint-disable-next-line no-undef
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ignore */
    }
  }, [client, slotId]);

  const sizeClass = SIZE_CLASS[slot] || SIZE_CLASS.banner;

  if (client && slotId) {
    return (
      <div
        data-testid={`ad-slot-${slot}`}
        className={`w-full ${sizeClass} ${className}`}
      >
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "block", width: "100%", height: "100%" }}
          data-ad-client={client}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return (
    <aside
      data-testid={`ad-placeholder-${slot}`}
      className={`relative flex w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white ${sizeClass} ${className}`}
      aria-label="Sponsored content"
    >
      <span className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 ring-1 ring-slate-200">
        Sponsored
      </span>
      <div className="text-center">
        <p className="font-heading text-sm font-semibold text-slate-700">
          Advertisement
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          Your ad could be here
        </p>
      </div>
    </aside>
  );
}
