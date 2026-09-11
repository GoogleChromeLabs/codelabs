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

export const lanternProducts: readonly Product[] = [
  {
    id: 'lantern-sol-camping-collapsible',
    name: 'SolGlow Solar & USB Collapsible Tent Lantern',
    categories: ['Lanterns', 'Headlamps'],
    activities: ['Camping', 'Paddling'],
    conditions: ['Hot', 'Mild', 'Dry'],
    weight: 165,
    price: 29.99,
    rating: 4.7,
    reviews: 68,
    description: 'Soft silicone 300-lumen lantern that collapses flat; charges via solar panel or USB.',
    specs: {
      'Max Lumens': '300 Lumens with Frosted Diffuser',
      'Battery Capacity': '2000 mAh Rechargeable Li-Ion',
      'Charging Methods': 'Monocrystalline Solar Top Panel or USB-C (3.5h Charge)',
      'Water Resistance': 'IPX4 Splashproof',
      'Collapsed Height': '2.5 cm (1.0 in) Flat-Pack Profile',
    },
    image: '/images/catalog/lantern-sol-camping-collapsible.webp',
  },
];
