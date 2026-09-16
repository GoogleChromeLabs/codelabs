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
import { createRankedProductIdsSchema, type RankedProductIdsResponse } from './recommendation-schemas.ts';
import type { Product } from '../catalog/dataset.ts';
import type { JourneyProfile } from '../utils/journey-helpers.ts';
import {
  formatRerankerPrompt,
  assembleRecommendations,
  type RecommendedItem,
} from '../utils/reranker-helpers.ts';

export type { RecommendedItem };

export async function rankComplementaryGear(
  profile: JourneyProfile,
  candidates: readonly Product[],
  currentProduct?: Product | null,
  cartProducts?: readonly Product[],
  limit: number = 5
): Promise<readonly RecommendedItem[]> {
  // Early return if there are no candidate products
  if (candidates.length === 0) return [];

  // Get prompt text and shortlist for the prompt to pick from
  const { shortlist, promptText } = formatRerankerPrompt(
    profile,
    candidates,
    currentProduct,
    cartProducts,
    limit
  );

  // Get prompt session
  const session = await getPromptSession();

  try {
    // Generate the schema based on the shortlist and the total number of items to return
    const schema = createRankedProductIdsSchema(shortlist, limit);

    // Prompt the session, using the schema to constrain the results
    const rawJson = await session.prompt(promptText, {
      responseConstraint: schema,
    });

    // Parse the results and assemble the recommendations
    const parsed = JSON.parse(rawJson) as RankedProductIdsResponse;

    return assembleRecommendations(
      parsed,
      candidates,
      profile,
      cartProducts,
      limit
    );
  } finally {
    session.destroy();
  }
}
