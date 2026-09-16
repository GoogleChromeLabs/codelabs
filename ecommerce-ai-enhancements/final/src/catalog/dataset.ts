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

import { tentProducts } from './data/tents.ts';
import { shelterProducts } from './data/shelters.ts';
import { sleepingBagProducts } from './data/sleeping-bags.ts';
import { padProducts } from './data/pads.ts';
import { backpackProducts } from './data/backpacks.ts';
import { dryBagProducts } from './data/dry-bags.ts';
import { jacketProducts } from './data/jackets.ts';
import { baseLayerProducts } from './data/base-layers.ts';
import { gloveProducts } from './data/gloves.ts';
import { bootProducts } from './data/boots.ts';
import { shoeProducts } from './data/shoes.ts';
import { stoveProducts } from './data/stoves.ts';
import { cookwareProducts } from './data/cookware.ts';
import { waterFilterProducts } from './data/water-filters.ts';
import { hydrationProducts } from './data/hydration.ts';
import { headlampProducts } from './data/headlamps.ts';
import { lanternProducts } from './data/lanterns.ts';
import { navigationProducts } from './data/navigation.ts';
import { firstAidProducts } from './data/first-aid.ts';

// Primary outdoor activities, used for main navigation and as the primary facet pivot.
export const ACTIVITIES = [
  'Backpacking',
  'Camping',
  'Hiking',
  'Mountaineering',
  'Paddling',
  'Trail Running',
] as const;

export type ActivityType = (typeof ACTIVITIES)[number];

// Single-concept, atomic product categories across equipment lines.
export const PRODUCT_CATEGORIES = [
  'Tents',
  'Shelters',
  'Sleeping Bags',
  'Pads',
  'Backpacks',
  'Dry Bags',
  'Stoves',
  'Cookware',
  'Water Filters',
  'Hydration',
  'Headlamps',
  'Lanterns',
  'Jackets',
  'Base Layers',
  'Gloves',
  'Boots',
  'Shoes',
  'First Aid',
  'Navigation',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

// Atomic, single-attribute composable weather and environmental conditions.
export const CONDITIONS = [
  'Sub-Zero',
  'Cold',
  'Mild',
  'Hot',
  'Wet',
  'Icy',
  'Snowy',
  'Windy',
  'Dry',
] as const;

export type WeatherCondition = (typeof CONDITIONS)[number];

// A single item of gear in the catalog.
export interface Product {
  readonly id: string;
  readonly name: string;
  // An item can belong to multiple categories (e.g. dry sacks belong to Backpacks and Dry Bags).
  readonly categories: readonly ProductCategory[];
  // An item can serve multiple outdoor activities.
  readonly activities: readonly ActivityType[];
  // Composable environmental condition tags.
  readonly conditions: readonly WeatherCondition[];
  // Weight in exact grams.
  readonly weight: number;
  // Price in Canadian Dollars (CAD).
  readonly price: number;
  readonly rating: number;
  readonly reviews: number;
  // Narrative description of technical materials and construction.
  readonly description: string;
  // Key-value technical specifications.
  readonly specs: Readonly<Record<string, string>>;
  // Relative asset URL in public/images/catalog/.
  readonly image: string;
}

// Every outdoor gear product offered across all equipment lines.
export const CATALOG: readonly Product[] = [
  ...tentProducts,
  ...shelterProducts,
  ...sleepingBagProducts,
  ...padProducts,
  ...backpackProducts,
  ...dryBagProducts,
  ...jacketProducts,
  ...baseLayerProducts,
  ...gloveProducts,
  ...bootProducts,
  ...shoeProducts,
  ...stoveProducts,
  ...cookwareProducts,
  ...waterFilterProducts,
  ...hydrationProducts,
  ...headlampProducts,
  ...lanternProducts,
  ...navigationProducts,
  ...firstAidProducts,
];
