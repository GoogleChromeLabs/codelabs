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

export function isReplacementCandidate(candidate: Product, cartProducts?: readonly Product[]): boolean {
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
  // Suppress unused parameter linter warnings in starter shell
  void currentProduct;
  void cartProducts;

  /*
   * TODO: Implement Synergy Re-Ranking using Chrome's Prompt API (LanguageModel).
   *
   * Expected Implementation:
   * 1. Obtain a Prompt API session configured with the re-ranker system prompt:
   *    const session = await window.LanguageModel.create({
   *      systemPrompt: RE_RANKER_SYSTEM_PROMPT,
   *      expectedInputLanguages: ['en'],
   *      expectedOutputLanguages: ['en'],
   *      outputLanguage: 'en',
   *    });
   *    // Or use the shared helper: const session = await getPromptSession(RE_RANKER_SYSTEM_PROMPT);
   *
   * 2. Format the candidate gear, active product, and cart contents into the prompt text:
   *    - Current product details (name, category, activity, conditions)
   *    - Items currently in the cart (assigned 3.0x pairing priority)
   *    - Categories already in the cart (instruct model to deprioritize replacements)
   *    - Synthesized journey profile (primary activity and implied conditions)
   *    - Numbered/bulleted list of candidate products (ID, name, category, price)
   *
   * 3. Set prioritization instructions:
   *    - Highest: Direct companion pairings and set items (tent <-> footprint, stove <-> fuel).
   *    - Second: Items paired with active cart items.
   *    - Third: Overarching journey completion.
   *    - Mandatory: Deprioritize replacements in categories already in cart.
   *
   * 4. Prompt the model with structured output constraints (responseConstraint: reRankerSelectionSchema):
   *    const rawJson = await session.prompt(promptText, {
   *      responseConstraint: reRankerSelectionSchema,
   *      expectedInputLanguages: ['en'],
   *      expectedOutputLanguages: ['en'],
   *      outputLanguage: 'en',
   *    });
   *
   * 5. Parse the ranked product IDs from the model output, map them back to candidate Product
   *    objects, and attach synergy rationales (e.g. `${profile.primaryActivity} Synergy • ${cat}`).
   *    Backfill with non-replacement candidates if the model returns fewer than the requested limit.
   *
   * 6. Destroy the session in a finally block:
   *    session.destroy();
   *
   * 7. Return the ranked RecommendedItem[] list.
   */

  // Fallback starter shell return: return top candidate products with baseline synergy rationales
  return candidates.slice(0, limit).map(p => ({
    product: p,
    synergyRationale: `${profile.primaryActivity} Companion • ${p.categories[0] || 'Gear'}`,
  }));
}

