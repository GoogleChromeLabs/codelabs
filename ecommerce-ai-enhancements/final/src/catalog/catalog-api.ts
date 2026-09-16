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

import { CATALOG, type Product } from './dataset.ts';

export interface CatalogQueryParams {
  readonly categories?: readonly string[];
  readonly activity?: string;
  readonly conditions?: readonly string[];
  readonly excludeProductIds?: readonly string[];
  readonly limit?: number;
}

export class CatalogApi {
  /**
   * Retrieves an individual product by its unique identifier.
   */
  public async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await fetch(`/api/catalog/products/${encodeURIComponent(id)}`);
      if (response.ok) {
        return (await response.json()) as Product;
      }
    } catch {
      // Fall back to in-memory catalog
    }

    return CATALOG.find(p => p.id === id) || null;
  }

  /**
   * Returns candidate products balanced across the requested categories.
   */
  public async queryCandidates(params: CatalogQueryParams): Promise<Product[]> {
    const limit = params.limit || 20;
    const searchParams = new URLSearchParams();

    if (params.categories) {
      for (const cat of params.categories) {
        searchParams.append('categories', cat);
      }
    }
    if (params.activity) {
      searchParams.set('activity', params.activity);
    }
    if (params.excludeProductIds) {
      for (const exc of params.excludeProductIds) {
        searchParams.append('exclude', exc);
      }
    }
    searchParams.set('limit', String(limit));

    try {
      const response = await fetch(`/api/catalog/search?${searchParams.toString()}`);
      if (response.ok) {
        const results = (await response.json()) as Product[];
        if (results.length > 0) return results;
      }
    } catch {
      // Fall back to in-memory query
    }

    const excludeSet = new Set(params.excludeProductIds || []);
    const available = CATALOG.filter(item => !excludeSet.has(item.id));

    const selected: Product[] = [];
    const selectedIds = new Set<string>();

    // 1. Gather balanced candidate slices across requested target categories
    if (params.categories && params.categories.length > 0) {
      const itemsPerCat = Math.max(2, Math.ceil(limit / params.categories.length));
      for (const cat of params.categories) {
        const catItems = available.filter(p => (p.categories as readonly string[]).includes(cat) && !selectedIds.has(p.id));
        for (const item of catItems.slice(0, itemsPerCat)) {
          selected.push(item);
          selectedIds.add(item.id);
          if (selected.length >= limit) break;
        }
        if (selected.length >= limit) break;
      }
    }

    // 2. Backfill with activity matches if pool has remaining capacity
    if (selected.length < limit && params.activity) {
      const actItems = available.filter(p => (p.activities as readonly string[]).includes(params.activity!) && !selectedIds.has(p.id));
      for (const item of actItems) {
        selected.push(item);
        selectedIds.add(item.id);
        if (selected.length >= limit) break;
      }
    }

    // 3. Fill remaining slots from available catalog
    if (selected.length < limit) {
      for (const item of available) {
        if (!selectedIds.has(item.id)) {
          selected.push(item);
          selectedIds.add(item.id);
          if (selected.length >= limit) break;
        }
      }
    }

    return selected.slice(0, limit);
  }
}

export const catalogApi = new CatalogApi();
