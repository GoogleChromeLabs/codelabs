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

import { PRODUCT_CATEGORIES, ACTIVITIES, CONDITIONS } from '../catalog/dataset.ts';
import { PRICE_RANGES, WEIGHT_RANGES, RATING_TIERS } from '../utils/filter-helpers.ts';

export const journeyProfileSchema = {
  type: 'object',
  properties: {
    impliedConditions: {
      type: 'array',
      items: { type: 'string' },
    },
    primaryActivity: {
      type: 'string',
      enum: ACTIVITIES,
    },
    targetCategories: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['impliedConditions', 'primaryActivity', 'targetCategories'],
};

export const reRankerSelectionSchema = {
  type: 'object',
  properties: {
    rankedProductIds: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['rankedProductIds'],
};

export const semanticFilterSchema = {
  type: 'object',
  properties: {
    category: { type: ['string', 'null'], enum: [...PRODUCT_CATEGORIES, null] },
    activity: { type: ['string', 'null'], enum: [...ACTIVITIES, null] },
    conditions: {
      type: 'array',
      items: { type: 'string', enum: CONDITIONS },
    },
    priceRange: { type: ['string', 'null'], enum: [...PRICE_RANGES, null] },
    weightRange: { type: ['string', 'null'], enum: [...WEIGHT_RANGES, null] },
    minRating: { type: ['string', 'null'], enum: [...RATING_TIERS, null] },
    keyword: { type: ['string', 'null'] },
  },
  required: ['category', 'activity', 'conditions', 'priceRange', 'weightRange', 'minRating', 'keyword'],
};
