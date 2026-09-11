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

export const jacketProducts: readonly Product[] = [
  {
    id: 'jacket-saguenay-goretex-pro-shell',
    name: 'Saguenay 3-Layer GORE-TEX Pro Shell Jacket',
    categories: ['Jackets'],
    activities: ['Mountaineering', 'Hiking', 'Backpacking'],
    conditions: ['Wet', 'Windy', 'Cold'],
    weight: 435,
    price: 399.99,
    rating: 4.9,
    reviews: 156,
    description: '28,000mm waterproof alpine storm jacket with underarm pit zips and helmet hood.',
    specs: {
      'Membrane': '3-Layer GORE-TEX Pro Most Breathable',
      'Waterproofing': '28,000 mm Hydrostatic Head',
      'Breathability': 'RET < 6',
      'Hood': 'Helmet-Compatible StormHood with Cohaesive Adjusters',
      'Ventilation': 'WaterTight Underarm Pit Zips',
    },
    image: '/images/catalog/jacket-saguenay-goretex-pro-shell.webp',
  },
  {
    id: 'jacket-arctic-boreal-down-850',
    name: 'Arctic Boreal 850-Fill Goose Down Parka',
    categories: ['Jackets'],
    activities: ['Mountaineering'],
    conditions: ['Sub-Zero', 'Snowy', 'Windy'],
    weight: 590,
    price: 349.99,
    rating: 4.9,
    reviews: 88,
    description: 'Sub-zero expedition down parka engineered for severe cold down to -25°C.',
    specs: {
      'Insulation': '850-Fill Power RDS European Goose Down',
      'Shell Fabric': '30D Windstopper with DWR',
      'Construction': 'Box-Baffle Chamber Construction',
      'Features': 'Insulated Draft Collar & Internal Mesh Dump Pockets',
    },
    image: '/images/catalog/jacket-arctic-boreal-down-850.webp',
  },
  {
    id: 'vest-windproof-ultralight-running',
    name: 'Aerolite Ultralight Packable Wind Vest',
    categories: ['Jackets'],
    activities: ['Trail Running', 'Hiking'],
    conditions: ['Mild', 'Windy'],
    weight: 75,
    price: 79.99,
    rating: 4.8,
    reviews: 43,
    description: '75g featherweight wind-blocking core vest with laser-perforated back venting.',
    specs: {
      'Fabric': '15D Toray Airtastic Nylon Ripstop',
      'Air Permeability': '1.5 CFM Wind-Blocking Core',
      'Ventilation': 'Laser-Cut Perforated Rear Heat Dump Zone',
      'Packability': 'Stuffs into Integrated Chest Pocket',
    },
    image: '/images/catalog/vest-windproof-ultralight-running.webp',
  },
];
