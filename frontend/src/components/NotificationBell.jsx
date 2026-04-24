import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Leaf, Store, Sparkles, X } from "lucide-react";
import { useNotifications } from "../context/NotificationsContext";

function iconFor(type) {
  if (type === "scheme") return Leaf;
  if (type === "product") return Store;
  return Sparkles;
}

function timeAgo(iso) {
  const d = new Date(iso);
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

export default function NotificationBell() {
  const { notifications, unread, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function toggle() {
    setOpen((o) => {
      if (!o) markAllRead();
      return !o;
    });
  }

  function handleClick(n) {
    setOpen(false);
    if (n.link) navigate(n.link);
  }

  return (
    <div className="relative">
      <button
        data-testid="notif-bell-btn"
        onClick={toggle}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-emerald-500 hover:text-emerald-700"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span
            data-testid="notif-unread-badge"
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-white"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            data-testid="notif-dropdown"
            className="absolute right-0 top-12 z-50 w-[min(88vw,22rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
              <p className="font-heading text-sm font-semibold text-slate-800">Updates</p>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <li className="flex flex-col items-center justify-center gap-2 px-5 py-8 text-center">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Bell className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-medium text-slate-600">No updates yet</p>
                  <p className="text-xs text-slate-400">We'll notify you when admins post new schemes or products.</p>
                </li>
              ) : (
                notifications.slice(0, 15).map((n) => {
                  const Icon = iconFor(n.type);
                  return (
                    <li key={n.id}>
                      <button
                        data-testid={`notif-item-${n.id}`}
                        onClick={() => handleClick(n)}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50"
                      >
                        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">{n.title}</p>
                          {n.body ? (
                            <p className="line-clamp-2 text-xs text-slate-600">{n.body}</p>
                          ) : null}
                          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">{timeAgo(n.created_at)} ago</p>
                        </div>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
