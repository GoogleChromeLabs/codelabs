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

import { ACTIVITIES, CONDITIONS, PRODUCT_CATEGORIES, CATALOG, type Product } from '../catalog/dataset.ts';
import type { FacetItemData } from '../components/facets/BaseListFacet.ts';
import type { FacetSidebarData } from '../components/facets/FacetSidebar.ts';

export interface FilterState {
  selectedCategories: Set<string>;
  selectedActivities: Set<string>;
  selectedConditions: Set<string>;
  selectedWeights: Set<string>;
  selectedPrices: Set<string>;
  selectedRatings: Set<number>;
  searchQuery: string;
}

export function createDefaultFilterState(): FilterState {
  return {
    selectedCategories: new Set(),
    selectedActivities: new Set(),
    selectedConditions: new Set(),
    selectedWeights: new Set(),
    selectedPrices: new Set(),
    selectedRatings: new Set(),
    searchQuery: '',
  };
}

export const WEIGHT_RANGES = ['<500', '500-1000', '1000-2000', '>2000'] as const;
export const PRICE_RANGES = ['<50', '50-100', '100-250', '>250'] as const;
export const RATING_TIERS = ['3.0', '4.0', '4.8'] as const;

export function matchWeight(weightGrams: number, rangeId: string): boolean {
  if (rangeId === '<500') return weightGrams < 500;
  if (rangeId === '500-1000') return weightGrams >= 500 && weightGrams <= 1000;
  if (rangeId === '1000-2000') return weightGrams > 1000 && weightGrams <= 2000;
  if (rangeId === '>2000') return weightGrams > 2000;
  return false;
}

export function matchPrice(priceCAD: number, rangeId: string): boolean {
  if (rangeId === '<50') return priceCAD < 50;
  if (rangeId === '50-100') return priceCAD >= 50 && priceCAD <= 100;
  if (rangeId === '100-250') return priceCAD > 100 && priceCAD <= 250;
  if (rangeId === '>250') return priceCAD > 250;
  return false;
}

export function testProductMatch(
  p: Product,
  state: FilterState,
  overrides?: { skipFacet?: string; testFacet?: string; testValue?: any }
): boolean {
  if (overrides?.testFacet === 'category') {
    if (!p.categories.includes(overrides.testValue)) return false;
  } else if (overrides?.skipFacet !== 'category' && state.selectedCategories.size > 0) {
    if (!p.categories.some(c => state.selectedCategories.has(c))) return false;
  }

  if (overrides?.testFacet === 'activity') {
    if (!p.activities.includes(overrides.testValue)) return false;
  } else if (overrides?.skipFacet !== 'activity' && state.selectedActivities.size > 0) {
    if (!p.activities.some(a => state.selectedActivities.has(a))) return false;
  }

  if (overrides?.testFacet === 'condition') {
    if (!p.conditions.includes(overrides.testValue)) return false;
  } else if (overrides?.skipFacet !== 'condition' && state.selectedConditions.size > 0) {
    if (!p.conditions.some(c => state.selectedConditions.has(c))) return false;
  }

  if (overrides?.testFacet === 'weight') {
    if (!matchWeight(p.weight, overrides.testValue)) return false;
  } else if (overrides?.skipFacet !== 'weight' && state.selectedWeights.size > 0) {
    if (!Array.from(state.selectedWeights).some(w => matchWeight(p.weight, w))) return false;
  }

  if (overrides?.testFacet === 'price') {
    if (!matchPrice(p.price, overrides.testValue)) return false;
  } else if (overrides?.skipFacet !== 'price' && state.selectedPrices.size > 0) {
    if (!Array.from(state.selectedPrices).some(pr => matchPrice(p.price, pr))) return false;
  }

  if (overrides?.testFacet === 'rating') {
    if (p.rating < overrides.testValue) return false;
  } else if (overrides?.skipFacet !== 'rating' && state.selectedRatings.size > 0) {
    if (!Array.from(state.selectedRatings).some(r => p.rating >= r)) return false;
  }

  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    const matchName = p.name.toLowerCase().includes(q);
    const matchDesc = p.description.toLowerCase().includes(q);
    if (!matchName && !matchDesc) return false;
  }

  return true;
}

export function buildSidebarData(
  state: FilterState,
  options?: { hideCategory?: boolean; hideActivity?: boolean }
): FacetSidebarData {
  const countFor = (facet: string, val: any) =>
    CATALOG.filter(p => testProductMatch(p, state, { skipFacet: facet, testFacet: facet, testValue: val })).length;

  const categories: FacetItemData[] = PRODUCT_CATEGORIES.map(c => ({
    id: c,
    label: c,
    count: countFor('category', c),
    checked: state.selectedCategories.has(c),
  }));

  const activities: FacetItemData[] = ACTIVITIES.map(a => ({
    id: a,
    label: a,
    count: countFor('activity', a),
    checked: state.selectedActivities.has(a),
  }));

  const conditions: FacetItemData[] = CONDITIONS.map(c => ({
    id: c,
    label: c,
    count: countFor('condition', c),
    checked: state.selectedConditions.has(c),
  }));

  const weights: FacetItemData[] = [
    { id: '<500', label: '< 500 g', count: countFor('weight', '<500'), checked: state.selectedWeights.has('<500') },
    { id: '500-1000', label: '500 g – 1 kg', count: countFor('weight', '500-1000'), checked: state.selectedWeights.has('500-1000') },
    { id: '1000-2000', label: '1 kg – 2 kg', count: countFor('weight', '1000-2000'), checked: state.selectedWeights.has('1000-2000') },
    { id: '>2000', label: '> 2 kg', count: countFor('weight', '>2000'), checked: state.selectedWeights.has('>2000') },
  ];

  const prices: FacetItemData[] = [
    { id: '<50', label: '< $50', count: countFor('price', '<50'), checked: state.selectedPrices.has('<50') },
    { id: '50-100', label: '$50 – $100', count: countFor('price', '50-100'), checked: state.selectedPrices.has('50-100') },
    { id: '100-250', label: '$100 – $250', count: countFor('price', '100-250'), checked: state.selectedPrices.has('100-250') },
    { id: '>250', label: '$250+', count: countFor('price', '>250'), checked: state.selectedPrices.has('>250') },
  ];

  const ratings: FacetItemData[] = [
    { id: '3.0', label: '3+ ★', count: countFor('rating', 3.0), checked: state.selectedRatings.has(3.0) },
    { id: '4.0', label: '4+ ★', count: countFor('rating', 4.0), checked: state.selectedRatings.has(4.0) },
    { id: '4.8', label: '5 ★', count: countFor('rating', 4.8), checked: state.selectedRatings.has(4.8) },
  ];

  return {
    searchQuery: state.searchQuery,
    hideCategory: options?.hideCategory,
    hideActivity: options?.hideActivity,
    categories,
    activities,
    conditions,
    weights,
    prices,
    ratings,
  };
}

export function populateFiltersFromUrl(queryString: string): FilterState {
  const state = createDefaultFilterState();
  const sp = new URLSearchParams(queryString);
  if (sp.get('keyword')) state.searchQuery = sp.get('keyword')!;
  if (sp.get('category')) {
    sp.get('category')!.split(',').forEach(c => {
      const m = PRODUCT_CATEGORIES.find(cat => cat.toLowerCase() === c.toLowerCase().trim());
      if (m) state.selectedCategories.add(m);
    });
  }
  if (sp.get('activity')) {
    sp.get('activity')!.split(',').forEach(a => {
      const m = ACTIVITIES.find(act => act.toLowerCase() === a.toLowerCase().trim());
      if (m) state.selectedActivities.add(m);
    });
  }
  if (sp.get('condition')) {
    sp.get('condition')!.split(',').forEach(c => {
      const m = CONDITIONS.find(cond => cond.toLowerCase() === c.toLowerCase().trim());
      if (m) state.selectedConditions.add(m);
    });
  }
  if (sp.get('weight')) sp.get('weight')!.split(',').forEach(w => state.selectedWeights.add(w.trim()));
  if (sp.get('price')) sp.get('price')!.split(',').forEach(p => state.selectedPrices.add(p.trim()));
  if (sp.get('rating')) {
    sp.get('rating')!.split(',').forEach(r => {
      const val = parseFloat(r.trim());
      if (!isNaN(val)) state.selectedRatings.add(val);
    });
  }
  return state;
}

export function syncFiltersToUrl(state: FilterState, routeCategory?: string | null, routeActivity?: string | null): void {
  const sp = new URLSearchParams();
  if (state.searchQuery) sp.set('keyword', state.searchQuery);
  if (!routeCategory && state.selectedCategories.size > 0) sp.set('category', Array.from(state.selectedCategories).join(','));
  if (!routeActivity && state.selectedActivities.size > 0) sp.set('activity', Array.from(state.selectedActivities).join(','));
  if (state.selectedConditions.size > 0) sp.set('condition', Array.from(state.selectedConditions).join(','));
  if (state.selectedWeights.size > 0) sp.set('weight', Array.from(state.selectedWeights).join(','));
  if (state.selectedPrices.size > 0) sp.set('price', Array.from(state.selectedPrices).join(','));
  if (state.selectedRatings.size > 0) sp.set('rating', Array.from(state.selectedRatings).join(','));

  const queryStr = sp.toString() ? '?' + sp.toString() : '';
  window.history.replaceState(null, '', window.location.pathname + queryStr);
}
