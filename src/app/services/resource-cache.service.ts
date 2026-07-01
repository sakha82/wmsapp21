import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

@Injectable({ providedIn: 'root' })
export class ResourceCacheService {
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private readonly defaultTtlMs = 60 * 60 * 1000; // 1 hour

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs = this.defaultTtlMs): void {
    this.cache.set(key, { data, expiry: Date.now() + ttlMs });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  invalidate(key?: string): void {
    if (key) {
      this.cache.delete(key);
      return;
    }
    this.cache.clear();
  }

  isStaticResourceUrl(url: string): boolean {
    return url.includes('assets/resources/') && url.endsWith('.json');
  }

  cacheKeyForUrl(url: string): string {
    return url.split('?')[0];
  }

  /** SSR-safe: in-memory cache works on both server and browser within a single request/session. */
  isEnabled(): boolean {
    return true;
  }

  logContext(): string {
    return isPlatformBrowser(this.platformId) ? 'browser' : 'server';
  }
}
