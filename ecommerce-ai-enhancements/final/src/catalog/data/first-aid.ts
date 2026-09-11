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

export const firstAidProducts: readonly Product[] = [
  {
    id: 'firstaid-wilderness-trauma-responder',
    name: 'Mountain Medic Wilderness First Aid Kit',
    categories: ['First Aid'],
    activities: ['Backpacking', 'Mountaineering', 'Hiking'],
    conditions: ['Cold', 'Wet', 'Hot'],
    weight: 430,
    price: 54.99,
    rating: 4.9,
    reviews: 140,
    description: 'Comprehensive 1-4 person medical kit with tourniquet, splint, and blister supplies.',
    specs: {
      'Group Size': '1 to 4 Persons (Up to 7 Days)',
      'Pouch Material': '420D Water-Resistant Ripstop Nylon with Dual Zippers',
      'Key Supplies': 'Windlass Tourniquet, Aluminum Splint, QuikClot, EMT Shears',
      'Organization': 'Color-Coded Modular Internal Mesh Compartments',
    },
    image: '/images/catalog/firstaid-wilderness-trauma-responder.webp',
  },
  {
    id: 'safety-bear-deterrent-spray-holster',
    name: 'Kodiak Defense Bear Deterrent Spray with Holster',
    categories: ['First Aid'],
    activities: ['Backpacking', 'Hiking', 'Camping'],
    conditions: ['Mild', 'Cold', 'Hot'],
    weight: 310,
    price: 49.99,
    rating: 4.9,
    reviews: 165,
    description: 'Maximum strength 1.0% Capsaicin bear spray with 10.5m spray range and holster.',
    specs: {
      'Active Ingredients': '1.0% Major Capsaicinoids (EPA Maximum Strength Formula)',
      'Spray Range': '10.5 meters (35 feet) Fog Pattern',
      'Spray Duration': '7 Seconds Continuous Empty Time (225g Canister)',
      'Safety Lock': 'Glow-in-the-Dark Safety Clip + Cordura Holster',
    },
    image: '/images/catalog/safety-bear-deterrent-spray-holster.webp',
  },
  {
    id: 'multitool-outfitter-titanium-14in1',
    name: 'Outfitter Pro 14-in-1 Titanium Pocket Multi-Tool',
    categories: ['First Aid', 'Cookware'],
    activities: ['Backpacking', 'Camping', 'Paddling'],
    conditions: ['Cold', 'Wet', 'Dry'],
    weight: 198,
    price: 74.99,
    rating: 4.8,
    reviews: 92,
    description: '198g multi-tool with one-handed opening pliers, knife, saw, scissors, and bit driver.',
    specs: {
      'Included Tools': 'Pliers, Wire Cutters, 440C Blade, Saw, Scissors, Bit Driver',
      'Blade Steel': 'High-Carbon 440C Stainless Steel Implements',
      'Handle Material': 'Skeletonized Grade 5 Titanium Scales',
      'Locking Mechanism': 'All-Locking Implements for Safe Field Operation',
    },
    image: '/images/catalog/multitool-outfitter-titanium-14in1.webp',
  },
  {
    id: 'repair-tenacious-gear-patch-tape',
    name: 'Tenacious Grip Waterproof Gear Repair Tape',
    categories: ['First Aid', 'Tents'],
    activities: ['Backpacking', 'Paddling', 'Mountaineering'],
    conditions: ['Wet', 'Cold', 'Sub-Zero'],
    weight: 40,
    price: 12.99,
    rating: 4.9,
    reviews: 190,
    description: 'Permanent transparent adhesive tape for field repairs on tents, jackets, and pads.',
    specs: {
      'Tape Dimensions': '50 cm x 7.5 cm (20 in x 3 in) Roll',
      'Adhesive Type': 'Ultra-Aggressive Waterproof Pressure-Sensitive Polymer',
      'Backing Film': 'Matte Flexible Polyurethane (Invisible on Ripstop/Gore-Tex)',
      'Application': 'Peel-and-Stick Repair for Tents, Jackets, Bags & Pads',
    },
    image: '/images/catalog/repair-tenacious-gear-patch-tape.webp',
  },
  {
    id: 'care-nikwax-tx-direct-wash-duopack',
    name: 'Nikwax Tech Wash & TX.Direct Waterproofing Duo',
    categories: ['First Aid', 'Jackets'],
    activities: ['Mountaineering', 'Hiking', 'Backpacking'],
    conditions: ['Wet', 'Snowy'],
    weight: 700,
    price: 26.99,
    rating: 4.8,
    reviews: 130,
    description: 'Technical wash and wash-in waterproofing to restore DWR on Gore-Tex outerwear.',
    specs: {
      'Package Contents': '1x 300ml Tech Wash + 1x 300ml TX.Direct Wash-In',
      'Environmental Standards': 'PFC-Free, Water-Based, Biodegradable & Non-Aerosol',
      'Compatible Fabrics': 'GORE-TEX, eVent, Pertex, SympaTex, DWR Shells',
      'Application Method': 'Standard Washing Machine or Hand Wash',
    },
    image: '/images/catalog/care-nikwax-tx-direct-wash-duopack.webp',
  },
  {
    id: 'blanket-emergency-thermal-mylar-2pk',
    name: 'ReflectaTherm Heavy-Duty Space Blanket (2-Pack)',
    categories: ['First Aid', 'Shelters'],
    activities: ['Backpacking', 'Mountaineering', 'Trail Running'],
    conditions: ['Sub-Zero', 'Cold', 'Windy'],
    weight: 80,
    price: 11.99,
    rating: 4.7,
    reviews: 75,
    description: '80g tear-resistant vacuum-metallized blanket reflecting 90% body heat in emergencies.',
    specs: {
      'Package Contents': '2 Individually Sealed Emergency Blankets',
      'Material': 'Tear-Resistant Vacuum-Metallized Polyethylene Mylar',
      'Thermal Reflection': 'Reflects up to 90% Radiated Body Heat',
      'Unfolded Dimensions': '142 cm x 213 cm (56 in x 84 in)',
    },
    image: '/images/catalog/blanket-emergency-thermal-mylar-2pk.webp',
  },
  {
    id: 'whistle-firestarter-emergency-combo',
    name: 'Alpine Signal 120dB Whistle with Ferro Rod',
    categories: ['First Aid', 'Navigation'],
    activities: ['Backpacking', 'Hiking', 'Trail Running'],
    conditions: ['Wet', 'Cold', 'Windy'],
    weight: 38,
    price: 14.99,
    rating: 4.8,
    reviews: 88,
    description: '38g pealess 120dB distress storm whistle paired with a 3,000°C spark ferrocerium rod.',
    specs: {
      'Sound Output': '120 dB Pealess High-Pitch Dual-Chamber Sound',
      'Spark Rod': 'Black Coated Ferrocerium Rod (3,000°C Sparks in Rain/Snow)',
      'Striker Tool': 'Hardened Steel Striker with Metric Scale & Opener',
      'Lanyard': 'Reflective 550 Military-Spec Paracord Neck Lanyard',
    },
    image: '/images/catalog/whistle-firestarter-emergency-combo.webp',
  },
  {
    id: 'saw-pocket-chainsaw-carbon-steel',
    name: 'TimberCut High-Carbon Flexible Pocket Chain Saw',
    categories: ['First Aid', 'Cookware'],
    activities: ['Camping', 'Backpacking'],
    conditions: ['Cold', 'Mild', 'Dry'],
    weight: 145,
    price: 24.99,
    rating: 4.6,
    reviews: 54,
    description: '145g flexible high-carbon steel chain saw with 33 bi-directional teeth for firewood.',
    specs: {
      'Chain Material': 'Heat-Treated 65Mn High-Carbon Industrial Steel',
      'Tooth Design': '33 Bi-Directional Self-Cleaning Cutting Teeth',
      'Chain Length': '65 cm Flexible Chain (103 cm Total with Straps)',
      'Handles': 'Heavy-Duty Reinforced Red Nylon Webbing Loop Grips',
    },
    image: '/images/catalog/saw-pocket-chainsaw-carbon-steel.webp',
  },
];
