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

/*
 * JSON Schema documents used as `responseConstraint` values for `LanguageModel.prompt()`.
 * Every schema binds its `enum` values to the catalog's own domain constants.
 * https://json-schema.org/understanding-json-schema/reference
 */

import {
  PRODUCT_CATEGORIES,
  ACTIVITIES,
  CONDITIONS,
  type ProductCategory,
  type ActivityType,
  type WeatherCondition,
  type Product,
} from '../catalog/dataset.ts';
import { PRICE_RANGES, WEIGHT_RANGES, RATING_TIERS } from '../utils/filter-helpers.ts';

export type PriceRange = (typeof PRICE_RANGES)[number];
export type WeightRange = (typeof WEIGHT_RANGES)[number];
export type RatingTier = (typeof RATING_TIERS)[number];

// JSON Schema dialect these documents are authored against.
const JSON_SCHEMA_DIALECT = 'https://json-schema.org/draft/2020-12/schema';

/**
 * Builds a subschema for a value that is either one of `values` or `null`.
 */
function nullableEnum(values: readonly string[], description: string): Record<string, unknown> {
  return {
    description,
    anyOf: [{ type: 'string', enum: [...values] }, { type: 'null' }],
  };
}

// Shape of a `journeyProfileSchema`-constrained response.
export interface JourneyProfileResponse {
  readonly primaryActivity: ActivityType;
  readonly impliedConditions: WeatherCondition[];
  readonly targetCategories: ProductCategory[];
}

export const journeyProfileSchema = {
  $schema: JSON_SCHEMA_DIALECT,
  title: 'Shopper journey profile',
  description:
    'A synthesis of the shopper’s browsing timeline into one outfitting journey.',
  type: 'object',
  properties: {
    primaryActivity: {
      description: 'The single overarching outdoor activity the shopper is outfitting for.',
      type: 'string',
      enum: [...ACTIVITIES],
    },
    impliedConditions: {
      description: 'Environmental conditions implied by the browsed gear and activities.',
      type: 'array',
      items: { type: 'string', enum: [...CONDITIONS] },
      minItems: 1,
      maxItems: 4,
    },
    targetCategories: {
      description:
        'Three to six complementary gear categories that would complete the shopper’s kit. Do not repeat a category.',
      type: 'array',
      items: { type: 'string', enum: [...PRODUCT_CATEGORIES] },
      minItems: 3,
      maxItems: 6,
    },
  },
  required: ['primaryActivity', 'impliedConditions', 'targetCategories'],
  additionalProperties: false,
};

// Shape of a `createRankedProductIdsSchema()`-constrained response.
export interface RankedProductIdsResponse {
  readonly rankedProductIds: string[];
}

/**
 * Builds a re-ranking schema whose `enum` is the exact set of candidate product IDs for this request.
 * Accepts an array of candidate products or product ID strings.
 */
export function createRankedProductIdsSchema(
  candidates: readonly (string | Product | { id: string })[],
  maxItems: number
): Record<string, unknown> {
  const ids = candidates.map(item => (typeof item === 'string' ? item : item.id));
  return {
    $schema: JSON_SCHEMA_DIALECT,
    title: 'Ranked complementary gear',
    description: 'Catalog product IDs ordered from strongest to weakest synergy.',
    type: 'object',
    properties: {
      rankedProductIds: {
        description:
          'Product IDs copied verbatim from the candidate list, best pairing first, with no duplicates.',
        type: 'array',
        items: { type: 'string', enum: ids },
        minItems: Math.min(1, ids.length),
        maxItems: Math.min(maxItems, ids.length),
      },
    },
    required: ['rankedProductIds'],
    additionalProperties: false,
  };
}

// Shape of a `semanticFilterSchema`-constrained response.
export interface SemanticFilterResponse {
  readonly category: ProductCategory | null;
  readonly activity: ActivityType | null;
  readonly conditions: WeatherCondition[];
  readonly priceRange: PriceRange | null;
  readonly weightRange: WeightRange | null;
  readonly minRating: RatingTier | null;
  readonly keyword: string | null;
  readonly explanation: string;
}

export const semanticFilterSchema = {
  $schema: JSON_SCHEMA_DIALECT,
  title: 'Catalog facet selection',
  description:
    'Catalog facet filters derived from a natural language search query. Every facet the query does not ask for must be null.',
  type: 'object',
  properties: {
    category: nullableEnum(
      PRODUCT_CATEGORIES,
      'The gear category the query asks for, or null for broad activity/trip queries.'
    ),
    activity: nullableEnum(
      ACTIVITIES,
      'The outdoor activity named in the query, otherwise the activity from the cached journey profile, otherwise null.'
    ),
    conditions: {
      description:
        'Environmental conditions implied by the query (for example "winter" implies Cold and Snowy). Empty when the query implies none.',
      type: 'array',
      items: { type: 'string', enum: [...CONDITIONS] },
      maxItems: 3,
    },
    priceRange: nullableEnum(
      PRICE_RANGES,
      'The single price bracket, in dollars, that contains the limit the shopper stated: "under $250" is "100-250", "around $80" is "50-100", "budget" is "<50". Null unless the query explicitly mentions price.'
    ),
    weightRange: nullableEnum(
      WEIGHT_RANGES,
      'The single weight bracket, in grams, that contains the limit the shopper stated: "ultralight" is "<500", "under 2kg" is "1000-2000". Null unless the query explicitly mentions weight.'
    ),
    minRating: nullableEnum(
      RATING_TIERS,
      'Minimum star rating: "4 stars and up" is "4.0", "best reviewed" is "4.8". Null unless the query explicitly mentions ratings or reviews.'
    ),
    keyword: {
      description:
        'A single material, insulation, or technical feature to search for (for example "down", "titanium", "merino"). Never a category or condition name. Null when not applicable.',
      anyOf: [{ type: 'string', minLength: 3 }, { type: 'null' }],
    },
    explanation: {
      description: 'One short sentence, addressed to the shopper, explaining the filters chosen.',
      type: 'string',
      minLength: 1,
    },
  },
  required: [
    'category',
    'activity',
    'conditions',
    'priceRange',
    'weightRange',
    'minRating',
    'keyword',
    'explanation',
  ],
  additionalProperties: false,
};
