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

import { getPromptSession } from './prompt-api.ts';
import { journeyProfileSchema } from './recommendation-schemas.ts';
import { PRODUCT_CATEGORIES, type WeatherCondition, type ActivityType, type ProductCategory, type Product } from '../catalog/dataset.ts';
import type { HistoryTimelineEvent } from '../state/history-store.ts';

export const JOURNEY_PROFILER_SYSTEM_PROMPT = `
You are the Technical Outfitting Director for Mont-Royal Plein Air.
Analyze the shopper's chronological browsing timeline of navigated activities and viewed products.
Synthesize the cumulative implied weather conditions, overarching primary outdoor activity, and a holistic set of 3 to 6 target complementary gear categories that complete their outfitting journey across all explored gear lines.
`.trim();

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
  readonly activeActivity?: string | null;
}

export async function inferJourneyProfile(
  context: ProfilerInputContext,
  catalogMap: ReadonlyMap<string, Product>
): Promise<JourneyProfile> {
  const session = await getPromptSession(JOURNEY_PROFILER_SYSTEM_PROMPT);

  // Format chronological sequence from earliest to latest (max 5 items)
  const chronologicalEvents = [...context.timeline].slice(0, 5).reverse();

  const formattedTimeline = chronologicalEvents.map((evt, idx) => {
    if (evt.type === 'activity') {
      return `${idx + 1}. [Activity] ${evt.activity}`;
    }
    const p = catalogMap.get(evt.productId);
    if (p) {
      return `${idx + 1}. [Product] ${p.name} (Cat: ${p.categories.join('/')} | Act: ${p.activities.join('/')} | Cond: ${p.conditions.join('/')})`;
    }
    return `${idx + 1}. [Product] ${evt.productId}`;
  }).join('\n');

  const cartDetails = context.cart
    .map(c => {
      const p = catalogMap.get(c.productId);
      return p ? `${p.name} (x${c.quantity})` : '';
    })
    .filter(Boolean)
    .join(', ');

  const promptText = `
CHRONOLOGICAL SHOPPER JOURNEY:
${formattedTimeline || '1. [Activity] General Outdoor'}

ACTIVE SHOPPING CART (3.0x PURCHASE INTENT):
${cartDetails || 'Empty'}

Synthesize the holistic journey profile and select 3-6 complementary categories.
`.trim();

  try {
    const rawJson = await session.prompt(promptText, {
      responseConstraint: journeyProfileSchema,
      expectedInputLanguages: ['en'],
      expectedOutputLanguages: ['en'],
      expectedInputs: [{ type: 'text', language: 'en' }],
      expectedOutputs: [{ type: 'text', language: 'en' }],
      outputLanguage: 'en',
    });

    const parsed = JSON.parse(rawJson) as {
      primaryActivity: ActivityType;
      impliedConditions: WeatherCondition[];
      targetCategories: string[];
    };

    // Normalize target categories to dataset categories
    const normalizedCategories: ProductCategory[] = [];
    for (const catStr of parsed.targetCategories || []) {
      const match = PRODUCT_CATEGORIES.find(
        c => c.toLowerCase() === catStr.toLowerCase().trim() ||
             catStr.toLowerCase().includes(c.toLowerCase()) ||
             c.toLowerCase().includes(catStr.toLowerCase())
      );
      if (match && !normalizedCategories.includes(match)) {
        normalizedCategories.push(match);
      }
    }

    const targetCategories: readonly ProductCategory[] = normalizedCategories.length > 0
      ? normalizedCategories
      : (['Tents', 'Sleeping Bags', 'Pads', 'Stoves', 'Lanterns'] as const);

    return {
      primaryActivity: parsed.primaryActivity || 'Camping',
      impliedConditions: (parsed.impliedConditions && parsed.impliedConditions.length > 0)
        ? parsed.impliedConditions
        : ['Mild', 'Dry'],
      targetCategories,
      equipmentRationale: `${parsed.primaryActivity || 'Outdoor'} Companion Kit`,
    };
  } finally {
    session.destroy();
  }
}
