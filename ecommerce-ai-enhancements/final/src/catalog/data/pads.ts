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

export const padProducts: readonly Product[] = [
  {
    id: 'pad-laurentian-thermal-insulated',
    name: 'Laurentian Air Thermal Sleeping Pad (R-4.8)',
    categories: ['Pads', 'Sleeping Bags'],
    activities: ['Mountaineering', 'Backpacking'],
    conditions: ['Sub-Zero', 'Cold', 'Snowy', 'Icy'],
    weight: 540,
    price: 89.99,
    rating: 4.9,
    reviews: 145,
    description: '8cm thick insulated air mattress with internal heat-reflective foil barrier (R-Value 4.8).',
    specs: {
      'R-Value': '4.8',
      'Thickness': '8 cm (3.1 in)',
      'Dimensions': '183 x 51 cm',
      'Valve': 'High-Flow Micro-Adjust Dump Valve',
    },
    image: '/images/catalog/pad-laurentian-thermal-insulated.webp',
  },
  {
    id: 'pad-ultralight-foam-flex',
    name: 'FlexLite Closed-Cell Foam Camp Mat',
    categories: ['Pads', 'Sleeping Bags'],
    activities: ['Backpacking', 'Hiking'],
    conditions: ['Mild', 'Cold', 'Dry'],
    weight: 390,
    price: 34.99,
    rating: 4.4,
    reviews: 62,
    description: 'Accordion-folding 390g puncture-proof EVA foam mat with heat-trapping dimples (R-Value 2.0).',
    specs: {
      'R-Value': '2.0',
      'Material': 'Dual-Density Closed-Cell IXPE Foam',
      'Dimensions': '180 x 51 x 1.8 cm',
      'Fold Style': 'Accordion 14-Panel Z-Fold',
    },
    image: '/images/catalog/pad-ultralight-foam-flex.webp',
  },
];
