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

export const navigationProducts: readonly Product[] = [
  {
    id: 'powerbank-solar-rugged-20000mah',
    name: 'Rugged Outback 20,000mAh Solar Power Bank',
    categories: ['Navigation'],
    activities: ['Backpacking', 'Mountaineering', 'Paddling'],
    conditions: ['Wet', 'Cold', 'Windy'],
    weight: 440,
    price: 69.99,
    rating: 4.8,
    reviews: 92,
    description: 'Drop-proof IP67 power bank with 20W USB-C fast charging and emergency flashlight.',
    specs: {
      'Battery Capacity': '20,000 mAh (74 Wh) Li-Polymer',
      'Water Resistance': 'IP67 Waterproof, Dustproof & Shockproof',
      'Output Ports': '20W USB-C PD + Dual 18W USB-A Fast Charge',
      'Integrated Features': 'Monocrystalline Solar Panel + 400lm LED Light Bar',
    },
    image: '/images/catalog/powerbank-solar-rugged-20000mah.webp',
  },
  {
    id: 'charger-foldable-solar-panel-28w',
    name: 'HelioTrack 28W Foldable Solar Charger',
    categories: ['Navigation'],
    activities: ['Backpacking', 'Paddling', 'Camping'],
    conditions: ['Hot', 'Mild', 'Dry'],
    weight: 610,
    price: 89.99,
    rating: 4.6,
    reviews: 45,
    description: '4-panel 24% high-efficiency solar array with dual USB ports for off-grid trekking.',
    specs: {
      'Peak Power': '28 Watts Monocrystalline SunPower Cells',
      'Solar Efficiency': '24% High-Conversion Solar Efficiency',
      'Output Ports': 'Dual Smart-IC USB-A Ports (5V/2.4A max)',
      'Enclosure': 'Weatherproof Oxford Fabric with 4 Copper Grommets',
    },
    image: '/images/catalog/charger-foldable-solar-panel-28w.webp',
  },
  {
    id: 'compass-sight-mirror-orienteering',
    name: 'GeoNorth Precision Sighting Mirror Compass',
    categories: ['Navigation'],
    activities: ['Mountaineering', 'Hiking', 'Backpacking'],
    conditions: ['Cold', 'Snowy', 'Icy'],
    weight: 85,
    price: 49.99,
    rating: 4.9,
    reviews: 78,
    description: 'Sighting compass with declination adjustment and clinometer for slope angle reading.',
    specs: {
      'Capsule Type': 'Liquid-Filled Dampened Jewel Needle',
      'Sighting Mirror': 'Protective Cover Mirror with V-Notch and Sight Hole',
      'Declination Adjustment': 'Tool-Free Precision Adjustable Declination Scale',
      'Clinometer': 'Pendulum Clinometer for Avalanche Slope Measurement',
    },
    image: '/images/catalog/compass-sight-mirror-orienteering.webp',
  },
  {
    id: 'gps-satellite-messenger-communicator',
    name: 'NorthStar Mini 2-Way Satellite Communicator',
    categories: ['Navigation', 'First Aid'],
    activities: ['Mountaineering', 'Backpacking', 'Paddling'],
    conditions: ['Sub-Zero', 'Cold', 'Wet'],
    weight: 100,
    price: 349.99,
    rating: 4.9,
    reviews: 110,
    description: '100g global Iridium satellite text messenger with interactive 24/7 SOS dispatch.',
    specs: {
      'Satellite Network': '100% Global Iridium Satellite Network (Pole-to-Pole)',
      'Emergency SOS': 'Interactive 24/7 SOS via Emergency Monitoring Center',
      'Messaging Features': 'Two-Way Texting & Live GPS Tracking (10-min intervals)',
      'Battery Life': 'Up to 14 Days at 10-min tracking (USB-C Rechargeable)',
    },
    image: '/images/catalog/gps-satellite-messenger-communicator.webp',
  },
  {
    id: 'case-waterproof-floating-phone-map',
    name: 'AquaGuard Touch-Through Waterproof Floating Case',
    categories: ['Dry Bags', 'Navigation'],
    activities: ['Paddling', 'Hiking'],
    conditions: ['Wet', 'Hot', 'Mild'],
    weight: 48,
    price: 19.99,
    rating: 4.6,
    reviews: 54,
    description: 'IPX8 certified submersible phone pouch with air cushion perimeter that floats.',
    specs: {
      'Waterproof Rating': 'IPX8 Certified Submersible to 30m (100 ft)',
      'Phone Fit': 'Universal Fit for Screen Sizes up to 6.8 inches',
      'Touch Sensitivity': 'High-Sensitivity Touch-Through Optical TPU Film',
      'Flotation': 'Dual Air-Cushion Perimeter Prevents Sinking',
    },
    image: '/images/catalog/case-waterproof-floating-phone-map.webp',
  },
];
