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

import { CATALOG, PRODUCT_CATEGORIES, ACTIVITIES, type Product } from '../catalog/dataset.ts';
import {
  type FilterState,
  createDefaultFilterState,
  populateFiltersFromUrl,
  syncFiltersToUrl,
  testProductMatch,
  buildSidebarData,
} from '../utils/filter-helpers.ts';
import { FacetSidebar } from '../components/facets/FacetSidebar.ts';
import { historyStore } from '../state/history-store.ts';
import { translator } from '../utils/translator-helpers.ts';
import { formatNumber } from '../utils/formatters.ts';
import { registerCatalogSemanticFilterTool, interpretAndApplySemanticFilter, prewarmSemanticFilterSession } from '../ai/catalog-semantic-filter.ts';
import { ProductCard } from '../components/product/ProductCard.ts';

export class CatalogView extends HTMLElement {
  private filterState: FilterState = createDefaultFilterState();
  private mode: 'catalog' | 'activity' | 'category' = 'catalog';
  private modeValue: string = '';
  private sidebarElement: FacetSidebar = document.createElement('facet-sidebar') as FacetSidebar;
  private resizeObserver: ResizeObserver | null = null;
  private unsubscribeLang: (() => void) | null = null;
  private toolAbortController: AbortController | null = null;
  private lastSemanticQuery: string | null = null;
  private isSemanticSearching: boolean = false;
  private activeSemanticQuery: string = '';
  private localizedStrings = {
    catalog: 'Catalog', gear: 'Gear', showing: 'Showing', items: 'items', item: 'item',
    filters: 'Filters', resetAll: 'Reset All', showResults: 'Show Results',
    noResults: 'No matching gear found', noResultsSub: 'Try clearing some filters or searching for different criteria.',
  };

  public static get observedAttributes(): string[] {
    return ['mode', 'mode-value'];
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue) {
      if (name === 'mode') {
        this.mode = newValue === 'activity' || newValue === 'category' ? newValue : 'catalog';
      }
      if (name === 'mode-value') this.modeValue = newValue || '';
      this.initFromUrl();
      this.updateView();
      this.maybeRunSemanticSearch();
    }
  }

  public setRoute(params: { category?: string; activity?: string; query?: string; searchParams?: URLSearchParams }): void {
    this.mode = params.activity ? 'activity' : params.category ? 'category' : 'catalog';
    this.modeValue = params.activity || params.category || '';
    this.initFromUrl();
    this.updateView();
    this.maybeRunSemanticSearch();
  }

  public connectedCallback(): void {
    this.initFromUrl();
    this.render();
    this.relocateSidebar(window.innerWidth <= 900);
    this.setupListeners();
    this.setupResizeObserver();
    this.unsubscribeLang = translator.subscribe(() => this.localize());
    this.updateView();
    this.registerWebMCPTools();
    this.maybeRunSemanticSearch();
    prewarmSemanticFilterSession();
  }

  public disconnectedCallback(): void {
    this.toolAbortController?.abort();
    this.resizeObserver?.disconnect();
    this.unsubscribeLang?.();
  }

  private registerWebMCPTools(): void {
    if (typeof document === 'undefined' || !document.modelContext?.registerTool) return;
    this.toolAbortController?.abort();
    this.toolAbortController = new AbortController();
    const signal = this.toolAbortController.signal;

    document.modelContext.registerTool({
      name: 'list_items',
      title: 'List Matching Products',
      description: 'Retrieve catalog items matching currently active filters and keywords.',
      inputSchema: { type: 'object', properties: {} },
      annotations: { readOnlyHint: true },
      execute: () => {
        const filtered = this.getFilteredProducts();
        return {
          totalCount: filtered.length,
          products: filtered.map(p => ({
            id: p.id, name: p.name, price: p.price, rating: p.rating,
            reviews: p.reviews, activities: p.activities, categories: p.categories,
            conditions: p.conditions, weight: p.weight,
          })),
        };
      },
    }, { signal });

    document.modelContext.registerTool({
      name: 'reset_filters',
      title: 'Reset All Filters',
      description: 'Clear all active catalog filters, categories, activities, conditions, brackets, and keywords.',
      inputSchema: { type: 'object', properties: {} },
      execute: () => {
        this.filterState = createDefaultFilterState();
        this.syncUrlAndRefresh();
        return { success: true, message: 'All filters reset.' };
      },
    }, { signal });

    registerCatalogSemanticFilterTool(signal);
  }

  private async localize(): Promise<void> {
    if (translator.language === 'en') return;

    const [catalog, gear, showing, items, item, filters, resetAll, showResults, noResults, noResultsSub] = await Promise.all([
      translator.t('Catalog'), translator.t('Gear'), translator.t('Showing'), translator.t('items'), translator.t('item'),
      translator.t('Filters'), translator.t('Reset All'), translator.t('Show Results'), translator.t('No matching gear found'),
      translator.t('Try clearing some filters or searching for different criteria.'),
    ]);
    this.localizedStrings = { catalog, gear, showing, items, item, filters, resetAll, showResults, noResults, noResultsSub };
    this.updateView();
  }

  private initFromUrl(): void {
    this.filterState = populateFiltersFromUrl(window.location.search);
    const sp = new URLSearchParams(window.location.search);
    const q = sp.get('q');
    if (q && q.trim()) {
      this.isSemanticSearching = true;
      this.activeSemanticQuery = q.trim();
    } else {
      this.isSemanticSearching = false;
      this.activeSemanticQuery = '';
    }
    if (this.mode === 'activity' && this.modeValue) {
      const match = ACTIVITIES.find(a => a.toLowerCase().replace(/\s+/g, '-') === this.modeValue.toLowerCase());
      if (match) { this.filterState.selectedActivities = new Set([match]); historyStore.recordActivity(match); }
    } else if (this.mode === 'category' && this.modeValue) {
      const match = PRODUCT_CATEGORIES.find(c => c.toLowerCase().replace(/\s+/g, '-') === this.modeValue.toLowerCase());
      if (match) this.filterState.selectedCategories = new Set([match]);
    } else if (this.filterState.selectedActivities.size > 0) {
      const firstAct = ACTIVITIES.find(a => a === Array.from(this.filterState.selectedActivities)[0]);
      if (firstAct) historyStore.recordActivity(firstAct);
    }
  }

  private maybeRunSemanticSearch(): void {
    if (!this.isSemanticSearching || !this.activeSemanticQuery) return;
    const query = this.activeSemanticQuery;
    if (query === this.lastSemanticQuery) return;
    this.lastSemanticQuery = query;
    this.filterState = createDefaultFilterState();
    this.updateView();

    (async () => {
      try {
        await interpretAndApplySemanticFilter(query);
      } catch {
        // Leaves the default filter state in place.
      } finally {
        this.isSemanticSearching = false;
        this.activeSemanticQuery = '';
        this.updateView();
      }
    })();
  }

  private relocateSidebar(isCompact: boolean): void {
    if (!isCompact) this.querySelector<HTMLDialogElement>('#catalog-filter-dialog')?.close();
    const targetParent = isCompact ? this.querySelector<HTMLElement>('#dialog-facet-slot') : this.querySelector<HTMLElement>('#desktop-facet-slot');
    if (!targetParent || this.sidebarElement.parentElement === targetParent) return;
    if (!this.sidebarElement.parentElement) targetParent.appendChild(this.sidebarElement);
    else targetParent.moveBefore(this.sidebarElement, null);
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const width = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
        this.relocateSidebar(width <= 900);
      }
    });
    this.resizeObserver.observe(this);
  }

  private setupListeners(): void {
    this.addEventListener('facet-toggle', e =>
      this.toggleFacet(e.detail.facetType, e.detail.value, e.detail.selected)
    );
    this.addEventListener('search-filter-change', e => {
      this.filterState.searchQuery = e.detail.query;
      this.syncUrlAndRefresh();
    });
    this.addEventListener('filters-reset', () => {
      this.filterState = createDefaultFilterState();
      this.syncUrlAndRefresh();
    });
    window.addEventListener('popstate', () => {
      this.initFromUrl();
      this.updateView();
    });
    this.querySelector('#filter-drawer-reset-btn')?.addEventListener('click', () => this.sidebarElement.resetAll());
  }

  private toggleFacet(type: string, value: string, selected?: boolean): void {
    const toggleSet = <T>(set: Set<T>, v: T): void => {
      if (selected === true) set.add(v);
      else if (selected === false) set.delete(v);
      else if (set.has(v)) set.delete(v);
      else set.add(v);
    };

    const fs = this.filterState;
    if (type === 'rating') {
      toggleSet(fs.selectedRatings, parseFloat(value));
    } else {
      const stringSetMap: Record<string, Set<string> | undefined> = {
        category: fs.selectedCategories,
        activity: fs.selectedActivities,
        condition: fs.selectedConditions,
        weight: fs.selectedWeights,
        price: fs.selectedPrices,
      };
      const s = stringSetMap[type];
      if (s) toggleSet(s, value);
    }
    this.syncUrlAndRefresh();
  }

  private syncUrlAndRefresh(): void {
    syncFiltersToUrl(this.filterState);
    if (!this.isSemanticSearching) this.updateView();
  }

  public getFilteredProducts(): Product[] {
    return CATALOG.filter(p => testProductMatch(p, this.filterState));
  }

  private getTitle(): string {
    if (this.mode === 'activity' && this.modeValue) {
      const m = ACTIVITIES.find(a => a.toLowerCase().replace(/\s+/g, '-') === this.modeValue.toLowerCase());
      return m ? `${m} ${this.localizedStrings.gear}` : this.localizedStrings.gear;
    }
    if (this.mode === 'category' && this.modeValue) {
      const m = PRODUCT_CATEGORIES.find(c => c.toLowerCase().replace(/\s+/g, '-') === this.modeValue.toLowerCase());
      return m || this.localizedStrings.catalog;
    }
    return this.localizedStrings.catalog;
  }

  private getActiveFilterCount(): number {
    const fs = this.filterState;
    return fs.selectedCategories.size + fs.selectedActivities.size + fs.selectedConditions.size +
      fs.selectedWeights.size + fs.selectedPrices.size + fs.selectedRatings.size + (fs.searchQuery ? 1 : 0);
  }

  private updateView(): void {
    const mobBtn = this.querySelector<HTMLButtonElement>('#mobile-filter-open-btn');
    const grid = this.querySelector('#catalog-product-grid');
    const products = this.getFilteredProducts();

    this.sidebarElement.setData(buildSidebarData(this.filterState, { hideCategory: this.mode === 'category', hideActivity: this.mode === 'activity' }));
    this.sidebarElement.setDisabled(this.isSemanticSearching);
    if (mobBtn) mobBtn.disabled = this.isSemanticSearching;

    const titleEl = this.querySelector('#catalog-heading');
    if (titleEl) titleEl.textContent = this.getTitle();

    if (this.isSemanticSearching) {
      const countEl = this.querySelector('#catalog-count-label');
      if (countEl) countEl.textContent = '';
      if (grid) {
        grid.innerHTML = `<li class="catalog-searching-indicator" style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 72px 20px; text-align: center; list-style: none;"><div class="search-spinner" aria-hidden="true"></div><p style="font-size: 18px; font-weight: 800; color: var(--forest-primary); margin-top: 18px; margin-bottom: 0;">Searching Catalog...</p></li>`;
      }
      return;
    }

    const countEl = this.querySelector('#catalog-count-label');
    if (countEl) countEl.textContent = `${this.localizedStrings.showing} ${formatNumber(products.length)} ${products.length === 1 ? this.localizedStrings.item : this.localizedStrings.items}`;

    const activeCount = this.getActiveFilterCount();
    const badge = this.querySelector('#mobile-filter-badge');
    if (badge) badge.textContent = activeCount > 0 ? `(${formatNumber(activeCount)})` : '';

    const applyBtn = this.querySelector('#filter-apply-btn');
    if (applyBtn) applyBtn.textContent = `${this.localizedStrings.showResults} (${formatNumber(products.length)})`;

    if (!grid) return;
    if (products.length === 0) {
      grid.innerHTML = `<li class="no-results" style="grid-column: 1 / -1; padding: 48px 20px; text-align: center; color: var(--text-muted); list-style: none;"><p style="font-size: 16px; font-weight: 700; color: var(--forest-dark); margin-bottom: 8px;">${this.localizedStrings.noResults}</p><p>${this.localizedStrings.noResultsSub}</p></li>`;
    } else {
      grid.innerHTML = products.map((_, i) => `<li class="product-grid-item"><product-card id="cat-card-${i}"></product-card></li>`).join('');
      products.forEach((p, i) => grid.querySelector<ProductCard>(`#cat-card-${i}`)?.setProduct(p));
    }
  }

  private render(): void {
    this.innerHTML = `
      <div class="catalog-layout">
        <aside class="desktop-facet-aside" id="desktop-facet-slot" aria-label="Desktop Catalog Filters"></aside>

        <main class="search-viewport" id="main-content">
          <div class="search-top">
            <div class="search-heading-group">
              <h1 id="catalog-heading" class="search-results-title">${this.localizedStrings.catalog}</h1>
              <span id="catalog-count-label" class="search-item-count">${this.localizedStrings.showing} 0 ${this.localizedStrings.items}</span>
            </div>

            <button type="button" class="mobile-filter-btn" id="mobile-filter-open-btn" commandfor="catalog-filter-dialog" command="show-modal" aria-label="Open catalog filters drawer">
              <span>${this.localizedStrings.filters}</span>
              <span class="filter-count-badge" id="mobile-filter-badge"></span>
            </button>
          </div>

          <ul class="search-product-grid" id="catalog-product-grid" role="list"></ul>
        </main>
      </div>

      <dialog class="filter-drawer-dialog" id="catalog-filter-dialog" closedby="any" aria-labelledby="filter-dialog-title">
        <div class="filter-drawer-container">
          <header class="filter-drawer-header">
            <div class="filter-drawer-title-group">
              <h2 id="filter-dialog-title" class="filter-drawer-title">${this.localizedStrings.filters}</h2>
              <button type="button" class="filter-reset-action" id="filter-drawer-reset-btn">${this.localizedStrings.resetAll}</button>
            </div>
            <button type="button" class="filter-drawer-close" id="filter-dialog-close-btn" commandfor="catalog-filter-dialog" command="close" aria-label="Close filters">✕</button>
          </header>
          <div class="filter-drawer-body" id="dialog-facet-slot"></div>
          <footer class="filter-drawer-footer">
            <button type="button" class="filter-apply-btn" id="filter-apply-btn" commandfor="catalog-filter-dialog" command="close">${this.localizedStrings.showResults}</button>
          </footer>
        </div>
      </dialog>
    `;

    const initialWidth = this.getBoundingClientRect().width || window.innerWidth;
    this.relocateSidebar(initialWidth <= 900);
  }
}

customElements.define('catalog-view', CatalogView);

declare global {
  interface HTMLElementTagNameMap {
    'catalog-view': CatalogView;
  }

  interface HTMLElementEventMap {
    'facet-toggle': CustomEvent<{ facetType: string; value: string; selected?: boolean }>;
    'search-filter-change': CustomEvent<{ query: string }>;
  }
}
