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

export const shelterProducts: readonly Product[] = [
  {
    id: 'tarp-borealis-silnylon',
    name: 'Borealis Ultralight Silnylon Camp Tarp (3x3m)',
    categories: ['Shelters', 'Tents'],
    activities: ['Backpacking', 'Paddling'],
    conditions: ['Wet', 'Windy'],
    weight: 480,
    price: 89.99,
    rating: 4.6,
    reviews: 42,
    description: '480g 30D silicone-coated square tarp with 16 tie-outs for ultralight minimalist bivouacs.',
    specs: {
      'Dimensions': '3m x 3m',
      'Material': '30D Silnylon Silicone/PU',
      'Waterproofing': '2000mm Hydrostatic Head',
      'Tie-Out Points': '16 Reinforced Perimeter & Center Loops',
    },
    image: '/images/catalog/tarp-borealis-silnylon.webp',
  },
  {
    id: 'chair-camp-compact-aluminum',
    name: 'St-Donat Ultralight Folding Camp Chair',
    categories: ['Shelters'],
    activities: ['Camping', 'Paddling'],
    conditions: ['Mild', 'Dry'],
    weight: 890,
    price: 69.99,
    rating: 4.7,
    reviews: 84,
    description: '890g shock-corded aluminum camp chair supporting up to 135kg.',
    specs: {
      'Frame': '7075 Anodized Aircraft Aluminum',
      'Fabric': '600D Ripstop Polyester',
      'Max Load': '135 kg (300 lbs)',
      'Packed Dimensions': '35 x 10 x 10 cm',
    },
    image: '/images/catalog/chair-camp-compact-aluminum.webp',
  },
];
