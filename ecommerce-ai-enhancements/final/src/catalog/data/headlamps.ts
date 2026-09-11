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

export const headlampProducts: readonly Product[] = [
  {
    id: 'headlamp-aurora-borealis-500lm',
    name: 'Aurora Borealis 500-Lumen Rechargeable Headlamp',
    categories: ['Headlamps'],
    activities: ['Backpacking', 'Mountaineering', 'Trail Running'],
    conditions: ['Wet', 'Cold', 'Windy'],
    weight: 78,
    price: 59.99,
    rating: 4.9,
    reviews: 142,
    description: '78g IPX8 waterproof 500lm hybrid headlamp with red night-vision mode and USB-C.',
    specs: {
      'Max Lumens': '500 Lumens (Turbo Mode)',
      'Beam Distance': '85 meters',
      'Water Resistance': 'IPX8 Fully Submersible (2m)',
      'Battery Type': 'Hybrid Rechargeable (1200mAh USB-C Li-Ion or 3x AAA)',
      'Light Modes': 'High (500lm), Med (200lm), Low (15lm), Red Night Vision, SOS',
    },
    image: '/images/catalog/headlamp-aurora-borealis-500lm.webp',
  },
  {
    id: 'light-clip-pack-beacon-red',
    name: 'NightTrail Ultralight Multi-Mode Safety Strobe',
    categories: ['Headlamps', 'First Aid'],
    activities: ['Trail Running', 'Hiking', 'Backpacking'],
    conditions: ['Wet', 'Cold', 'Windy'],
    weight: 20,
    price: 16.99,
    rating: 4.7,
    reviews: 62,
    description: '20g clip-on high-intensity LED strobe visible over 1km away in fog and darkness.',
    specs: {
      'Light Source': 'High-Output Red SMD LED with Optical Reflector',
      'Visibility Range': '1.2 km (0.75 mi) 360-Degree Arc',
      'Attachment': 'Integrated Spring Clip + Silicone Strap',
      'Battery Life': '60 Hours Strobe / 24 Hours Constant',
      'Charging': 'Micro USB Rechargeable',
    },
    image: '/images/catalog/light-clip-pack-beacon-red.webp',
  },
];
