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

import { ACTIVITIES, PRODUCT_CATEGORIES, CATALOG, type ActivityType } from '../../catalog/dataset.ts';
import { cartStore } from '../../state/cart-store.ts';
import { translator } from '../../ai/translator.ts';
import { formatNumber } from '../../utils/formatters.ts';
import { navigateTo } from '../../utils/router.ts';
import { prewarmSemanticFilterSession } from '../../ai/catalog-semantic-filter.ts';
import './LanguagePicker.ts';

export class SiteHeader extends HTMLElement {
  private unsubscribeCart: (() => void) | null = null;
  private unsubscribeLang: (() => void) | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private searchForm: HTMLFormElement | null = null;
  private toolAbortController: AbortController | null = null;
  private translatedActivities: Map<ActivityType, string> = new Map();
  private localizedStrings = {
    brandSub: 'Expedition Outfitter',
    searchPlaceholder: 'Search gear, clothing, tents...',
    cartLabel: 'Cart',
    activitiesTitle: 'Activities',
    catalogLabel: 'Catalog',
  };

  public connectedCallback(): void {
    this.render();
    this.unsubscribeCart = cartStore.subscribe(() => {
      const badge = this.querySelector('#cart-header-badge');
      if (badge) badge.textContent = formatNumber(cartStore.getTotalQuantity());
    });
    this.unsubscribeLang = translator.subscribe(() => this.localize());

    this.setupResizeObserver();
    this.registerWebMCPTools();
  }

  public disconnectedCallback(): void {
    this.toolAbortController?.abort();
    this.toolAbortController = null;
    this.unsubscribeCart?.();
    this.unsubscribeLang?.();
    this.resizeObserver?.disconnect();
  }

  private async localize(): Promise<void> {
    if (translator.language === 'en') {
      this.translatedActivities.clear();
      this.localizedStrings = {
        brandSub: 'Expedition Outfitter',
        searchPlaceholder: 'Search gear, clothing, tents...',
        cartLabel: 'Cart',
        activitiesTitle: 'Activities',
        catalogLabel: 'Catalog',
      };
      this.applyLocalization();
      return;
    }

    const [brandSub, searchPlaceholder, cartLabel, activitiesTitle, catalogLabel] = await Promise.all([
      translator.t('Expedition Outfitter'), translator.t('Search gear, clothing, tents...'),
      translator.t('Cart'), translator.t('Activities'), translator.t('Catalog'),
    ]);

    this.localizedStrings = { brandSub, searchPlaceholder, cartLabel, activitiesTitle, catalogLabel };

    await Promise.all(
      ACTIVITIES.map(async (act) => {
        this.translatedActivities.set(act, await translator.t(act));
      })
    );

    this.applyLocalization();
  }

  private applyLocalization(): void {
    const brandSub = this.querySelector('.brand-sub');
    if (brandSub) brandSub.textContent = this.localizedStrings.brandSub;

    const cartText = this.querySelector('#cart-trigger-label');
    if (cartText) cartText.textContent = this.localizedStrings.cartLabel;

    const mobileTitle = this.querySelector('#mobile-nav-title');
    if (mobileTitle) mobileTitle.textContent = this.localizedStrings.activitiesTitle;

    const searchInput = this.querySelector<HTMLInputElement>('#site-search-input');
    if (searchInput) searchInput.placeholder = this.localizedStrings.searchPlaceholder;

    const catalogLinks = this.querySelectorAll('.catalog-nav-text');
    catalogLinks.forEach(el => {
      el.textContent = this.localizedStrings.catalogLabel;
    });

    this.querySelectorAll<HTMLAnchorElement>('[data-activity]').forEach(link => {
      const act = link.getAttribute('data-activity') as ActivityType;
      const translated = this.translatedActivities.get(act) || act;
      const textSpan = link.querySelector('.nav-link-text') || link;
      textSpan.textContent = translated;
    });
  }

  private handleSearch(query: string): void {
    const trimmed = query.trim();
    navigateTo(trimmed ? `/catalog?q=${encodeURIComponent(trimmed)}` : '/catalog');
  }

  private registerWebMCPTools(): void {
    if (typeof document === 'undefined' || !document.modelContext?.registerTool) return;
    this.toolAbortController?.abort();
    this.toolAbortController = new AbortController();
    const signal = this.toolAbortController.signal;

    document.modelContext.registerTool({
      name: 'search',
      title: 'Search the Store',
      description: 'Search the catalog using natural language or keywords by navigating to `/catalog?q=<query>`. On the catalog page, this activates the on-device AI semantic filter using the shopper journey profile.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Natural language search query or keywords to find outdoor gear.' },
        },
        required: ['query'],
      },
      execute: (input: { query: string }) => {
        const q = String(input?.query || '').trim();
        this.handleSearch(q);
        return { success: true, navigatedTo: q ? `/catalog?q=${encodeURIComponent(q)}` : '/catalog' };
      },
    }, { signal });

    document.modelContext.registerTool({
      name: 'go_to_catalog',
      title: 'Open the Catalog',
      description: 'Navigate to the equipment catalog page, optionally pre-filtering by a specific activity or product category.',
      inputSchema: {
        type: 'object',
        properties: {
          activity: { type: 'string', enum: ACTIVITIES, description: 'Filter by outdoor activity' },
          category: { type: 'string', enum: PRODUCT_CATEGORIES, description: 'Filter by product category' },
        },
      },
      execute: (input: { activity?: string; category?: string }) => {
        let dest = '/catalog';
        if (input?.activity) dest = `/activity/${input.activity.toLowerCase().replace(/\s+/g, '-')}`;
        else if (input?.category) dest = `/catalog?category=${encodeURIComponent(input.category)}`;
        navigateTo(dest);
        return { success: true, navigatedTo: dest };
      },
    }, { signal });

    document.modelContext.registerTool({
      name: 'get_categories_and_activities',
      title: 'Browse Categories and Activities',
      description: 'Retrieve valid outdoor activities and product categories with pre-filtered catalog URLs.',
      inputSchema: { type: 'object', properties: {} },
      annotations: { readOnlyHint: true },
      execute: () => ({
        activities: ACTIVITIES.map(a => ({ name: a, url: `/activity/${a.toLowerCase().replace(/\s+/g, '-')}` })),
        categories: PRODUCT_CATEGORIES.map(c => ({ name: c, url: `/catalog?category=${c}` })),
      }),
    }, { signal });

    document.modelContext.registerTool({
      name: 'go_to_product',
      title: 'Open a Product Page',
      description: 'Navigate to the Product Details Page (PDP) for a specific product by its ID (e.g. "tent-mont-tremblant-3p").',
      inputSchema: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: 'Product ID to view (e.g. "tent-mont-tremblant-3p").' },
        },
        required: ['productId'],
      },
      execute: (input: { productId: string }) => {
        const pid = String(input?.productId || '').trim();
        if (!pid || !CATALOG.some(p => p.id === pid)) return { success: false, error: `Product "${pid}" not found.` };
        navigateTo(`/catalog/${encodeURIComponent(pid)}`);
        return { success: true, productId: pid, navigatedTo: `/catalog/${encodeURIComponent(pid)}` };
      },
    }, { signal });
  }

  private updateSearchSlot(isCompact: boolean): void {
    if (!this.searchForm) return;

    const headerSlot = this.querySelector<HTMLElement>('#header-search-slot');
    const dialogSlot = this.querySelector<HTMLElement>('#dialog-search-slot');
    const targetSlot = isCompact ? dialogSlot : headerSlot;

    if (targetSlot && this.searchForm.parentElement !== targetSlot) {
      if (!this.searchForm.parentElement) {
        targetSlot.appendChild(this.searchForm);
      } else {
        targetSlot.moveBefore(this.searchForm, null);
      }
    }
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const width = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
        if (width > 1220) {
          const dialog = this.querySelector<HTMLDialogElement>('#mobile-nav-dialog');
          if (dialog?.open) dialog.close();
        }
        this.updateSearchSlot(width <= 640);
      }
    });
    this.resizeObserver.observe(this);
  }

  private render(): void {
    this.innerHTML = `
      <header class="site-header" role="banner">
        <a href="/" class="brand">
          <div class="brand-emblem" aria-hidden="true">M</div>
          <div>
            <div class="brand-title">Mont-Royal Plein Air</div>
            <div class="brand-sub">${this.localizedStrings.brandSub}</div>
          </div>
        </a>

        <nav class="nav-links" aria-label="Main Navigation">
          <ul class="nav-list" role="list">
            ${ACTIVITIES.map(act => `<li class="nav-item"><a href="/activity/${encodeURIComponent(act.toLowerCase().replace(/\s+/g, '-'))}" class="nav-link" data-activity="${act}"><span class="nav-link-text">${this.translatedActivities.get(act) || act}</span></a></li>`).join('')}
          </ul>
        </nav>

        <div class="header-search-slot" id="header-search-slot"></div>

        <div class="header-actions">
          <language-picker></language-picker>

          <button class="cart-trigger-btn" type="button" commandfor="cart-dialog" command="show-modal" aria-label="View Shopping Cart">
            <span id="cart-trigger-label">${this.localizedStrings.cartLabel}</span>
            <span class="cart-badge" id="cart-header-badge">${cartStore.getTotalQuantity()}</span>
          </button>

          <button 
            type="button" 
            class="mobile-menu-btn" 
            id="mobile-menu-trigger" 
            commandfor="mobile-nav-dialog"
            command="show-modal"
            aria-label="Open activities navigation menu" 
          >
            ☰
          </button>
        </div>
      </header>

      <dialog class="mobile-nav-dialog" id="mobile-nav-dialog" closedby="any" aria-labelledby="mobile-nav-title">
        <div class="dialog-content">
          <div class="dialog-header">
            <h2 id="mobile-nav-title" class="dialog-title">${this.localizedStrings.activitiesTitle}</h2>
            <button type="button" class="dialog-close-btn" id="dialog-close-btn" commandfor="mobile-nav-dialog" command="close" aria-label="Close menu">✕</button>
          </div>

          <div class="dialog-search-slot" id="dialog-search-slot"></div>

          <nav class="dialog-nav" aria-label="Mobile Navigation">
            <ul class="dialog-nav-list" role="list">
              ${ACTIVITIES.map(act => `<li class="dialog-nav-item"><a href="/activity/${encodeURIComponent(act.toLowerCase().replace(/\s+/g, '-'))}" class="dialog-nav-link" data-activity="${act}"><span class="nav-link-text">${this.translatedActivities.get(act) || act}</span><span aria-hidden="true">→</span></a></li>`).join('')}
              <li class="dialog-nav-item" style="margin-top: 8px; border-top: 1px solid var(--border); padding-top: 8px;">
                <a href="/catalog" class="dialog-nav-link"><span class="catalog-nav-text">${this.localizedStrings.catalogLabel}</span><span aria-hidden="true">→</span></a>
              </li>
            </ul>
          </nav>
        </div>
      </dialog>
    `;

    // Create single unique search form
    const form = document.createElement('form');
    form.className = 'site-search-form';
    form.id = 'site-search-form';
    form.setAttribute('role', 'search');
    form.action = '/catalog';
    form.method = 'GET';
    form.innerHTML = `
      <label for="site-search-input" class="sr-only">Search catalog</label>
      <span class="search-icon" aria-hidden="true">🔍</span>
      <input 
        type="search" 
        id="site-search-input" 
        name="q" 
        placeholder="${this.localizedStrings.searchPlaceholder}" 
        class="search-input" 
        autocomplete="off" 
      />
    `;

    const input = form.querySelector<HTMLInputElement>('#site-search-input');
    input?.addEventListener('focus', () => {
      prewarmSemanticFilterSession();
    }, { once: true });

    form.addEventListener('submit', (e: Event) => {
      e.preventDefault();
      const dialog = this.querySelector<HTMLDialogElement>('#mobile-nav-dialog');
      if (dialog?.open) dialog.close();
      this.handleSearch(input?.value || '');
    });

    this.searchForm = form;

    const initialWidth = this.getBoundingClientRect().width || window.innerWidth;
    this.updateSearchSlot(initialWidth <= 640);

    const dialog = this.querySelector<HTMLDialogElement>('#mobile-nav-dialog');
    dialog?.querySelectorAll('.dialog-nav-link').forEach(link => {
      link.addEventListener('click', () => dialog.close());
    });
  }
}

customElements.define('site-header', SiteHeader);
