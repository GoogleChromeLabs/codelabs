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

export const cookwareProducts: readonly Product[] = [
  {
    id: 'cookset-titanium-pot-pan-combo',
    name: 'TitanTrek 1100ml Titanium Pot & Skillet Set',
    categories: ['Cookware'],
    activities: ['Backpacking', 'Hiking'],
    conditions: ['Mild', 'Cold', 'Hot'],
    weight: 165,
    price: 64.99,
    rating: 4.8,
    reviews: 88,
    description: '165g pure titanium 1.1L pot with lid that doubles as a frying pan/bowl.',
    specs: {
      'Pot Volume': '1100 ml (37.2 fl oz)',
      'Lid Volume': '350 ml (11.8 fl oz) Skillet/Lid',
      'Material': 'Grade 1 Ultralight Pure Titanium (0.4mm)',
      'Handles': 'Foldable Silicone-Coated Wire Handles',
    },
    image: '/images/catalog/cookset-titanium-pot-pan-combo.webp',
  },
  {
    id: 'mug-double-wall-titanium-450ml',
    name: 'TitanTrek 450ml Double-Wall Titanium Mug',
    categories: ['Cookware'],
    activities: ['Camping', 'Backpacking'],
    conditions: ['Cold', 'Sub-Zero', 'Mild'],
    weight: 120,
    price: 34.99,
    rating: 4.7,
    reviews: 71,
    description: 'Vacuum-insulated titanium camp mug with folding handles; keeps drinks hot for 2 hours.',
    specs: {
      'Volume': '450 ml (15.2 fl oz)',
      'Construction': 'Double-Wall Vacuum Insulated Pure Titanium',
      'Handles': 'Folding Wire D-Ring Handles',
      'Finish': 'Matte Bead-Blasted Exterior',
    },
    image: '/images/catalog/mug-double-wall-titanium-450ml.webp',
  },
  {
    id: 'utensil-titanium-long-handle-spork',
    name: 'Long-Reach Ultralight Titanium Trail Spork',
    categories: ['Cookware'],
    activities: ['Backpacking', 'Hiking'],
    conditions: ['Mild', 'Hot', 'Cold'],
    weight: 19,
    price: 14.99,
    rating: 4.9,
    reviews: 180,
    description: '19g 21.5cm long handle titanium spork designed to reach deep into meal pouches.',
    specs: {
      'Total Length': '21.5 cm (8.5 in)',
      'Material': 'Pure Titanium with Polished Bowl & Matte Stem',
      'Bowl Finish': 'Smooth Polished Mouth Contact Surface',
      'Handle Style': 'Hexagonal Skeletonized Cutouts',
    },
    image: '/images/catalog/utensil-titanium-long-handle-spork.webp',
  },
  {
    id: 'meal-freeze-dried-montreal-shepherds-pie',
    name: 'Backcountry Freeze-Dried Pâté Chinois (2-Serv)',
    categories: ['Cookware'],
    activities: ['Backpacking', 'Mountaineering', 'Camping'],
    conditions: ['Cold', 'Sub-Zero', 'Mild'],
    weight: 180,
    price: 13.99,
    rating: 4.9,
    reviews: 195,
    description: 'Quebec Shepherd’s Pie with beef, corn, and mashed potatoes (650 kcal, 36g protein).',
    specs: {
      'Calories': '650 kcal (2720 kJ)',
      'Protein': '36 g',
      'Servings': '2 Servings',
      'Prep Time': '10 - 12 Minutes with 400ml Boiling Water',
    },
    image: '/images/catalog/meal-freeze-dried-montreal-shepherds-pie.webp',
  },
  {
    id: 'meal-freeze-dried-wild-berry-oatmeal',
    name: 'Backcountry Wild Blueberry & Maple Oats (2-Serv)',
    categories: ['Cookware'],
    activities: ['Backpacking', 'Hiking', 'Camping'],
    conditions: ['Mild', 'Cold', 'Hot'],
    weight: 140,
    price: 9.99,
    rating: 4.8,
    reviews: 110,
    description: 'Organic rolled oats with maple sugar flakes, chia, and wild blueberries (520 kcal).',
    specs: {
      'Calories': '520 kcal',
      'Dietary': 'Certified Organic / Vegan / Gluten-Free',
      'Servings': '2 Servings',
      'Prep Time': '5 Minutes with Hot or Cold Water',
    },
    image: '/images/catalog/meal-freeze-dried-wild-berry-oatmeal.webp',
  },
];
