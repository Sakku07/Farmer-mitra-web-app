import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Tractor, Cloud, Leaf, Store } from "lucide-react";

const TABS = [
  { to: "/", icon: Home, key: "home" },
  { to: "/mandi", icon: Tractor, key: "mandi" },
  { to: "/weather", icon: Cloud, key: "weather" },
  { to: "/schemes", icon: Leaf, key: "schemes" },
  { to: "/products", icon: Store, key: "products" },
];

export default function BottomTabBar() {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  return (
    <nav
      data-testid="bottom-tab-bar"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="mx-auto flex h-16 max-w-4xl items-center justify-around">
        {TABS.map(({ to, icon: Icon, key }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <li key={key} className="flex-1">
              <Link
                to={to}
                data-testid={`tab-${key}`}
                className={`flex h-full w-full flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
                  active
                    ? "text-emerald-600"
                    : "text-gray-500 hover:text-emerald-600"
                }`}
              >
                <Icon className={`h-6 w-6 ${active ? "stroke-[2.2]" : ""}`} />
                <span>{t(`nav.${key}`)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
