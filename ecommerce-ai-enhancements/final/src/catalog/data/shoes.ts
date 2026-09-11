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

export const shoeProducts: readonly Product[] = [
  {
    id: 'shoes-laurentian-speed-trail-runner',
    name: 'Laurentian Speed Vigor Trail Running Shoes',
    categories: ['Shoes'],
    activities: ['Trail Running', 'Hiking'],
    conditions: ['Mild', 'Hot', 'Dry'],
    weight: 580,
    price: 149.99,
    rating: 4.8,
    reviews: 118,
    description: 'Aggressive 4.5mm lugged trail runner with protective rock plate and speed lacing.',
    specs: {
      'Lug Depth': '4.5 mm Multidirectional Chevron Lugs',
      'Heel-to-Toe Drop': '6 mm (Stack: 26mm Heel / 20mm Forefoot)',
      'Protection': 'Full Forefoot ESS Ballistic Rock Shield',
      'Lacing System': 'Quick-Pull Kevlar Speed Lace with Lace Garage',
    },
    image: '/images/catalog/shoes-laurentian-speed-trail-runner.webp',
  },
  {
    id: 'poles-carbon-trekking-ultralight',
    name: 'Carbon Aero Pro Folding Trekking Poles (Pair)',
    categories: ['Shoes', 'Boots'],
    activities: ['Backpacking', 'Hiking', 'Mountaineering'],
    conditions: ['Mild', 'Cold', 'Snowy'],
    weight: 395,
    price: 129.99,
    rating: 4.8,
    reviews: 106,
    description: '395g folding 100% carbon fiber poles with natural cork sweat-wicking grips.',
    specs: {
      'Shaft Material': '100% High-Modulus Carbon Fiber (3-Section Folding)',
      'Grip Material': 'Ergonomic Natural Cork with Extended EVA Foam Choke',
      'Adjustability': 'SpeedLock Pro Clamp (110 - 130 cm Usable Length)',
      'Collapsed Length': '36 cm (14.2 in) Z-Fold Pack Size',
    },
    image: '/images/catalog/poles-carbon-trekking-ultralight.webp',
  },
  {
    id: 'shoes-camp-recovery-slide',
    name: 'Basecamp Thermal Insulated Camp Booties',
    categories: ['Shoes', 'Boots'],
    activities: ['Camping', 'Mountaineering'],
    conditions: ['Cold', 'Snowy', 'Dry'],
    weight: 170,
    price: 54.99,
    rating: 4.7,
    reviews: 48,
    description: 'Cozy insulated slip-on camp booties with non-slip silicone traction sole.',
    specs: {
      'Insulation': '200g Synthetic Micro-Baffle Loft',
      'Upper Material': 'DWR-Treated 40D Ripstop Nylon',
      'Sole': 'Textured High-Traction Non-Slip Silicone Tread',
      'Footbed': 'Cushioned Memory Foam Drop-In Insole',
    },
    image: '/images/catalog/shoes-camp-recovery-slide.webp',
  },
  {
    id: 'insoles-trail-orthotic-support',
    name: 'TrailSupport Cushioning Ergonomic Insoles',
    categories: ['Shoes', 'Boots'],
    activities: ['Hiking', 'Trail Running', 'Backpacking'],
    conditions: ['Mild', 'Cold', 'Hot'],
    weight: 85,
    price: 34.99,
    rating: 4.6,
    reviews: 67,
    description: 'Deep heel cup and carbon-composite arch support replacement insoles for trail footwear.',
    specs: {
      'Arch Profile': 'Semi-Rigid Carbon-Composite Dynamic Arch',
      'Heel Cup': 'Deep Contoured Stabilizing Heel Cradle',
      'Top Cover': 'Silvadur Antimicrobial Odor-Resistant Mesh',
      'Cushioning Layer': 'PORON XRD Impact Absorbing Forefoot Pad',
    },
    image: '/images/catalog/insoles-trail-orthotic-support.webp',
  },
  {
    id: 'sandals-river-hybrid-water',
    name: 'Rivière All-Terrain Amphibious Hiking Sandals',
    categories: ['Shoes'],
    activities: ['Paddling', 'Hiking'],
    conditions: ['Hot', 'Mild', 'Wet'],
    weight: 680,
    price: 89.99,
    rating: 4.7,
    reviews: 59,
    description: 'Quick-drying webbed amphibious sandals with rubber toe protection and wet-rock grip.',
    specs: {
      'Outsole': 'Non-Marking HydroGrip Razor-Siped Rubber',
      'Upper Webbing': 'Quick-Dry Recycled Polyester Webbing',
      'Toe Protection': 'Patented Molded Rubber Toe Bumper',
      'Midsole': 'Compression-Molded EVA with Metatomical Footbed',
    },
    image: '/images/catalog/sandals-river-hybrid-water.webp',
  },
];
