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
} from './recommendation-schemas.ts';
import { getPromptSession } from './prompt-api.ts';
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

/**
 * Holds the session created by {@link prewarmSemanticFilterSession} until the
 * search that follows claims it. Single-use: once a search takes it, the next
 * prewarm creates a fresh one so queries never inherit each other's history.
 */
let warmSession: LanguageModel | null = null;

/**
 * Creates the search session ahead of the query the shopper is about to type.
 *
 * Call this the moment intent is clear — a focused search box — so the cold
 * start overlaps their typing. `LanguageModel.create()` requires transient
 * activation, so this must run from a user interaction.
 */
export async function prewarmSemanticFilterSession(): Promise<void> {
  if (warmSession) return;
  try {
    warmSession = await getPromptSession(SEMANTIC_FILTER_SYSTEM_PROMPT);
  } catch {
    // Best effort: if this fails, the search creates its own session and
    // surfaces the error there.
  }
}

export async function interpretAndApplySemanticFilter(searchTerm: string): Promise<SemanticFilterResult> {
  const t0 = performance.now();
  const cachedJourney = await persistentCache.get<any>('ai_cache', 'latest_journey_profile');
  const t1 = performance.now();

  const normalizedQuery = searchTerm.trim().toLowerCase();
  const cacheKey = persistentCache.createKey(
    'semantic_search_v3',
    normalizedQuery,
    cachedJourney ? `${cachedJourney.primaryActivity}:${(cachedJourney.targetCategories || []).join(',')}` : 'fresh'
  );

  let parsed = await persistentCache.get<SemanticFilterResponse>('ai_cache', cacheKey);
  const cacheHit = !!parsed;
  let t2 = performance.now();

  if (!parsed) {
    const journeyContextText = cachedJourney
      ? `Primary Activity: ${cachedJourney.primaryActivity} | Target Categories: ${(cachedJourney.targetCategories || []).join(', ')} | Implied Conditions: ${(cachedJourney.impliedConditions || []).join(', ')}`
      : 'No prior journey profile recorded.';

    // Claim the prewarmed session if the shopper's focus created one; otherwise
    // create it now. Either way it's single-use, so clear the slot.
    const session = warmSession ?? (await getPromptSession(SEMANTIC_FILTER_SYSTEM_PROMPT));
    warmSession = null;
    const promptText = `
NATURAL LANGUAGE SEARCH QUERY: "${searchTerm}"

CACHED SHOPPER JOURNEY PROFILE (FROM RECOMMENDATION ENGINE):
${journeyContextText}

Determine the optimal facet filters and optional material/feature keyword (e.g. "down"). Return the JSON object according to the schema.`.trim();

    try {
      // Constrained decoding against semanticFilterSchema: the response is
      // always a conforming JSON document, so no repair or coercion is needed.
      const rawJson = await session.prompt(promptText, {
        responseConstraint: semanticFilterSchema,
      });
      parsed = JSON.parse(rawJson) as SemanticFilterResponse;
      await persistentCache.set('ai_cache', cacheKey, parsed);
    } finally {
      session.destroy();
    }
    t2 = performance.now();
  }

  // The schema guarantees these are catalog enum members or null, so there is
  // nothing left to validate — only product decisions to make.
  const category = parsed.category ?? undefined;
  const activity = parsed.activity ?? undefined;
  const conditions = parsed.conditions;

  // Guardrail: only honour numeric facets the shopper actually asked about, so
  // an inferred budget never silently hides products.
  const queryHasPrice = /(under|below|\$|cheap|budget|cost|price|less than|>|<)/i.test(searchTerm);
  const queryHasWeight = /(light|ultralight|gram|weight|heavy|kg|oz)/i.test(searchTerm);
  const queryHasRating = /(star|rating|reviewed|top|best)/i.test(searchTerm);

  const priceRange = queryHasPrice ? parsed.priceRange ?? undefined : undefined;
  const weightRange = queryHasWeight ? parsed.weightRange ?? undefined : undefined;
  const minRating = queryHasRating ? parsed.minRating ?? undefined : undefined;

  // Guardrail: a keyword that repeats the category or a condition would filter
  // the results down to nothing useful.
  const rawKw = parsed.keyword?.trim() ?? '';
  const isRedundant = rawKw.toLowerCase() === category?.toLowerCase() ||
    conditions.some((c: string) => c.toLowerCase() === rawKw.toLowerCase()) ||
    ['bag', 'bags', 'sleeping bag', 'tent', 'tents', 'pack', 'packs', 'gear'].includes(rawKw.toLowerCase());
  const keyword = isRedundant ? '' : rawKw;


  const appliedFilters: SemanticFilterResult['appliedFilters'] = {};
  const toolsExecuted: string[] = [];

  if (typeof document !== 'undefined' && document.modelContext?.getTools) {
    const modelCtx = document.modelContext;
    const allTools = await modelCtx.getTools();

    /*
     * WebMCP defines `executeTool(tool, inputObject, options)` where
     * `inputObject` is a plain JavaScript object: the spec serializes it to
     * JSON for us and rejects with a `TypeError` if it "is not an Object".
     * Chrome has not caught up to that step yet — today it wants the JSON
     * string itself and rejects an object with "Failed to parse input
     * arguments".
     *
     * So: call it the way the spec says, and fall back to the string form only
     * once we've actually seen the spec form fail. When Chrome lands the
     * conversion this code starts taking the first branch with no changes, and
     * the fallback can be deleted.
     *
     * @see https://webmachinelearning.github.io/webmcp/#dom-modelcontext-executetool
     */
    let needsSerializedInput = false;

    const executeFacet = async (
      toolName: string,
      args: Record<string, unknown>
    ): Promise<any> => {
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

      // `executeTool()` resolves with a `DOMString`, so the tool's return value
      // always arrives as JSON.
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

    // If the inferred facets matched nothing, peel them back one at a time,
    // most speculative first, until the shopper has something to look at.
    const relaxations: (() => Promise<void>)[] = [];
    if (keyword) {
      relaxations.push(async () => {
        await executeFacet('keyword_filter', { keyword: '' });
        appliedFilters.keyword = '';
      });
    }
    if (conditions.length > 0) {
      relaxations.push(async () => {
        for (const cond of conditions) {
          await executeFacet('condition_filter', { condition: cond, selected: false });
        }
        delete appliedFilters.conditions;
      });
    }
    if (weightRange) {
      relaxations.push(async () => {
        await executeFacet('weight_filter', { weightRange, selected: false });
        delete appliedFilters.weightRange;
      });
    }
    if (priceRange) {
      relaxations.push(async () => {
        await executeFacet('price_filter', { priceRange, selected: false });
        delete appliedFilters.priceRange;
      });
    }
    if (minRating) {
      relaxations.push(async () => {
        await executeFacet('rating_filter', { minRating, selected: false });
        delete appliedFilters.minRating;
      });
    }

    let listRes = await executeFacet('list_items', {});
    for (const relax of relaxations) {
      if (!listRes || listRes.totalCount > 0) break;
      await relax();
      listRes = await executeFacet('list_items', {});
    }
  }

  const t3 = performance.now();
  const catalogView = typeof document !== 'undefined' ? (document.querySelector('catalog-view') as any) : null;
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
  if (typeof document === 'undefined' || !document.modelContext?.registerTool) return;

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
