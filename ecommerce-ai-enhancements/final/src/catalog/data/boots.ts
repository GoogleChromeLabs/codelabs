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

export const bootProducts: readonly Product[] = [
  {
    id: 'boots-appalachian-mid-waterproof',
    name: 'Appalachian Waterproof Leather Mid Hiking Boots',
    categories: ['Boots'],
    activities: ['Backpacking', 'Hiking'],
    conditions: ['Wet', 'Cold', 'Snowy'],
    weight: 1160,
    price: 219.99,
    rating: 4.9,
    reviews: 160,
    description: 'Nubuck leather waterproof backpacking boot featuring Vibram Megagrip lugged outsoles.',
    specs: {
      'Upper Material': '2.0mm Full-Grain Oiled Nubuck Leather',
      'Waterproof Membrane': 'eVent Waterproof Breathable Bootie',
      'Outsole': 'Vibram Megagrip with 5mm Multidirectional Lugs',
      'Midsole': 'Dual-Density Molded EVA with TPU Torsion Shank',
    },
    image: '/images/catalog/boots-appalachian-mid-waterproof.webp',
  },
  {
    id: 'gaiters-alpine-waterproof-frontpoint',
    name: 'Frontpoint Breathable Alpine Trail Gaiters',
    categories: ['Boots', 'Shoes'],
    activities: ['Mountaineering', 'Hiking'],
    conditions: ['Snowy', 'Wet', 'Cold'],
    weight: 230,
    price: 49.99,
    rating: 4.8,
    reviews: 75,
    description: '1000D Cordura lower gaiters to seal out snow, mud, and scree from hiking boots.',
    specs: {
      'Lower Section': '1000D Ballistic Cordura Reinforcement',
      'Upper Section': '3-Layer GORE-TEX Breathable Nylon',
      'Closure': 'Front Hook-and-Loop Storm Flap + Hypalon Underfoot Strap',
      'Fit': 'Contoured Asymmetrical Top with Drawcord Cinch',
    },
    image: '/images/catalog/gaiters-alpine-waterproof-frontpoint.webp',
  },
  {
    id: 'crampons-nordic-ice-traction-spikes',
    name: 'Nordic Grip Steel Microspikes & Traction Cleats',
    categories: ['Boots', 'Shoes'],
    activities: ['Mountaineering', 'Hiking'],
    conditions: ['Sub-Zero', 'Icy', 'Snowy'],
    weight: 360,
    price: 64.99,
    rating: 4.9,
    reviews: 132,
    description: '12 stainless steel spikes per foot on flexible rubber harness for icy winter trails.',
    specs: {
      'Spike Material': 'Heat-Treated 304 Stainless Steel (12 Spikes / Foot)',
      'Spike Length': '13 mm (1/2 in)',
      'Harness': 'Elastomer Band Flexible Down to -40°C',
      'Chain Links': 'Welded Stainless Steel Flex Links',
    },
    image: '/images/catalog/crampons-nordic-ice-traction-spikes.webp',
  },
  {
    id: 'boot-dryer-portable-travel',
    name: 'Port-a-Dry Compact Boot & Glove Warmer',
    categories: ['Boots', 'Gloves'],
    activities: ['Mountaineering', 'Camping'],
    conditions: ['Cold', 'Snowy', 'Wet'],
    weight: 240,
    price: 39.99,
    rating: 4.5,
    reviews: 37,
    description: 'Dual USB/12V gentle thermal convection drying pods for soaked boots and gloves.',
    specs: {
      'Power Supply': 'Dual USB 5V / 12V DC Vehicle Adapter',
      'Heating Mechanism': 'Gentle PTC Thermal Convection (50°C Safe for Liners)',
      'Timer': 'Integrated 3h / 6h / 9h Auto-Off Controller',
      'Dimensions': '15 x 6 x 4 cm per Pod',
    },
    image: '/images/catalog/boot-dryer-portable-travel.webp',
  },
  {
    id: 'laces-kevlar-reinforced-hiking',
    name: 'Kevlar-Core Heavy Duty Boot Laces (Pair)',
    categories: ['Boots', 'Shoes'],
    activities: ['Hiking', 'Backpacking'],
    conditions: ['Cold', 'Wet', 'Dry'],
    weight: 30,
    price: 12.99,
    rating: 4.8,
    reviews: 82,
    description: 'Unbreakable 100% Kevlar-reinforced replacement laces rated to 500 lbs tensile strength.',
    specs: {
      'Tensile Strength': '500 lbs (227 kg) Break Strength',
      'Core Material': '100% Para-Aramid Braided Kevlar Core',
      'Outer Sheath': 'Abrasion-Resistant Braided Nylon Sheath',
      'Length': '180 cm (71 in) for 7-9 Eyelet Boots',
    },
    image: '/images/catalog/laces-kevlar-reinforced-hiking.webp',
  },
];
