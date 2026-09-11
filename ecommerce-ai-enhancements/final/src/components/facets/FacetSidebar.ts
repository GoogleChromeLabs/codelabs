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

import './SearchFacet.ts';
import './CategoryFacet.ts';
import './ActivityFacet.ts';
import './ConditionFacet.ts';
import './WeightFacet.ts';
import './PriceFacet.ts';
import './RatingFacet.ts';
import type { FacetItemData } from './BaseListFacet.ts';
import type { SearchFacet } from './SearchFacet.ts';
import type { CategoryFacet } from './CategoryFacet.ts';
import type { ActivityFacet } from './ActivityFacet.ts';
import type { ConditionFacet } from './ConditionFacet.ts';
import type { WeightFacet } from './WeightFacet.ts';
import type { PriceFacet } from './PriceFacet.ts';
import type { RatingFacet } from './RatingFacet.ts';
import { translator } from '../../ai/translator.ts';

export interface FacetSidebarData {
  searchQuery: string;
  hideCategory?: boolean;
  hideActivity?: boolean;
  categories: readonly FacetItemData[];
  activities: readonly FacetItemData[];
  conditions: readonly FacetItemData[];
  weights: readonly FacetItemData[];
  prices: readonly FacetItemData[];
  ratings: readonly FacetItemData[];
}

export class FacetSidebar extends HTMLElement {
  private data: FacetSidebarData | null = null;
  private unsubscribeLang: (() => void) | null = null;
  private isDisabled = false;
  private localizedStrings = {
    filters: 'Filters',
    resetAll: 'Reset All',
  };

  public setDisabled(disabled: boolean): void {
    this.isDisabled = disabled;
    const fs = this.querySelector<HTMLFieldSetElement>('#facet-filters-fieldset');
    if (fs) fs.disabled = disabled;
    this.querySelectorAll<HTMLInputElement | HTMLButtonElement>('input, button').forEach(el => {
      el.disabled = disabled;
    });
  }

  public setData(data: FacetSidebarData): void {
    this.data = data;
    if (!this.querySelector('#facet-filters-form')) {
      this.render();
    } else {
      this.updateFacets();
    }
  }

  public connectedCallback(): void {
    if (!this.innerHTML) this.render();
    this.unsubscribeLang = translator.subscribe(() => this.localize());
  }

  public disconnectedCallback(): void {
    this.unsubscribeLang?.();
    this.unsubscribeLang = null;
  }

  private async localize(): Promise<void> {
    if (translator.language === 'en') {
      this.localizedStrings = {
        filters: 'Filters',
        resetAll: 'Reset All',
      };
    } else {
      const [f, r] = await Promise.all([
        translator.t('Filters'),
        translator.t('Reset All'),
      ]);
      this.localizedStrings = { filters: f, resetAll: r };
    }

    const heading = this.querySelector('.facet-heading');
    if (heading) heading.textContent = this.localizedStrings.filters;
    const resetBtn = this.querySelector('#facet-reset-btn');
    if (resetBtn) resetBtn.textContent = this.localizedStrings.resetAll;
  }

  public resetAll(): void {
    this.dispatchEvent(
      new CustomEvent('filters-reset', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private updateFacets(): void {
    if (!this.data) return;

    const searchEl = this.querySelector<SearchFacet>('search-facet');
    if (searchEl) searchEl.setValue(this.data.searchQuery);

    const catEl = this.querySelector<CategoryFacet>('category-facet');
    if (catEl) {
      catEl.style.display = this.data.hideCategory ? 'none' : '';
      catEl.setItems(this.data.categories);
    }

    const actEl = this.querySelector<ActivityFacet>('activity-facet');
    if (actEl) {
      actEl.style.display = this.data.hideActivity ? 'none' : '';
      actEl.setItems(this.data.activities);
    }

    const condEl = this.querySelector<ConditionFacet>('condition-facet');
    if (condEl) condEl.setItems(this.data.conditions);

    const weightEl = this.querySelector<WeightFacet>('weight-facet');
    if (weightEl) weightEl.setItems(this.data.weights);

    const priceEl = this.querySelector<PriceFacet>('price-facet');
    if (priceEl) priceEl.setItems(this.data.prices);

    const ratingEl = this.querySelector<RatingFacet>('rating-facet');
    if (ratingEl) ratingEl.setItems(this.data.ratings);

    if (this.isDisabled) this.setDisabled(true);
  }

  private handleReset = (e: Event): void => {
    e.preventDefault();
    this.resetAll();
  };

  private render(): void {
    this.innerHTML = `
      <style>
        facet-sidebar {
          display: block;
          width: 100%;
        }
        .facet-sidebar {
          width: 100%;
          background: var(--surface);
          border-inline-end: 1px solid var(--border);
          padding: 24px 20px;
          padding-inline-start: var(--page-pad-inline);
          flex-shrink: 0;
          box-sizing: border-box;
        }
        .facet-form {
          margin: 0;
          padding: 0;
        }
        .facet-sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid var(--surface-warm);
        }
        .facet-heading {
          font-family: var(--font-serif);
          font-size: 15px;
          font-weight: 700;
          color: var(--forest-primary);
        }
        .reset-btn {
          font-size: 12px;
          color: var(--terracotta);
          background: none;
          border: none;
          font-weight: 700;
          cursor: pointer;
        }
        .reset-btn:hover {
          text-decoration: underline;
        }
      </style>

      <aside class="facet-sidebar" aria-label="Catalog Filters">
        <form class="facet-form" id="facet-filters-form" action="/catalog" method="GET">
          <fieldset id="facet-filters-fieldset" style="border:0; margin:0; padding:0; min-width:0;">
            <div class="facet-sidebar-header">
              <h2 class="facet-heading">${this.localizedStrings.filters}</h2>
              <button type="reset" class="reset-btn" id="facet-reset-btn">${this.localizedStrings.resetAll}</button>
            </div>

            <search-facet></search-facet>
            <category-facet></category-facet>
            <activity-facet></activity-facet>
            <condition-facet></condition-facet>
            <weight-facet></weight-facet>
            <price-facet></price-facet>
            <rating-facet></rating-facet>
          </fieldset>
        </form>
      </aside>
    `;

    const form = this.querySelector<HTMLFormElement>('#facet-filters-form');
    form?.addEventListener('reset', this.handleReset);
    form?.addEventListener('submit', (e: Event) => e.preventDefault());

    this.updateFacets();
  }
}

customElements.define('facet-sidebar', FacetSidebar);
