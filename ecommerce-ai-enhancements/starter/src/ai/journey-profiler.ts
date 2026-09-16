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
  // Suppress unused parameter linter warnings in starter shell
  void context;
  void catalogMap;

  /*
   * TODO: Implement Journey Profile Inference using Chrome's Prompt API (LanguageModel).
   *
   * Docs: https://developer.mozilla.org/en-US/docs/Web/API/LanguageModel
   *
   * Expected Implementation:
   * 1. Obtain a Prompt API session carrying the system instructions. System
   *    instructions are a `system` message in `initialPrompts`, and can only be
   *    set when the session is created:
   *
   *    const session = await LanguageModel.create({
   *      initialPrompts: [{ role: 'system', content: JOURNEY_PROFILER_SYSTEM_PROMPT }],
   *      expectedInputs: [{ type: 'text', languages: ['en'] }],
   *      expectedOutputs: [{ type: 'text', languages: ['en'] }],
   *    });
   *
   *    // Or use the shared helper, which also handles availability, download
   *    // progress, and session cloning:
   *    const session = await getPromptSession(JOURNEY_PROFILER_SYSTEM_PROMPT);
   *
   * 2. Format the chronological browsing journey from context.timeline (up to 5 recent events,
   *    ordered chronologically from earliest to latest) and active items in the cart (context.cart),
   *    mapping product IDs to catalog names, categories, and activities using catalogMap.
   *
   * 3. Construct the prompt text instructing the model to synthesize:
   *    - Implied weather conditions (e.g. "Mild", "Dry", "Wet", "Cold")
   *    - Overarching primary outdoor activity (e.g. "Camping", "Hiking", "Backpacking")
   *    - 3 to 6 complementary target categories (e.g. "Tents", "Sleeping Bags", "Pads")
   *
   * 4. Prompt the model with a JSON Schema as the `responseConstraint`. The only
   *    other options `prompt()` accepts are `omitResponseConstraintInput` and
   *    `signal` — language options belong on `create()`, not here:
   *
   *    const rawJson = await session.prompt(promptText, {
   *      responseConstraint: journeyProfileSchema,
   *    });
   *
   * 5. Because journeyProfileSchema pins every field to a catalog enum, the
   *    response always conforms: JSON.parse(rawJson) is the entire parsing step,
   *    with no normalization or validation pass. Destroy the session in a
   *    `finally` block to free device memory:
   *    session.destroy();
   *
   * 6. Return the synthesized JourneyProfile object.
   */

  // Default fallback starter profile allowing downstream recommendation components to function
  return {
    primaryActivity: 'Camping',
    impliedConditions: ['Mild', 'Dry'],
    targetCategories: ['Tents', 'Sleeping Bags', 'Pads', 'Stoves', 'Lanterns'],
    equipmentRationale: 'Starter Journey Profile (Prompt API implementation placeholder)',
  };
}

