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

export const gloveProducts: readonly Product[] = [
  {
    id: 'gloves-baffin-insulated-mountaineering',
    name: 'Baffin Waterproof Insulated Mountaineering Gloves',
    categories: ['Gloves'],
    activities: ['Mountaineering'],
    conditions: ['Sub-Zero', 'Snowy', 'Windy'],
    weight: 210,
    price: 89.99,
    rating: 4.9,
    reviews: 85,
    description: 'Goat leather winter gloves insulated with 170g PrimaLoft Gold for alpine freezing conditions.',
    specs: {
      'Insulation': 'PrimaLoft Gold 170g Back / 100g Palm',
      'Palm Material': 'Water-Resistant Goat Leather with Kevlar Stitching',
      'Shell Fabric': '330D Cordura Gauntlet with One-Handed Drawcord',
      'Waterproofing': 'GORE-TEX Waterproof/Breathable Insert',
    },
    image: '/images/catalog/gloves-baffin-insulated-mountaineering.webp',
  },
  {
    id: 'gloves-trail-light-windstopper',
    name: 'WindBlock Touchscreen Trail Gloves',
    categories: ['Gloves'],
    activities: ['Trail Running', 'Hiking'],
    conditions: ['Mild', 'Cold', 'Windy'],
    weight: 65,
    price: 39.99,
    rating: 4.6,
    reviews: 52,
    description: 'Form-fitting softshell windproof gloves with conductive touchscreen fingertips.',
    specs: {
      'Fabric': 'GORE-TEX INFINIUM Windstopper Softshell',
      'Palm Grip': 'Silicone Patterned Micro-Dot Grip',
      'Touchscreen Compatibility': 'Conductive Sensor-Thread Index & Thumb',
      'Cuff': 'Low-Profile Stretch Neoprene Cuff',
    },
    image: '/images/catalog/gloves-trail-light-windstopper.webp',
  },
  {
    id: 'warmer-rechargeable-hand-electronic',
    name: 'ThermGrip 5200mAh Dual-Sided USB Hand Warmer',
    categories: ['Gloves', 'First Aid'],
    activities: ['Mountaineering', 'Camping', 'Hiking'],
    conditions: ['Sub-Zero', 'Cold', 'Windy'],
    weight: 135,
    price: 32.99,
    rating: 4.8,
    reviews: 88,
    description: 'Electronic aluminum hand warmer heating up in 3s with 3 temperature presets.',
    specs: {
      'Heat Settings': '3 Heat Settings (40°C, 48°C, 55°C)',
      'Battery Capacity': '5200 mAh Lithium-Ion',
      'Runtime': '4 - 8 Hours Continuous Heat',
      'Output Port': 'USB-A 5V/2A (Emergency Power Bank)',
    },
    image: '/images/catalog/warmer-rechargeable-hand-electronic.webp',
  },
];
