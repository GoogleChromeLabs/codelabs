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
import { journeyProfileSchema, type JourneyProfileResponse } from '../utils/recommendation-schemas.ts';
import {
  formatShopperJourney,
  type JourneyProfile,
  type ProfilerInputContext,
} from '../utils/journey-helpers.ts';
import type { Product } from '../catalog/dataset.ts';

export async function inferJourneyProfile(
  context: ProfilerInputContext,
  catalogMap: ReadonlyMap<string, Product>
): Promise<JourneyProfile> {
  // 1.2.1 Get a new prompt session
  const session = await getPromptSession();

  // Format the user journey context into a prompt
  const journeySummary = formatShopperJourney(context, catalogMap);

  const promptText = `${journeySummary}
  Synthesize the holistic journey profile and select 3-6 complementary categories.`.trim();

  try {
    // 1.2.2 Prompt the model with a structured data response
    const rawJson = await session.prompt(promptText, {
      responseConstraint: journeyProfileSchema,
    });

    // 1.2.3 Parse and deduplicate target categories
    const parsed = JSON.parse(rawJson) as JourneyProfileResponse;

    // De-duplicates the categories the model returned.
    const targetCategories = [...new Set(parsed.targetCategories)];

    // 1.2.4 Return parsed results
    return {
      primaryActivity: parsed.primaryActivity,
      impliedConditions: parsed.impliedConditions,
      targetCategories,
      equipmentRationale: `${parsed.primaryActivity} Companion Kit`,
    };
  } finally {
    // 1.2.5 Destroy the session
    session.destroy();
  }
}
