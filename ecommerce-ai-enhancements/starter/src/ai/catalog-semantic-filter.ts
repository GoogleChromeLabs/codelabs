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

import {
  PRODUCT_CATEGORIES,
  ACTIVITIES,
  CONDITIONS,
  type ProductCategory,
  type ActivityType,
  type WeatherCondition,
} from '../catalog/dataset.ts';
import { PRICE_RANGES, WEIGHT_RANGES, RATING_TIERS } from '../utils/filter-helpers.ts';

export type PriceRange = (typeof PRICE_RANGES)[number];
export type WeightRange = (typeof WEIGHT_RANGES)[number];
export type RatingTier = (typeof RATING_TIERS)[number];

export const SEMANTIC_FILTER_SYSTEM_PROMPT = `
You are the Intelligent Catalog Filter Assistant for Mont-Royal Plein Air.
Your job is to translate a shopper's natural language search query into specific catalog facet filters, taking into account their perceived outdoor journey profile.

AVAILABLE FILTER ENUMS:
- Categories: ${PRODUCT_CATEGORIES.join(', ')}
- Activities: ${ACTIVITIES.join(', ')}
- Conditions: ${CONDITIONS.join(', ')}
- Price Brackets: ${PRICE_RANGES.join(', ')} ("<50", "50-100", "100-250", ">250")
- Weight Brackets: ${WEIGHT_RANGES.join(', ')} ("<500", "500-1000", "1000-2000", ">2000" in grams)
- Min Rating Tiers: ${RATING_TIERS.join(', ')} (3.0, 4.0, 4.8)

RULES:
1. Category: If the query mentions or asks for a specific category of gear (e.g. "tent", "sleeping bag", "backpack", "jacket", "boots", "stove"), extract it from the available categories list. If no specific category is requested (e.g. broad activity or trip queries like "Hiking in summer"), set category to null.
2. Activity: Extract the outdoor activity if mentioned (e.g. "Hiking", "Camping", "Backpacking", "Mountaineering"). If not mentioned, draw upon the cached journey profile.
3. Conditions: Extract environmental conditions implied by the query from the conditions list (e.g. "winter", "cold", "alps" -> ["Cold", "Snowy", "Sub-Zero"]; "summer" -> ["Hot"] or ["Mild"]; "rain" -> ["Wet"]). If none implied, set to [].
4. Price, Weight, and Rating: Unless the query explicitly asks for a price limit (e.g. "under $100"), weight limit (e.g. "ultralight"), or minimum rating (e.g. "4 stars"), MUST be null. Never assume or invent price, weight, or rating constraints.
5. Keyword: Extract an optional material, insulation, or technical feature (e.g. "down" for cold winter sleeping bags, "titanium" for cookware, "merino" for wool apparel). Never repeat category names or condition words. Set to null if not applicable.
`.trim();

export interface SemanticFilterResult {
  readonly appliedFilters: {
    category?: ProductCategory;
    activity?: ActivityType;
    conditions?: WeatherCondition[];
    priceRange?: PriceRange;
    weightRange?: WeightRange;
    minRating?: RatingTier;
    keyword?: string;
  };
  readonly explanation: string;
  readonly cachedJourneyUsed: boolean;
  readonly toolsExecuted: string[];
}

export async function prewarmSemanticFilterSession(): Promise<void> {
  /*
   * TODO: Prewarm the Prompt API session for the semantic catalog filter.
   *
   * When implemented:
   * Call prewarmPromptSession(SEMANTIC_FILTER_SYSTEM_PROMPT), which creates a
   * base session with the system instructions in `initialPrompts` so the first
   * real search doesn't pay the cold-start cost. Trigger it from a user
   * interaction (focusing the search box): LanguageModel.create() requires
   * transient activation.
   */
}

export async function interpretAndApplySemanticFilter(searchTerm: string): Promise<SemanticFilterResult> {
  // Suppress unused parameter linter warning in starter shell
  void searchTerm;

  /*
   * TODO: Implement Natural Language Semantic Search with Prompt API & WebMCP Tools.
   *
   * Expected Implementation:
   * 1. Retrieve the cached journey profile from the recommendation pipeline
   *    (e.g., persistentCache.get('ai_cache', 'latest_journey_profile')) to maintain
   *    continuity between browsing journey intent and search results.
   *
   * 2. Obtain a Prompt API session using SEMANTIC_FILTER_SYSTEM_PROMPT:
   *    const session = await getPromptSession(SEMANTIC_FILTER_SYSTEM_PROMPT);
   *
   * 3. Construct prompt combining the natural language query and journey context:
   *    - Analyze query for category, activity, conditions, price constraints, weight constraints, rating, and keyword.
   *    - Pass semanticFilterSchema as the prompt's `responseConstraint`:
   *      const rawJson = await session.prompt(promptText, { responseConstraint: semanticFilterSchema });
   *    - Every field in that schema is pinned to a catalog enum (or null), so
   *      JSON.parse(rawJson) is all the parsing you need — no validation pass.
   *    - Destroy the session in a finally block: session.destroy().
   *
   * 4. Apply extracted filters dynamically via WebMCP tools:
   *    - Inspect available tools using document.modelContext.getTools(). Each
   *      entry is a RegisteredTool: { name, title, description, inputSchema,
   *      window, origin }.
   *    - Run one by calling:
   *        const json = await document.modelContext.executeTool(tool, args);
   *      It resolves with a DOMString, so JSON.parse() the result.
   *    - Compatibility note: the spec passes `args` as a plain object and
   *      serializes it for you, but Chrome currently rejects an object with
   *      "Failed to parse input arguments" and wants JSON.stringify(args)
   *      instead. Try the spec form first and fall back once.
   *    - Execute 'reset_filters' to start with a clean filter state.
   *    - Sequentially invoke registered WebMCP filter tools:
   *      * 'category_filter' with { category, selected: true }
   *      * 'activity_filter' with { activity, selected: true }
   *      * 'condition_filter' with each matched condition
   *      * 'price_filter', 'weight_filter', 'rating_filter' if explicitly requested
   *      * 'keyword_filter' with extracted material/feature keyword
   *    - Query 'list_items' to check count; if 0 results, gracefully relax keyword or conditions.
   *
   * 5. Log DevTools performance and observability trace using logSemanticSearchTrace(...).
   *
   * 6. Return SemanticFilterResult with appliedFilters, explanation, and toolsExecuted list.
   */

  // Fallback starter shell return
  return {
    appliedFilters: {},
    explanation: 'Semantic filter starter shell (Prompt API & WebMCP implementation placeholder).',
    cachedJourneyUsed: false,
    toolsExecuted: [],
  };
}

export function registerCatalogSemanticFilterTool(signal?: AbortSignal): void {
  // Suppress unused parameter linter warning in starter shell
  void signal;

  /*
   * TODO: Register the 'semantic_catalog_filter' tool with WebMCP (document.modelContext).
   *
   * When WebMCP is available (document.modelContext?.registerTool):
   * Register a tool named 'semantic_catalog_filter':
   * - description: Search and filter the catalog using natural language.
   * - inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] }
   * - execute: async (input) => {
   *     const result = await interpretAndApplySemanticFilter(input.query);
   *     return { success: true, ...result };
   *   }
   */
}

