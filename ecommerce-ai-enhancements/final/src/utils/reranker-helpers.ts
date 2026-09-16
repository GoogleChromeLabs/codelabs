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

import type { Product } from '../catalog/dataset.ts';
import type { JourneyProfile } from './journey-helpers.ts';
import type { RankedProductIdsResponse } from '../ai/recommendation-schemas.ts';

export interface RecommendedItem {
  readonly product: Product;
  readonly synergyRationale: string;
}

export interface RerankerPromptInput {
  readonly shortlist: readonly Product[];
  readonly promptText: string;
}

/**
 * Determines whether a candidate product competes as a duplicate replacement
 * for an item already in the shopper's cart.
 *
 * In e-commerce recommendations, recommending competing replacements (e.g. a second
 * 3-season tent when one is already in the cart) creates a poor shopper experience.
 * True companion gear (footprints, fuel canisters, stakes, cookware) complements
 * rather than replaces the cart items.
 */
export function isReplacementCandidate(
  candidate: Product,
  cartProducts?: readonly Product[]
): boolean {
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

/**
 * Prepares the candidate shortlist and constructs the structured prompt text
 * for the AI synergy re-ranking model.
 */
export function formatRerankerPrompt(
  profile: JourneyProfile,
  candidates: readonly Product[],
  currentProduct?: Product | null,
  cartProducts?: readonly Product[],
  limit: number = 5
): RerankerPromptInput {
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

  // The shortlist the model is allowed to choose from, used for both the prompt text and the schema's enum.
  const shortlist = prioritizedCandidates.slice(0, 20);
  const candidateList = shortlist
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

Rank the top ${limit} product IDs.
`.trim();

  return { shortlist, promptText };
}

/**
 * Assembles the final recommended items list from the model's ranked response,
 * partitioning replacements and backfilling from prioritized candidates if needed.
 *
 * Accepts top-level response, candidates, and profile variables directly without
 * requiring argument manipulation or peeling off properties.
 */
export function assembleRecommendations(
  response: RankedProductIdsResponse | string,
  candidates: readonly Product[],
  profile: JourneyProfile,
  cartProducts?: readonly Product[],
  limit: number = 5
): readonly RecommendedItem[] {
  const parsed = typeof response === 'string'
    ? (JSON.parse(response) as RankedProductIdsResponse)
    : response;

  const toItem = (product: Product): RecommendedItem => ({
    product,
    synergyRationale: `${profile.primaryActivity} Synergy • ${product.categories[0] || 'Gear'}`,
  });

  const prioritizedCandidates = [...candidates].sort((a, b) => {
    const aRepl = isReplacementCandidate(a, cartProducts) ? 1 : 0;
    const bRepl = isReplacementCandidate(b, cartProducts) ? 1 : 0;
    return aRepl - bRepl;
  });

  const nonReplacements: RecommendedItem[] = [];
  const replacements: RecommendedItem[] = [];
  const seen = new Set<string>();

  for (const id of parsed.rankedProductIds || []) {
    if (seen.has(id)) continue;
    seen.add(id);

    const product = candidates.find(c => c.id === id);
    if (!product) continue;

    if (isReplacementCandidate(product, cartProducts)) {
      replacements.push(toItem(product));
    } else {
      nonReplacements.push(toItem(product));
    }
  }

  // Backfills with prioritized non-replacement candidates, then replacements.
  const backfill = prioritizedCandidates
    .filter(c => !isReplacementCandidate(c, cartProducts) && !seen.has(c.id))
    .map(toItem);

  return [...nonReplacements, ...backfill, ...replacements].slice(0, limit);
}
