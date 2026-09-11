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

export const waterFilterProducts: readonly Product[] = [
  {
    id: 'filter-rapids-squeeze-water',
    name: 'Rapids Gravity & Squeeze Micro Water Filter',
    categories: ['Water Filters', 'Hydration'],
    activities: ['Backpacking', 'Hiking', 'Trail Running'],
    conditions: ['Mild', 'Hot', 'Wet'],
    weight: 65,
    price: 42.99,
    rating: 4.9,
    reviews: 165,
    description: '65g 0.1-micron hollow-fiber filter removing 99.99999% of bacteria and protozoa.',
    specs: {
      'Filter Type': '0.1-Micron Absolute Hollow-Fiber Membrane',
      'Flow Rate': 'Up to 1.8 Litres / minute',
      'Filter Life': 'Up to 100,000 Litres (Backflushable)',
      'Filtration Standard': '99.99999% Bacteria & 99.9999% Protozoa',
    },
    image: '/images/catalog/filter-rapids-squeeze-water.webp',
  },
];
