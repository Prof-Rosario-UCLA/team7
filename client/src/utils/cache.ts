/**
 * Simple localStorage-based caching utility for GET requests.
 *
 * Stores JSON responses with a timestamp and retrieves them
 * if not expired.
 */

export async function fetchWithLocalCache<T>(
    key: string,
    url: string,
    maxAgeMs: number = 5 * 60 * 1000 // default: 5 minutes
  ): Promise<T> {
    try {
      const cached = localStorage.getItem(key);
  
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const isFresh = Date.now() - timestamp < maxAgeMs;
  
        if (isFresh) {
          console.log(`📦 Cache hit for "${key}"`);
          return data;
        } else {
          console.log(`⚠️ Cache expired for "${key}"`);
          localStorage.removeItem(key);
        }
      }
  
      console.log(`🌐 Fetching fresh data for "${key}" from ${url}`);
      const res = await fetch(url);
  
      if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  
      const data = await res.json();
      localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  
      return data;
    } catch (error) {
      console.error(`🚫 Error in fetchWithLocalCache for key "${key}":`, error);
      throw error;
    }
  }
  
  /**
   Clear specific or all cache entries
   */
  export function clearCache(key?: string) {
    if (key) {
      localStorage.removeItem(key);
      console.log(`🧹 Cleared cache for "${key}"`);
    } else {
      localStorage.clear();
      console.log('🧼 Cleared all localStorage cache');
    }
  }
  