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

export const baseLayerProducts: readonly Product[] = [
  {
    id: 'fleece-charlevoix-grid-midlayer',
    name: 'Charlevoix Technical Grid-Fleece Hoody',
    categories: ['Base Layers', 'Jackets'],
    activities: ['Mountaineering', 'Hiking', 'Trail Running'],
    conditions: ['Cold', 'Snowy'],
    weight: 315,
    price: 119.99,
    rating: 4.8,
    reviews: 94,
    description: 'High-mobility breathable grid-fleece midlayer with scuba hood and thumb loops.',
    specs: {
      'Fabric': 'Polartec Power Grid (93% Polyester, 7% Elastane)',
      'Construction': 'Flatlock Seams with Scuba Hood & Thumb Loops',
      'Zipper': 'YKK Deep 1/2 Front Zip for Venting',
      'Pocket': 'Laminated Zippered Chest Pocket',
    },
    image: '/images/catalog/fleece-charlevoix-grid-midlayer.webp',
  },
  {
    id: 'baselayer-merino-250-crew',
    name: 'High-Altitude Merino 250 Thermal Crew Top',
    categories: ['Base Layers'],
    activities: ['Mountaineering', 'Hiking', 'Backpacking'],
    conditions: ['Sub-Zero', 'Cold'],
    weight: 240,
    price: 94.99,
    rating: 4.9,
    reviews: 130,
    description: '100% natural 250g/m² heavyweight merino wool thermal top. Naturally odor-resistant.',
    specs: {
      'Fabric Density': '250 g/m² Interlock Knit',
      'Fiber Content': '100% Ultra-Fine 18.5 Micron Merino Wool',
      'Seams': 'Flatlock Anti-Chafing Construction',
      'Fit': 'Next-to-Skin Athletic Fit',
    },
    image: '/images/catalog/baselayer-merino-250-crew.webp',
  },
  {
    id: 'baselayer-merino-250-bottom',
    name: 'High-Altitude Merino 250 Thermal Leggings',
    categories: ['Base Layers'],
    activities: ['Mountaineering', 'Hiking', 'Backpacking'],
    conditions: ['Sub-Zero', 'Cold'],
    weight: 210,
    price: 89.99,
    rating: 4.8,
    reviews: 104,
    description: 'Heavyweight 250g/m² merino wool thermal long underwear for sub-zero active warmth.',
    specs: {
      'Fabric Density': '250 g/m² Interlock Knit',
      'Fiber Content': '100% Ultra-Fine 18.5 Micron Merino Wool',
      'Waistband': 'Merino-Lined Elastic Waistband',
      'Gusset': 'Articulated Inseam Gusset for Mobility',
    },
    image: '/images/catalog/baselayer-merino-250-bottom.webp',
  },
  {
    id: 'pants-mont-albert-alpine-trek',
    name: 'Mont-Albert Reinforced Alpine Trekking Pants',
    categories: ['Base Layers'],
    activities: ['Mountaineering', 'Hiking'],
    conditions: ['Cold', 'Windy', 'Snowy'],
    weight: 460,
    price: 139.99,
    rating: 4.7,
    reviews: 72,
    description: '4-way stretch softshell pants reinforced with 500D Cordura knees and boot lace hooks.',
    specs: {
      'Main Fabric': '90% Nylon, 10% Spandex 4-Way Stretch Softshell (DWR)',
      'Reinforcement': '500D Cordura Knee and Instep Kick Patches',
      'Cuffs': 'Zippered Ankle Gussets with Internal Boot Lace Hooks',
      'Pockets': '2 Hand Pockets + 2 Zippered Thigh Cargo Pockets',
    },
    image: '/images/catalog/pants-mont-albert-alpine-trek.webp',
  },
  {
    id: 'pants-storm-waterproof-rain-overpants',
    name: 'Torrential GORE-TEX Paclite Rain Overpants',
    categories: ['Base Layers', 'Jackets'],
    activities: ['Backpacking', 'Hiking', 'Paddling'],
    conditions: ['Wet', 'Windy'],
    weight: 270,
    price: 159.99,
    rating: 4.8,
    reviews: 61,
    description: '270g packable waterproof overpants with 3/4 side zippers for fast on/off over boots.',
    specs: {
      'Membrane': 'GORE-TEX Paclite Plus 2.5-Layer',
      'Waterproofing': '28,000 mm Hydrostatic Head',
      'Zippers': '3/4 Length Dual-Direction WaterTight Side Zips',
      'Waist': 'Elasticized Drawcord Waist with Articulated Knees',
    },
    image: '/images/catalog/pants-storm-waterproof-rain-overpants.webp',
  },
  {
    id: 'beanie-nunavik-merino-wool',
    name: 'Nunavik Double-Layer Merino Wool Beanie',
    categories: ['Base Layers'],
    activities: ['Mountaineering', 'Backpacking', 'Hiking'],
    conditions: ['Sub-Zero', 'Cold', 'Windy'],
    weight: 75,
    price: 34.99,
    rating: 4.9,
    reviews: 140,
    description: '100% fine merino rib-knit double-cuff toque for maximum ear warmth.',
    specs: {
      'Knit': '100% Fine Merino Wool Rib-Knit',
      'Construction': 'Double-Layer Roll Cuff for Ear Warmth',
      'Odor Control': 'Natural Antimicrobial Wool',
    },
    image: '/images/catalog/beanie-nunavik-merino-wool.webp',
  },
  {
    id: 'socks-merino-heavy-cushion-trek',
    name: 'PeakTrek Heavy Cushion Merino Mountaineering Socks',
    categories: ['Base Layers'],
    activities: ['Mountaineering', 'Hiking', 'Backpacking'],
    conditions: ['Sub-Zero', 'Cold', 'Snowy'],
    weight: 120,
    price: 27.99,
    rating: 4.9,
    reviews: 175,
    description: 'High-density looped terry merino socks for blister-free comfort in stiff boots.',
    specs: {
      'Material': '78% Merino Wool, 20% Nylon, 2% Lycra Spandex',
      'Cushioning': 'High-Density Full-Foot Terry Loop Cushion',
      'Arch Support': 'Elasticized Arch Band for Lock-In Fit',
      'Toe Closure': 'Seamless Smooth Toe Link',
    },
    image: '/images/catalog/socks-merino-heavy-cushion-trek.webp',
  },
  {
    id: 'socks-merino-light-trail-runner',
    name: 'PeakTrek Light Cushion Merino Running Socks (2-Pk)',
    categories: ['Base Layers'],
    activities: ['Trail Running', 'Hiking'],
    conditions: ['Hot', 'Mild', 'Dry'],
    weight: 60,
    price: 19.99,
    rating: 4.7,
    reviews: 98,
    description: 'Fast-drying quarter-crew merino running socks with targeted impact cushioning.',
    specs: {
      'Package Count': '2 Pairs',
      'Material': '62% Merino Wool, 34% Nylon, 4% Lycra Spandex',
      'Height': 'Quarter-Crew (Above Ankle)',
      'Ventilation': 'Breathable Mesh Instep Zones',
    },
    image: '/images/catalog/socks-merino-light-trail-runner.webp',
  },
  {
    id: 'neck-gaiter-merino-thermal',
    name: 'Thermal Merino Wool Neck Gaiter / Buff',
    categories: ['Base Layers'],
    activities: ['Mountaineering', 'Backpacking', 'Trail Running'],
    conditions: ['Sub-Zero', 'Cold', 'Windy'],
    weight: 45,
    price: 24.99,
    rating: 4.9,
    reviews: 115,
    description: 'Seamless 200g/m² 100% merino wool neck tube for wind and snow protection.',
    specs: {
      'Material': '100% Merino Wool Jersey (200 g/m²)',
      'Construction': 'Seamless Tubular Knit',
      'Length': '48 cm Multi-Functional Wear',
    },
    image: '/images/catalog/neck-gaiter-merino-thermal.webp',
  },
];
