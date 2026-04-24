import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import api from "../lib/api";

const NotificationsContext = createContext(null);
const LAST_SEEN_KEY = "fh_notifs_last_seen_id";
const POLL_MS = 30_000;

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const lastSeenRef = useRef(localStorage.getItem(LAST_SEEN_KEY) || null);
  const firstLoadRef = useRef(true);

  const requestBrowserPermission = useCallback(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      try { Notification.requestPermission(); } catch { /* noop */ }
    }
  }, []);

  const poll = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications", { params: { limit: 30 } });
      setNotifications(data);
      const latest = data[0];
      if (!latest) {
        setUnread(0);
        return;
      }
      const prevSeen = lastSeenRef.current;
      if (firstLoadRef.current) {
        firstLoadRef.current = false;
        // Do not spam on very first mount — count unread relative to stored lastSeen
        const idx = prevSeen ? data.findIndex((n) => n.id === prevSeen) : data.length;
        setUnread(idx === -1 ? Math.min(data.length, 9) : idx);
        return;
      }
      if (prevSeen !== latest.id) {
        // New arrivals since last poll
        const idx = prevSeen ? data.findIndex((n) => n.id === prevSeen) : data.length;
        const fresh = idx === -1 ? data : data.slice(0, idx);
        fresh.forEach((n) => {
          // Browser push (if permitted) + toast fallback
          try {
            if (typeof Notification !== "undefined" && Notification.permission === "granted") {
              const notif = new Notification(n.title, { body: n.body || "", tag: n.id });
              notif.onclick = () => {
                window.focus();
                if (n.link) window.location.href = n.link;
              };
            }
          } catch { /* noop */ }
          toast(n.title, { description: n.body });
        });
        setUnread((u) => u + fresh.length);
      }
    } catch {
      /* ignore transient failure */
    }
  }, []);

  useEffect(() => {
    requestBrowserPermission();
    poll();
    const id = setInterval(poll, POLL_MS);
    const onVis = () => document.visibilityState === "visible" && poll();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [poll, requestBrowserPermission]);

  function markAllRead() {
    if (notifications.length) {
      lastSeenRef.current = notifications[0].id;
      localStorage.setItem(LAST_SEEN_KEY, notifications[0].id);
    }
    setUnread(0);
  }

  return (
    <NotificationsContext.Provider
      value={{ notifications, unread, markAllRead, refresh: poll }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
