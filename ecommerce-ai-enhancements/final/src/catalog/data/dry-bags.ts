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

export const dryBagProducts: readonly Product[] = [
  {
    id: 'drybag-st-lawrence-20l',
    name: 'St. Lawrence River 20L Heavy-Duty Dry Bag',
    categories: ['Dry Bags', 'Backpacks'],
    activities: ['Paddling', 'Camping'],
    conditions: ['Wet', 'Cold'],
    weight: 380,
    price: 29.99,
    rating: 4.9,
    reviews: 92,
    description: 'IPX7 submersible 500D PVC roll-top dry bag with shoulder sling for canoe rapids.',
    specs: {
      'Water Resistance': 'IPX7 Submersible',
      'Volume': '20 Litres',
      'Material': '500D PVC Tarpaulin with High-Frequency Welded Seams',
      'Carry System': 'Detachable Adjustable Crossbody Shoulder Sling',
    },
    image: '/images/catalog/drybag-st-lawrence-20l.webp',
  },
  {
    id: 'drybag-ultralight-set-3p',
    name: 'Pack-Tite Ultralight Dry Bag 3-Pack (5/10/15L)',
    categories: ['Dry Bags', 'Backpacks'],
    activities: ['Backpacking', 'Paddling'],
    conditions: ['Wet', 'Cold'],
    weight: 108,
    price: 39.99,
    rating: 4.8,
    reviews: 63,
    description: 'Translucent 30D siliconized Cordura dry sacks for internal backpack organization.',
    specs: {
      'Set Contents': '3 Sacks (15L Orange, 10L Blue, 5L Lime)',
      'Material': '30D Siliconized Cordura Ripstop with PU Backing',
      'Seams': 'Fully Taped Waterproof Seams',
      'Closure': 'Hypalon Roll-Top with Reinforced D-Ring',
    },
    image: '/images/catalog/drybag-ultralight-set-3p.webp',
  },
  {
    id: 'duffel-expedition-waterproof-70l',
    name: 'Boreal 70L Rugged Waterproof Duffel',
    categories: ['Dry Bags', 'Backpacks'],
    activities: ['Camping', 'Paddling', 'Mountaineering'],
    conditions: ['Wet', 'Snowy'],
    weight: 1450,
    price: 149.99,
    rating: 4.8,
    reviews: 36,
    description: 'Bombproof 840D TPU expedition duffel with stowable backpack shoulder straps.',
    specs: {
      'Volume': '70 Litres',
      'Material': '840D Double-Sided TPU Laminate',
      'Zipper': 'Heavy-Duty Water-Resistant YKK with Storm Flap',
      'Carry Options': 'Ergonomic Removable Padded Backpack Straps + End Haul Handles',
    },
    image: '/images/catalog/duffel-expedition-waterproof-70l.webp',
  },
];
