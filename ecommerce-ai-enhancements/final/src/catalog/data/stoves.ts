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

import type { Product } from '../dataset.ts';

export const stoveProducts: readonly Product[] = [
  {
    id: 'stove-jacques-cartier-ultralight-isobutane',
    name: 'Jacques-Cartier Ultralight Micro Isobutane Stove',
    categories: ['Stoves', 'Cookware'],
    activities: ['Backpacking', 'Hiking'],
    conditions: ['Mild', 'Hot', 'Dry'],
    weight: 73,
    price: 44.99,
    rating: 4.8,
    reviews: 114,
    description: '73g pocket-sized titanium screw-on backpacking stove with 10,000 BTU output.',
    specs: {
      'Heat Output': '10,000 BTU/hr (2,900 W)',
      'Fuel Type': 'Standard Threaded Isobutane/Propane (EN417)',
      'Material': 'Titanium Burner Head with Brass Control Valve',
      'Boil Time': '3 min 20 sec per 1L water',
    },
    image: '/images/catalog/stove-jacques-cartier-ultralight-isobutane.webp',
  },
  {
    id: 'stove-boreal-windmaster-system',
    name: 'Boreal Windmaster Integrated Fast-Boil Stove System',
    categories: ['Stoves', 'Cookware'],
    activities: ['Mountaineering', 'Backpacking'],
    conditions: ['Cold', 'Windy', 'Sub-Zero'],
    weight: 370,
    price: 119.99,
    rating: 4.9,
    reviews: 96,
    description: '1L flux-ring pot stove system with piezo ignition that boils 500ml in 100 seconds.',
    specs: {
      'Pot Capacity': '1.0 Litre Hard-Anodized Aluminum',
      'Heat Exchanger': 'Integrated Flux-Ring Windshield Base',
      'Ignition': 'Push-Button Piezoelectric Igniter',
      'Boil Speed': '100 seconds per 500 ml',
    },
    image: '/images/catalog/stove-boreal-windmaster-system.webp',
  },
  {
    id: 'fuel-isobutane-canister-230g',
    name: 'PureBurn 230g Isobutane/Propane Fuel Canister',
    categories: ['Stoves'],
    activities: ['Backpacking', 'Mountaineering', 'Camping'],
    conditions: ['Cold', 'Sub-Zero', 'Mild'],
    weight: 380,
    price: 7.99,
    rating: 4.9,
    reviews: 210,
    description: '4-season 80/20 cold-weather gas blend with universal threaded Lindal valve.',
    specs: {
      'Gas Mixture': '80% Isobutane / 20% Propane 4-Season Blend',
      'Valve Type': 'Universal 7/16 UNEF Threaded Lindal Valve (EN417)',
      'Gas Net Weight': '230 g (8.1 oz)',
      'Burn Duration': 'Approx. 75 - 90 min at Full Output',
    },
    image: '/images/catalog/fuel-isobutane-canister-230g.webp',
  },
  {
    id: 'fuel-isobutane-canister-100g',
    name: 'PureBurn 100g Ultralight Isobutane Canister',
    categories: ['Stoves'],
    activities: ['Backpacking', 'Trail Running'],
    conditions: ['Mild', 'Hot', 'Dry'],
    weight: 195,
    price: 5.99,
    rating: 4.8,
    reviews: 140,
    description: 'Compact 100g canister designed to nest inside 750ml titanium mugs and stove sets.',
    specs: {
      'Gas Mixture': '80% Isobutane / 20% Propane Blend',
      'Valve Type': 'Universal 7/16 UNEF Threaded Lindal Valve',
      'Gas Net Weight': '100 g (3.5 oz)',
      'Pack Nesting': 'Nests inside 750ml - 1100ml backpacking pots',
    },
    image: '/images/catalog/fuel-isobutane-canister-100g.webp',
  },
];
