// Tiny localStorage-based SWR cache. Returns cached data instantly, revalidates
// in background. TTL is 30 min for "fresh"; older-than-TTL will still be shown
// instantly but marked stale so the caller revalidates.

const DEFAULT_TTL_MS = 30 * 60 * 1000;
const PREFIX = "fh_cache::";

export function readCache(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !("ts" in parsed)) return null;
    return parsed; // {ts, data}
  } catch {
    return null;
  }
}

export function writeCache(key, data) {
  try {
    localStorage.setItem(
      PREFIX + key,
      JSON.stringify({ ts: Date.now(), data }),
    );
  } catch {
    /* quota exceeded — ignore */
  }
}

export function isFresh(entry, ttl = DEFAULT_TTL_MS) {
  if (!entry) return false;
  return Date.now() - entry.ts < ttl;
}

/**
 * swrFetch(key, fetcher, ttl)
 * - Returns {data, fromCache, ts}.
 * - If fresh cache exists → returns cached, does NOT refetch.
 * - If stale cache exists → returns cached AND kicks off a background refetch
 *   (caller can observe via the optional onRevalidate callback).
 * - If no cache → awaits fetcher.
 */
export async function swrFetch(
  key,
  fetcher,
  { ttl = DEFAULT_TTL_MS, onRevalidate } = {},
) {
  const entry = readCache(key);
  if (entry) {
    if (!isFresh(entry, ttl)) {
      // revalidate in background
      fetcher()
        .then((data) => {
          writeCache(key, data);
          onRevalidate && onRevalidate(data);
        })
        .catch(() => {});
    }
    return { data: entry.data, fromCache: true, ts: entry.ts };
  }
  const data = await fetcher();
  writeCache(key, data);
  return { data, fromCache: false, ts: Date.now() };
}

export function clearCache(prefix) {
  const full = PREFIX + (prefix || "");
  Object.keys(localStorage).forEach((k) => {
    if (k.startsWith(full)) localStorage.removeItem(k);
  });
}
