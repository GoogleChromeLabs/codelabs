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

export const tentProducts: readonly Product[] = [
  {
    id: 'tent-mont-tremblant-3p',
    name: 'Mont-Tremblant 3-Season Expedition Tent',
    categories: ['Tents', 'Shelters'],
    activities: ['Backpacking', 'Mountaineering'],
    conditions: ['Wet', 'Windy', 'Cold'],
    weight: 2150,
    price: 349.99,
    rating: 4.9,
    reviews: 128,
    description: '3-Person, 2.15kg double-wall ripstop shelter with DAC Featherlite poles and 3000mm waterproofing.',
    specs: {
      'Capacity': '3 Person',
      'Floor Area': '4.2 sq m',
      'Waterproofing': '3000mm Fly / 5000mm Floor',
      'Poles': 'DAC Featherlite NSL Aluminum',
    },
    image: '/images/catalog/tent-mont-tremblant-3p.webp',
  },
  {
    id: 'tent-gaspesie-ultralight-2p',
    name: 'Gaspésie Ultralight 2P Backpacking Tent',
    categories: ['Tents', 'Shelters'],
    activities: ['Backpacking', 'Hiking'],
    conditions: ['Mild', 'Windy', 'Wet'],
    weight: 1280,
    price: 289.99,
    rating: 4.8,
    reviews: 95,
    description: 'Sub-1.3kg freestanding 2-person tent engineered for long-distance thru-hiking and alpine ridges.',
    specs: {
      'Capacity': '2 Person',
      'Floor Area': '2.8 sq m',
      'Waterproofing': '2000mm Silnylon Fly',
      'Poles': 'Carbon Composite',
    },
    image: '/images/catalog/tent-gaspesie-ultralight-2p.webp',
  },
  {
    id: 'tent-laurentian-family-4p',
    name: 'Laurentian 4-Person Basecamp Tent',
    categories: ['Tents', 'Shelters'],
    activities: ['Camping'],
    conditions: ['Mild', 'Dry'],
    weight: 6800,
    price: 429.99,
    rating: 4.7,
    reviews: 64,
    description: 'Stand-up height (185cm) 4-person tent with large screen porch vestibule for family camping.',
    specs: {
      'Capacity': '4 Person',
      'Peak Height': '185 cm',
      'Floor Area': '6.4 sq m',
      'Material': '68D Polyester Ripstop',
    },
    image: '/images/catalog/tent-laurentian-family-4p.webp',
  },
  {
    id: 'footprint-mont-tremblant-3p',
    name: 'Mont-Tremblant 3P Custom Fitted Footprint',
    categories: ['Tents', 'Shelters'],
    activities: ['Backpacking', 'Mountaineering'],
    conditions: ['Wet', 'Cold'],
    weight: 280,
    price: 39.99,
    rating: 4.9,
    reviews: 88,
    description: '70D protective groundsheet cut to protect tent floors from abrasive granite and damp ground.',
    specs: {
      'Compatibility': 'Mont-Tremblant 3P',
      'Material': '70D Polyurethane Coated Nylon',
      'Attachment': 'Corner Grommets',
    },
    image: '/images/catalog/footprint-mont-tremblant-3p.webp',
  },
  {
    id: 'footprint-gaspesie-2p',
    name: 'Gaspésie 2P Ultralight Tent Groundsheet',
    categories: ['Tents', 'Shelters'],
    activities: ['Backpacking', 'Hiking'],
    conditions: ['Mild', 'Wet'],
    weight: 190,
    price: 34.99,
    rating: 4.8,
    reviews: 51,
    description: '190g fitted ultralight groundsheet tailored specifically for the Gaspésie 2P tent.',
    specs: {
      'Compatibility': 'Gaspésie 2P',
      'Material': '40D Silnylon Ripstop',
      'Attachment': 'Webbing Cord Loops',
    },
    image: '/images/catalog/footprint-gaspesie-2p.webp',
  },
];
