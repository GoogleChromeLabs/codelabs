/**
 * @license
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const DB_NAME = 'montreal_db';
const DB_VERSION = 1;
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export type StoreName = 'ai_cache' | 'translations_cache' | 'app_state';

interface CacheRecord<T> {
  readonly key: string;
  readonly timestamp: number;
  readonly ttlMs: number;
  readonly data: T;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('ai_cache')) {
        db.createObjectStore('ai_cache', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('translations_cache')) {
        db.createObjectStore('translations_cache', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('app_state')) {
        db.createObjectStore('app_state', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

export function createCacheKey(...parts: (string | number | null | undefined)[]): string {
  return parts
    .map(p => (p === null || p === undefined ? 'none' : String(p).trim().toLowerCase()))
    .join('::');
}

export async function getCached<T>(storeName: StoreName, key: string): Promise<T | null> {
  try {
    const db = await getDb();
    return new Promise<T | null>((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);

      req.onsuccess = () => {
        const record = req.result as CacheRecord<T> | undefined;
        if (!record) {
          resolve(null);
          return;
        }
        if (record.ttlMs > 0 && Date.now() - record.timestamp > record.ttlMs) {
          deleteCached(storeName, key);
          resolve(null);
          return;
        }
        resolve(record.data);
      };

      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function setCached<T>(
  storeName: StoreName,
  key: string,
  data: T,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<void> {
  try {
    const db = await getDb();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const record: CacheRecord<T> = {
        key,
        timestamp: Date.now(),
        ttlMs,
        data,
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore
  }
}

export async function deleteCached(storeName: StoreName, key: string): Promise<void> {
  try {
    const db = await getDb();
    return new Promise<void>((resolve) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
}

export const persistentCache = {
  createKey: createCacheKey,
  get: getCached,
  set: setCached,
  delete: deleteCached,
};
