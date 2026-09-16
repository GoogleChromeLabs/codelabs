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

import type { WeatherCondition, ActivityType, ProductCategory, Product } from '../catalog/dataset.ts';
import type { HistoryTimelineEvent } from '../state/history-store.ts';

export interface JourneyProfile {
  readonly impliedConditions: readonly WeatherCondition[];
  readonly primaryActivity: ActivityType;
  readonly targetCategories: readonly ProductCategory[];
  readonly equipmentRationale?: string;
}

export interface ProfilerInputContext {
  readonly timeline: readonly HistoryTimelineEvent[];
  readonly cart: readonly { productId: string; quantity: number }[];
  readonly prompt?: string;
  readonly currentProductId?: string | null;
  readonly history?: readonly { productId: string; timestamp: number }[];
}

/**
 * Formats the shopper's chronological browsing timeline and active shopping cart
 * into a structured text summary for the prompt.
 */
export function formatShopperJourney(
  context: ProfilerInputContext,
  catalogMap: ReadonlyMap<string, Product>
): string {
  // Format chronological sequence from earliest to latest (max 5 items)
  const chronologicalEvents = [...context.timeline].slice(0, 5).reverse();

  const formattedTimeline = chronologicalEvents
    .map((evt, idx) => {
      if (evt.type === 'activity') {
        return `${idx + 1}. [Activity] ${evt.activity}`;
      }
      const p = catalogMap.get(evt.productId);
      if (p) {
        return `${idx + 1}. [Product] ${p.name} (Cat: ${p.categories.join('/')} | Act: ${p.activities.join('/')} | Cond: ${p.conditions.join('/')})`;
      }
      return `${idx + 1}. [Product] ${evt.productId}`;
    })
    .join('\n');

  const cartDetails = context.cart
    .map(c => {
      const p = catalogMap.get(c.productId);
      return p ? `${p.name} (x${c.quantity})` : '';
    })
    .filter(Boolean)
    .join(', ');

  return `
CHRONOLOGICAL SHOPPER JOURNEY:
${formattedTimeline || '1. [Activity] General Outdoor'}

ACTIVE SHOPPING CART (3.0x PURCHASE INTENT):
${cartDetails || 'Empty'}
`.trim();
}
