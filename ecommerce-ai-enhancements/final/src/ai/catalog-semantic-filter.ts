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
  semanticFilterSchema,
  type SemanticFilterResponse,
  type PriceRange,
  type WeightRange,
  type RatingTier,
} from '../utils/recommendation-schemas.ts';
import { getPromptSession } from './prompt-api.ts';
import type { JourneyProfile } from '../utils/journey-helpers.ts';
import type { Product } from '../catalog/dataset.ts';
import { logSemanticSearchTrace } from '../observability/devtools-trace.ts';
import { persistentCache } from '../utils/persistent-cache.ts';
import {
  PRODUCT_CATEGORIES,
  ACTIVITIES,
  CONDITIONS,
  type ProductCategory,
  type ActivityType,
  type WeatherCondition,
} from '../catalog/dataset.ts';
import { PRICE_RANGES, WEIGHT_RANGES, RATING_TIERS } from '../utils/filter-helpers.ts';

export type { PriceRange, WeightRange, RatingTier };

const SEMANTIC_FILTER_SYSTEM_PROMPT = `
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

// Holds a session until the next search claims it.
let warmSession: LanguageModel | null = null;

/**
 * Creates the search session ahead of the query the shopper is about to type.
 * Runs only from a user interaction, since session creation requires transient activation.
 */
export async function prewarmSemanticFilterSession(): Promise<void> {
  if (warmSession) return;
  try {
    warmSession = await getPromptSession(SEMANTIC_FILTER_SYSTEM_PROMPT);
  } catch {
    // The search creates its own session and surfaces the error there.
  }
}

/**
 * Infers structured filter criteria from a natural language query using the Prompt API.
 */
async function inferSearchFacets(
  searchTerm: string,
  cachedJourney: JourneyProfile | null
): Promise<{ parsed: SemanticFilterResponse; cacheHit: boolean }> {
  const normalizedQuery = searchTerm.trim().toLowerCase();
  const cacheKey = persistentCache.createKey(
    'semantic_search_v3',
    normalizedQuery,
    cachedJourney ? `${cachedJourney.primaryActivity}:${(cachedJourney.targetCategories || []).join(',')}` : 'fresh'
  );

  const cached = await persistentCache.get<SemanticFilterResponse>('ai_cache', cacheKey);
  if (cached) {
    return { parsed: cached, cacheHit: true };
  }

  const journeyContextText = cachedJourney
    ? `Primary Activity: ${cachedJourney.primaryActivity} | Target Categories: ${(cachedJourney.targetCategories || []).join(', ')} | Implied Conditions: ${(cachedJourney.impliedConditions || []).join(', ')}`
    : 'No prior journey profile recorded.';

  // Claims the prewarmed session if one exists, creating it now if not.
  const session = warmSession ?? (await getPromptSession(SEMANTIC_FILTER_SYSTEM_PROMPT));
  warmSession = null;

  const promptText = `
NATURAL LANGUAGE SEARCH QUERY: "${searchTerm}"

CACHED SHOPPER JOURNEY PROFILE (FROM RECOMMENDATION ENGINE):
${journeyContextText}

Determine the optimal facet filters and optional material/feature keyword (e.g. "down"). Return the JSON object according to the schema.`.trim();

  try {
    // `responseConstraint` makes the model emit a document that conforms to semanticFilterSchema.
    const rawJson = await session.prompt(promptText, {
      responseConstraint: semanticFilterSchema,
    });
    const parsed = JSON.parse(rawJson) as SemanticFilterResponse;
    await persistentCache.set('ai_cache', cacheKey, parsed);
    return { parsed, cacheHit: false };
  } finally {
    session.destroy();
  }
}

/**
 * Applies inferred facets by invoking the catalog's registered WebMCP tools, relaxing constraints if no items match.
 */
async function applyFacetsViaWebMCP(
  searchTerm: string,
  parsed: SemanticFilterResponse
): Promise<{ appliedFilters: SemanticFilterResult['appliedFilters']; toolsExecuted: string[] }> {
  const appliedFilters: SemanticFilterResult['appliedFilters'] = {};
  const toolsExecuted: string[] = [];

  if (!document.modelContext?.getTools) {
    return { appliedFilters, toolsExecuted };
  }

  const modelCtx = document.modelContext;
  const allTools = await modelCtx.getTools();

  // The schema guarantees these are catalog enum members or null.
  const category = parsed.category ?? undefined;
  const activity = parsed.activity ?? undefined;
  const conditions = parsed.conditions;

  // Guardrail: honours numeric facets only when the query mentions them.
  const queryHasPrice = /(under|below|\$|cheap|budget|cost|price|less than|>|<)/i.test(searchTerm);
  const queryHasWeight = /(light|ultralight|gram|weight|heavy|kg|oz)/i.test(searchTerm);
  const queryHasRating = /(star|rating|reviewed|top|best)/i.test(searchTerm);

  const priceRange = queryHasPrice ? parsed.priceRange ?? undefined : undefined;
  const weightRange = queryHasWeight ? parsed.weightRange ?? undefined : undefined;
  const minRating = queryHasRating ? parsed.minRating ?? undefined : undefined;

  // Guardrail: drops a keyword that repeats the category or a condition.
  const rawKw = parsed.keyword?.trim() ?? '';
  const isRedundant =
    rawKw.toLowerCase() === category?.toLowerCase() ||
    conditions.some((c: string) => c.toLowerCase() === rawKw.toLowerCase()) ||
    ['bag', 'bags', 'sleeping bag', 'tent', 'tents', 'pack', 'packs', 'gear'].includes(rawKw.toLowerCase());
  const keyword = isRedundant ? '' : rawKw;

  /*
   * WebMCP defines `executeTool(tool, inputObject, options)`, where the user agent serializes `inputObject` to JSON.
   * Chrome takes the serialized JSON string itself and rejects an object with "Failed to parse input arguments".
   * Set once the spec-compliant call fails, this latch sends the string form for every later call.
   * https://webmachinelearning.github.io/webmcp/#dom-modelcontext-executetool
   */
  let needsSerializedInput = false;

  const executeFacet = async (
    toolName: string,
    args: Record<string, unknown>
  ): Promise<{ totalCount?: number } | null> => {
    const tool = allTools.find(t => t.name === toolName);
    if (!tool) return null;

    toolsExecuted.push(toolName);

    let result: string;
    if (needsSerializedInput) {
      result = await modelCtx.executeTool(tool, JSON.stringify(args));
    } else {
      try {
        result = await modelCtx.executeTool(tool, args);
      } catch {
        needsSerializedInput = true;
        result = await modelCtx.executeTool(tool, JSON.stringify(args));
      }
    }

    // `executeTool()` resolves with a `DOMString`, so the tool's return value arrives as JSON.
    return JSON.parse(result);
  };

  // 1. Reset filters to clean slate
  await executeFacet('reset_filters', {});

  // 2. Sequentially apply active facets for deterministic state transitions
  if (category) {
    appliedFilters.category = category;
    await executeFacet('category_filter', { category, selected: true });
  }
  if (activity) {
    appliedFilters.activity = activity;
    await executeFacet('activity_filter', { activity, selected: true });
  }
  if (conditions.length > 0) {
    appliedFilters.conditions = conditions;
    for (const cond of conditions) {
      await executeFacet('condition_filter', { condition: cond, selected: true });
    }
  }
  if (priceRange) {
    appliedFilters.priceRange = priceRange;
    await executeFacet('price_filter', { priceRange, selected: true });
  }
  if (weightRange) {
    appliedFilters.weightRange = weightRange;
    await executeFacet('weight_filter', { weightRange, selected: true });
  }
  if (minRating) {
    appliedFilters.minRating = minRating;
    await executeFacet('rating_filter', { minRating, selected: true });
  }
  if (keyword) {
    appliedFilters.keyword = keyword;
    await executeFacet('keyword_filter', { keyword });
  }

  // Removes inferred facets one at a time, most speculative first, until the list returns results.
  const isEmpty = async (): Promise<boolean> => {
    const res = await executeFacet('list_items', {});
    return res !== null && (res.totalCount ?? 0) === 0;
  };

  if ((await isEmpty()) && keyword) {
    await executeFacet('keyword_filter', { keyword: '' });
    appliedFilters.keyword = '';
  }
  if ((await isEmpty()) && conditions.length > 0) {
    for (const cond of conditions) {
      await executeFacet('condition_filter', { condition: cond, selected: false });
    }
    delete appliedFilters.conditions;
  }
  if ((await isEmpty()) && weightRange) {
    await executeFacet('weight_filter', { weightRange, selected: false });
    delete appliedFilters.weightRange;
  }
  if ((await isEmpty()) && priceRange) {
    await executeFacet('price_filter', { priceRange, selected: false });
    delete appliedFilters.priceRange;
  }
  if ((await isEmpty()) && minRating) {
    await executeFacet('rating_filter', { minRating, selected: false });
    delete appliedFilters.minRating;
  }

  return { appliedFilters, toolsExecuted };
}

export async function interpretAndApplySemanticFilter(searchTerm: string): Promise<SemanticFilterResult> {
  const t0 = performance.now();
  const cachedJourney = await persistentCache.get<JourneyProfile>('ai_cache', 'latest_journey_profile');
  const t1 = performance.now();

  const { parsed, cacheHit } = await inferSearchFacets(searchTerm, cachedJourney);
  const t2 = performance.now();

  const { appliedFilters, toolsExecuted } = await applyFacetsViaWebMCP(searchTerm, parsed);
  const t3 = performance.now();

  const catalogView = document.querySelector<HTMLElement & { getFilteredProducts?: () => readonly Product[] }>('catalog-view');
  const matchingProducts = catalogView?.getFilteredProducts ? catalogView.getFilteredProducts() : [];

  logSemanticSearchTrace({
    query: searchTerm,
    cachedJourney,
    promptOutput: parsed,
    appliedFilters,
    toolsExecuted,
    matchingProducts,
    cacheHit,
    timings: {
      step1DurationMs: t1 - t0,
      step2DurationMs: t2 - t1,
      step3DurationMs: t3 - t2,
      totalDurationMs: t3 - t0,
    },
  });

  return {
    appliedFilters,
    explanation: parsed.explanation || 'Applied semantic search filters.',
    cachedJourneyUsed: !!cachedJourney,
    toolsExecuted,
  };
}

export function registerCatalogSemanticFilterTool(signal?: AbortSignal): void {
  if (!document.modelContext?.registerTool) return;

  try {
    document.modelContext.registerTool({
      name: 'semantic_catalog_filter',
      title: 'Search the Catalog in Plain Language',
      description: 'Search and filter the catalog using natural language. Analyzes user search query against the cached journey profile to determine and automatically apply the appropriate category, activity, condition, price, weight, rating, and keyword filters using the catalog WebMCP filter tools. This tool runs exclusively on the catalog page and uses cached journey state without mutating the recommendation engine.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Natural language search query to analyze and apply (e.g. "lightweight backpacking tent for wet conditions under $250")',
          },
        },
        required: ['query'],
      },
      execute: async (input: { query: string }) => {
        if (!input?.query) return { success: false, error: 'Query is required.' };
        const result = await interpretAndApplySemanticFilter(input.query);
        return { success: true, ...result };
      },
    }, { signal })?.catch(() => {});
  } catch {
    // Ignore registration race
  }
}
