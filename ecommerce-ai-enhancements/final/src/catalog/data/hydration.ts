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

export const hydrationProducts: readonly Product[] = [
  {
    id: 'vest-trail-marathon-hydration-12l',
    name: 'Endurance 12L Trail Running Hydration Vest',
    categories: ['Hydration', 'Backpacks'],
    activities: ['Trail Running'],
    conditions: ['Hot', 'Mild', 'Dry'],
    weight: 225,
    price: 129.99,
    rating: 4.8,
    reviews: 68,
    description: '225g bounce-free running vest with twin 500ml soft flasks included.',
    specs: {
      'Gear Capacity': '12 Litres Total Volume',
      'Included Hydration': '2x 500ml Ultra-Flasks with High-Flow Bite Valves',
      'Harness & Fit': 'Dual Elastic Sternum Sliders + Side Bungees',
      'Material': 'Breathable 3D Power Mesh with 4-Way Stretch Pockets',
    },
    image: '/images/catalog/vest-trail-marathon-hydration-12l.webp',
  },
  {
    id: 'bottle-insulated-stainless-1l',
    name: 'GlacierShield 1L Vacuum Insulated Steel Bottle',
    categories: ['Hydration', 'Cookware'],
    activities: ['Hiking', 'Mountaineering', 'Camping'],
    conditions: ['Hot', 'Cold', 'Sub-Zero'],
    weight: 420,
    price: 36.99,
    rating: 4.8,
    reviews: 125,
    description: '18/8 stainless steel bottle keeping liquids cold 24h or hot 12h; wide mouth fits filters.',
    specs: {
      'Liquid Capacity': '1.0 Litre (33.8 fl oz)',
      'Insulation': 'TempShield Double-Wall Vacuum Insulation',
      'Material': '18/8 Pro-Grade Food-Safe Stainless Steel',
      'Thermal Performance': 'Cold up to 24 Hours / Hot up to 12 Hours',
    },
    image: '/images/catalog/bottle-insulated-stainless-1l.webp',
  },
  {
    id: 'reservoir-hydrapack-3l-bladder',
    name: 'HydraFlow 3L Leak-Proof Hydration Reservoir',
    categories: ['Hydration'],
    activities: ['Backpacking', 'Hiking', 'Trail Running'],
    conditions: ['Hot', 'Mild', 'Dry'],
    weight: 160,
    price: 38.99,
    rating: 4.7,
    reviews: 89,
    description: 'Wide slide-seal 3L bladder with insulated quick-disconnect drinking hose.',
    specs: {
      'Fluid Capacity': '3.0 Litres (100 fl oz)',
      'Material': 'BPA/PVC-Free 0.4mm TPU with RF-Welded Seams',
      'Hose System': 'Quick-Disconnect Plug-N-Play Insulated Tube with Surge Valve',
      'Top Opening': 'Slide-Seal Wide Mouth for Easy Cleaning',
    },
    image: '/images/catalog/reservoir-hydrapack-3l-bladder.webp',
  },
];
