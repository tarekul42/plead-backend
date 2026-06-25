const store = new Map<string, { data: unknown; expiresAt: number }>();
const MAX_SIZE = 500;

// Simple LRU: delete oldest entry when over limit
function evictIfNeeded() {
  if (store.size >= MAX_SIZE) {
    const oldestKey = store.keys().next().value;
    if (oldestKey !== undefined) store.delete(oldestKey);
  }
}

export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  // Move to end (LRU refresh)
  store.delete(key);
  store.set(key, entry);
  return entry.data as T;
}

export function cacheSet(key: string, data: unknown, ttlMs: number): void {
  evictIfNeeded();
  store.set(key, { data, expiresAt: Date.now() + ttlMs });
}
