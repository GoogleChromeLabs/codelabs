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

import { ACTIVITIES, CONDITIONS, PRODUCT_CATEGORIES } from '../catalog/dataset.ts';
import { PRICE_RANGES, WEIGHT_RANGES, RATING_TIERS } from './filter-helpers.ts';

export const activityFilterSchema = {
  type: 'object',
  properties: {
    activity: {
      type: 'string',
      enum: [...ACTIVITIES],
      description: 'Activity to filter by.',
    },
    selected: {
      type: 'boolean',
      description: 'Explicit selection state: true to select, false to deselect. If omitted, toggles.',
    },
  },
};

export const categoryFilterSchema = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      enum: [...PRODUCT_CATEGORIES],
      description: 'Product category to filter by.',
    },
    selected: {
      type: 'boolean',
      description: 'Explicit selection state: true to select, false to deselect. If omitted, toggles.',
    },
  },
};

export const conditionFilterSchema = {
  type: 'object',
  properties: {
    condition: {
      type: 'string',
      enum: [...CONDITIONS],
      description: 'Weather/environmental condition to filter by.',
    },
    selected: {
      type: 'boolean',
      description: 'Explicit selection state: true to select, false to deselect. If omitted, toggles.',
    },
  },
};

export const priceFilterSchema = {
  type: 'object',
  properties: {
    priceRange: {
      type: 'string',
      enum: [...PRICE_RANGES],
      description: 'Price bracket ID to filter by (<50, 50-100, 100-250, >250).',
    },
    bracket: {
      type: 'string',
      enum: [...PRICE_RANGES],
      description: 'Alias for priceRange.',
    },
    selected: {
      type: 'boolean',
      description: 'Explicit selection state: true to select, false to deselect. If omitted, toggles.',
    },
  },
};

export const weightFilterSchema = {
  type: 'object',
  properties: {
    weightRange: {
      type: 'string',
      enum: [...WEIGHT_RANGES],
      description: 'Weight bracket ID to filter by (<500, 500-1000, 1000-2000, >2000).',
    },
    bracket: {
      type: 'string',
      enum: [...WEIGHT_RANGES],
      description: 'Alias for weightRange.',
    },
    selected: {
      type: 'boolean',
      description: 'Explicit selection state: true to select, false to deselect. If omitted, toggles.',
    },
  },
};

export const ratingFilterSchema = {
  type: 'object',
  properties: {
    minRating: {
      type: 'string',
      enum: [...RATING_TIERS],
      description: 'Minimum rating tier to filter by (3.0, 4.0, 4.8).',
    },
    rating: {
      type: 'string',
      enum: [...RATING_TIERS],
      description: 'Alias for minRating.',
    },
    selected: {
      type: 'boolean',
      description: 'Explicit selection state: true to select, false to deselect. If omitted, toggles.',
    },
  },
};

export const keywordFilterSchema = {
  type: 'object',
  properties: {
    keyword: {
      type: 'string',
      description: 'Keyword to search or filter products by. Pass an empty string to clear.',
    },
  },
};

export const semanticCatalogFilterSchema = {
  type: 'object',
  properties: {
    query: {
      type: 'string',
      description: 'Natural language search query to analyze and apply (e.g. "lightweight backpacking tent for wet conditions under $250")',
    },
  },
  required: ['query'],
};
