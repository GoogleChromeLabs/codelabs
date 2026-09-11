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
import { reRankerSelectionSchema } from './recommendation-schemas.ts';
import type { Product } from '../catalog/dataset.ts';
import type { JourneyProfile } from './journey-profiler.ts';

export const RE_RANKER_SYSTEM_PROMPT = `
You are the Technical Outfitting Director for Mont-Royal Plein Air.
Rank complementary gear using strict priority tiers:
1. HIGHEST PRIORITY (BOUGHT AS A SET / DIRECT PAIRINGS): Products designed as direct companions, paired components, or fitted accessories to the active product (e.g. Tent <-> Fitted Footprint, Stove <-> Matching Fuel/Cookset, Sleeping Bag <-> Sleeping Pad).
2. SECOND PRIORITY (ACTIVE CART COMPANIONS): Items that pair directly with products already in the cart (3.0x weight).
3. THIRD PRIORITY (JOURNEY COMPLETION): Items that complete the shopper's overarching outdoor outfitting journey.
4. MANDATORY (DEPRIORITIZE REPLACEMENTS): Strongly avoid recommending competing replacement products in categories the shopper already has in their cart (e.g., if a tent is in the cart, do NOT recommend other tents; recommend companion gear like footprints, sleeping pads, or stoves instead).
`.trim();

export interface RecommendedItem {
  readonly product: Product;
  readonly synergyRationale: string;
}

function isReplacementCandidate(candidate: Product, cartProducts?: readonly Product[]): boolean {
  if (!cartProducts || cartProducts.length === 0) return false;
  const nameLower = candidate.name.toLowerCase();
  const isCompanion =
    nameLower.includes('footprint') ||
    nameLower.includes('fuel') ||
    nameLower.includes('canister') ||
    nameLower.includes('stake') ||
    nameLower.includes('liner') ||
    nameLower.includes('cube') ||
    nameLower.includes('cover') ||
    nameLower.includes('gaiter') ||
    nameLower.includes('whistle');
  if (isCompanion) return false;

  for (const item of cartProducts) {
    if (candidate.specs?.['Compatibility']?.toLowerCase().includes(item.name.toLowerCase())) return false;
    const commonCategories = candidate.categories.filter(c => item.categories.includes(c));
    if (commonCategories.length > 0) return true;
  }
  return false;
}

export async function rankComplementaryGear(
  profile: JourneyProfile,
  candidates: readonly Product[],
  currentProduct?: Product | null,
  cartProducts?: readonly Product[],
  limit: number = 5
): Promise<readonly RecommendedItem[]> {
  if (candidates.length === 0) return [];

  const session = await getPromptSession(RE_RANKER_SYSTEM_PROMPT);
  const cartCategories = new Set(cartProducts?.flatMap(p => p.categories) || []);

  const currentText = currentProduct
    ? `CURRENT PRODUCT: ${currentProduct.name} (ID: "${currentProduct.id}") | Categories: ${currentProduct.categories.join('/')} | Activity: ${currentProduct.activities.join('/')} | Conditions: ${currentProduct.conditions.join('/')}`
    : '';

  const cartText = (cartProducts && cartProducts.length > 0)
    ? `CART ITEMS (3.0x PRIORITY): ${cartProducts.map(p => `${p.name} (ID: "${p.id}")`).join(', ')}`
    : '';

  const cartCatText = cartCategories.size > 0
    ? `CATEGORIES ALREADY IN CART (DEPRIORITIZE REPLACEMENTS): ${[...cartCategories].join(', ')}`
    : '';

  const prioritizedCandidates = [...candidates].sort((a, b) => {
    const aRepl = isReplacementCandidate(a, cartProducts) ? 1 : 0;
    const bRepl = isReplacementCandidate(b, cartProducts) ? 1 : 0;
    return aRepl - bRepl;
  });

  const candidateList = prioritizedCandidates
    .slice(0, 20)
    .map(c => `- ID: "${c.id}" | ${c.name} | Cat: ${c.categories.join('/')} | $${c.price}`)
    .join('\n');

  const promptText = `
${currentText}
${cartText}
${cartCatText}
JOURNEY PROFILE: Activity: ${profile.primaryActivity} | Conditions: ${profile.impliedConditions.join(', ')}

CANDIDATES (${candidates.length} items):
${candidateList}

PRIORITIZATION INSTRUCTIONS:
1. Prioritize direct companions and set pairings for the current product or cart items (e.g. footprint for tent, fuel for stove, pad for sleeping bag).
2. Prioritize items paired with cart items (3.0x weight).
3. DEPRIORITIZE REPLACEMENTS: If a category is already in the cart (e.g. Tents), do NOT recommend another item in that category. Recommend accessories or missing kit essentials instead.
4. Complete the overarching expedition journey.

Rank top 5 product IDs.
`.trim();

  try {
    const rawJson = await session.prompt(promptText, {
      responseConstraint: reRankerSelectionSchema,
      expectedInputLanguages: ['en'],
      expectedOutputLanguages: ['en'],
      expectedInputs: [{ type: 'text', language: 'en' }],
      expectedOutputs: [{ type: 'text', language: 'en' }],
      outputLanguage: 'en',
    });

    const parsed = JSON.parse(rawJson) as {
      rankedProductIds: string[];
    };

    const nonReplacements: RecommendedItem[] = [];
    const replacements: RecommendedItem[] = [];

    for (const id of parsed.rankedProductIds || []) {
      const product = candidates.find(c => c.id === id);
      if (product && !nonReplacements.some(r => r.product.id === product.id) && !replacements.some(r => r.product.id === product.id)) {
        const cat = product.categories[0] || 'Gear';
        const item = { product, synergyRationale: `${profile.primaryActivity} Synergy • ${cat}` };
        if (isReplacementCandidate(product, cartProducts)) {
          replacements.push(item);
        } else {
          nonReplacements.push(item);
        }
      }
    }

    const results: RecommendedItem[] = [...nonReplacements];

    // If still under limit, backfill with non-replacement candidates
    if (results.length < limit) {
      for (const cand of prioritizedCandidates) {
        if (!isReplacementCandidate(cand, cartProducts) && !results.some(r => r.product.id === cand.id)) {
          results.push({
            product: cand,
            synergyRationale: `${profile.primaryActivity} Synergy • ${cand.categories[0] || 'Gear'}`,
          });
        }
        if (results.length >= limit) break;
      }
    }

    // Only if still under limit, allow replacements
    if (results.length < limit) {
      for (const item of replacements) {
        results.push(item);
        if (results.length >= limit) break;
      }
    }

    return results;
  } finally {
    session.destroy();
  }
}
