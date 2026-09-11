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

import { semanticFilterSchema } from './recommendation-schemas.ts';
import { getPromptSession, prewarmPromptSession } from './prompt-api.ts';
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
  await prewarmPromptSession(SEMANTIC_FILTER_SYSTEM_PROMPT);
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

  let parsed: any = await persistentCache.get('ai_cache', cacheKey);
  const cacheHit = !!parsed;
  let t2 = performance.now();

  if (!parsed) {
    const journeyContextText = cachedJourney
      ? `Primary Activity: ${cachedJourney.primaryActivity} | Target Categories: ${(cachedJourney.targetCategories || []).join(', ')} | Implied Conditions: ${(cachedJourney.impliedConditions || []).join(', ')}`
      : 'No prior journey profile recorded.';

    const session = await getPromptSession(SEMANTIC_FILTER_SYSTEM_PROMPT);
    const promptText = `
NATURAL LANGUAGE SEARCH QUERY: "${searchTerm}"

CACHED SHOPPER JOURNEY PROFILE (FROM RECOMMENDATION ENGINE):
${journeyContextText}

Determine the optimal facet filters and optional material/feature keyword (e.g. "down"). Return the JSON object according to the schema.`.trim();

    try {
      const rawJson = await session.prompt(promptText, {
        responseConstraint: semanticFilterSchema,
        outputLanguage: 'en',
        expectedOutputLanguages: ['en'],
      });
      parsed = JSON.parse(rawJson);
      await persistentCache.set('ai_cache', cacheKey, parsed);
    } finally {
      session.destroy();
    }
    t2 = performance.now();
  }

  // Validate against domain constants and ensure price/weight/rating were actually requested
  const category = PRODUCT_CATEGORIES.find(c => c === parsed.category);
  const activity = ACTIVITIES.find(a => a === parsed.activity);
  const conditions = (parsed.conditions || []).filter((c: any) => CONDITIONS.includes(c));

  const queryHasPrice = /(under|below|\$|cheap|budget|cost|price|less than|>|<)/i.test(searchTerm);
  const queryHasWeight = /(light|ultralight|gram|weight|heavy|kg|oz)/i.test(searchTerm);
  const queryHasRating = /(star|rating|reviewed|top|best)/i.test(searchTerm);

  const priceRange = queryHasPrice ? PRICE_RANGES.find(p => p === parsed.priceRange) : undefined;
  const weightRange = queryHasWeight ? WEIGHT_RANGES.find(w => w === parsed.weightRange) : undefined;
  const minRating = queryHasRating ? RATING_TIERS.find(r => r === parsed.minRating) : undefined;

  const rawKw = parsed.keyword?.trim() || '';
  const isRedundant = rawKw.toLowerCase() === category?.toLowerCase() ||
    conditions.some((c: string) => c.toLowerCase() === rawKw.toLowerCase()) ||
    ['bag', 'bags', 'sleeping bag', 'tent', 'tents', 'pack', 'packs', 'gear'].includes(rawKw.toLowerCase());
  const keyword = isRedundant ? '' : rawKw;

  const appliedFilters: SemanticFilterResult['appliedFilters'] = {};
  const toolsExecuted: string[] = [];

  if (typeof document !== 'undefined' && document.modelContext?.getTools) {
    const modelCtx = document.modelContext;
    const allTools = await modelCtx.getTools();

    const executeFacet = async (toolName: string, args: Record<string, any>): Promise<any> => {
      const tool = allTools.find(t => t.name === toolName);
      if (tool && (modelCtx as any).executeTool) {
        toolsExecuted.push(toolName);
        const res = await (modelCtx as any).executeTool(tool, JSON.stringify(args));
        return typeof res === 'string' ? JSON.parse(res) : res;
      }
      return null;
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

    // Gracefully relax constraints if query yielded 0 results
    let listRes = await executeFacet('list_items', {});
    if (listRes && listRes.totalCount === 0) {
      if (keyword) {
        await executeFacet('keyword_filter', { keyword: '' });
        appliedFilters.keyword = '';
        listRes = await executeFacet('list_items', {});
      }
      if (listRes && listRes.totalCount === 0 && conditions.length > 0) {
        for (const cond of conditions) {
          await executeFacet('condition_filter', { condition: cond, selected: false });
        }
        delete appliedFilters.conditions;
      }
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
