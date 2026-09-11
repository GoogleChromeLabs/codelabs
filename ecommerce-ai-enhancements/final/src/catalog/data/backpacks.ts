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

export const backpackProducts: readonly Product[] = [
  {
    id: 'pack-expedition-trans-canada-65l',
    name: 'Trans-Canada 65L Expedition Backpack',
    categories: ['Backpacks'],
    activities: ['Backpacking', 'Mountaineering'],
    conditions: ['Cold', 'Wet', 'Windy'],
    weight: 2180,
    price: 269.99,
    rating: 4.8,
    reviews: 112,
    description: 'Heavy-haul 65L pack with pivoting lumbar hipbelt and bottom sleeping bag compartment.',
    specs: {
      'Volume': '65 Litres',
      'Frame': 'Internal Aluminum Stays + HDPE Sheet',
      'Main Fabric': '210D Cordura Nylon Ripstop with 500D Base',
      'Torso Fit': '41 - 56 cm (16 - 22 in)',
    },
    image: '/images/catalog/pack-expedition-trans-canada-65l.webp',
  },
  {
    id: 'pack-weekend-chic-chocs-38l',
    name: 'Chic-Chocs 38L Alpine Trekking Pack',
    categories: ['Backpacks'],
    activities: ['Mountaineering', 'Hiking'],
    conditions: ['Cold', 'Snowy', 'Windy'],
    weight: 1150,
    price: 179.99,
    rating: 4.9,
    reviews: 78,
    description: '38L roll-top alpine pack for weekend overnight trips and technical ridge traverses.',
    specs: {
      'Volume': '38 Litres',
      'Closure': 'Roll-Top with Side & Top Compression',
      'Main Fabric': '100D High-Tenacity Robic Nylon',
      'Tool Attachment': 'Dual Ice Axe / Trekking Pole Loops',
    },
    image: '/images/catalog/pack-weekend-chic-chocs-38l.webp',
  },
  {
    id: 'pack-day-mont-royal-18l',
    name: 'Mont-Royal 18L Summit Daypack',
    categories: ['Backpacks'],
    activities: ['Hiking', 'Trail Running'],
    conditions: ['Mild', 'Dry', 'Wet'],
    weight: 520,
    price: 79.99,
    rating: 4.7,
    reviews: 150,
    description: '520g sleek daypack with hydration/laptop sleeve and breathable air-mesh back.',
    specs: {
      'Volume': '18 Litres',
      'Back Panel': 'Breathable 3D Spacer Mesh',
      'Hydration Compatibility': 'Up to 3L Reservoir Sleeve',
      'Pockets': 'Zippered Top Lid + Dual Stretch Mesh Side Pockets',
    },
    image: '/images/catalog/pack-day-mont-royal-18l.webp',
  },
  {
    id: 'waistpack-trail-lumbar-5l',
    name: 'Parc du Mont-Royal 5L Lumbar Trail Pack',
    categories: ['Backpacks'],
    activities: ['Trail Running', 'Hiking'],
    conditions: ['Mild', 'Hot', 'Dry'],
    weight: 310,
    price: 44.99,
    rating: 4.5,
    reviews: 41,
    description: 'Ergonomic lumbar pack with twin water bottle holsters for fast day hikes.',
    specs: {
      'Volume': '5 Litres',
      'Bottle Holsters': 'Dual Angled 750ml Bungee Holsters',
      'Hipbelt Fit': '66 - 122 cm (26 - 48 in)',
      'Reflectivity': '360-Degree Reflective Accents',
    },
    image: '/images/catalog/waistpack-trail-lumbar-5l.webp',
  },
  {
    id: 'pack-cover-waterproof-highvis',
    name: 'Shield-Tech High-Visibility Rain Cover (50-70L)',
    categories: ['Backpacks'],
    activities: ['Backpacking', 'Hiking'],
    conditions: ['Wet', 'Windy'],
    weight: 115,
    price: 24.99,
    rating: 4.6,
    reviews: 55,
    description: 'Seamless waterproof ripstop cover with reflective perimeter to shield large packs in storms.',
    specs: {
      'Volume Capacity': '50 - 70 Litres',
      'Material': '70D Taffeta Nylon 2000mm PU',
      'Closure': 'Full Perimeter Elastic Drawcord with Central Buckle',
      'Visibility': 'Blaze Orange with Retroreflective Printing',
    },
    image: '/images/catalog/pack-cover-waterproof-highvis.webp',
  },
  {
    id: 'organizer-packing-cube-ultralight',
    name: 'Ultralight Compression Packing Cube Set (3-Pk)',
    categories: ['Backpacks'],
    activities: ['Camping', 'Backpacking'],
    conditions: ['Mild', 'Dry'],
    weight: 130,
    price: 29.99,
    rating: 4.7,
    reviews: 49,
    description: 'Dual-zipper compression cubes that compress apparel volume by up to 40%.',
    specs: {
      'Set Contents': '3 Cubes (Large 10L, Medium 5L, Small 2.5L)',
      'Material': '30D Siliconized Diamond Ripstop Cordura',
      'Compression': 'Perimeter Expansion/Compression Zipper',
      'Zippers': 'YKK Self-Repairing Coil',
    },
    image: '/images/catalog/organizer-packing-cube-ultralight.webp',
  },
];
