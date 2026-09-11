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

export const sleepingBagProducts: readonly Product[] = [
  {
    id: 'sleepbag-taiga-down-minus10',
    name: 'Taiga 800-Fill Down Sleeping Bag (-10°C)',
    categories: ['Sleeping Bags'],
    activities: ['Mountaineering', 'Backpacking'],
    conditions: ['Sub-Zero', 'Snowy', 'Icy', 'Cold'],
    weight: 1050,
    price: 299.99,
    rating: 4.9,
    reviews: 110,
    description: 'Sub-zero RDS water-repellent down mummy bag for late-fall and winter alpine expeditions.',
    specs: {
      'Comfort Limit': '-10°C (14°F)',
      'Insulation': '800-Fill RDS Hydrophobic Goose Down',
      'Shell Fabric': '20D Pertex Quantum Ripstop',
      'Baffle Design': 'Box Wall Trapezoidal Baffles',
    },
    image: '/images/catalog/sleepbag-taiga-down-minus10.webp',
  },
  {
    id: 'sleepbag-summit-synthetic-0',
    name: 'Summit Synthetic 3-Season Bag (0°C)',
    categories: ['Sleeping Bags'],
    activities: ['Paddling', 'Camping', 'Backpacking'],
    conditions: ['Cold', 'Wet'],
    weight: 1320,
    price: 159.99,
    rating: 4.6,
    reviews: 76,
    description: 'High-loft synthetic hollow-fiber mummy bag that maintains warmth in damp canoe trips.',
    specs: {
      'Comfort Limit': '0°C (32°F)',
      'Insulation': 'ThermaLoft Continuous Filament Synthetic',
      'Shell Fabric': '30D DWR Polyester Ripstop',
      'Zipper': 'YKK Full-Length 2-Way Anti-Snag',
    },
    image: '/images/catalog/sleepbag-summit-synthetic-0.webp',
  },
  {
    id: 'sleepbag-solstice-summer-plus10',
    name: 'Solstice Ultralight Summer Bag (+10°C)',
    categories: ['Sleeping Bags'],
    activities: ['Backpacking', 'Hiking', 'Camping'],
    conditions: ['Hot', 'Mild', 'Dry'],
    weight: 650,
    price: 119.99,
    rating: 4.5,
    reviews: 39,
    description: '650g ultracompact summer bag that unzips flat into a warm-weather camp quilt.',
    specs: {
      'Comfort Limit': '+10°C (50°F)',
      'Insulation': 'Synthetic Microfiber 60gsm',
      'Construction': 'Sewn-Through Flat Quilt Conversion',
      'Packed Size': '15 x 22 cm',
    },
    image: '/images/catalog/sleepbag-solstice-summer-plus10.webp',
  },
];
