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

import { CATALOG, ACTIVITIES, type Product } from '../catalog/dataset.ts';
import { translator } from '../ai/translator-helpers.ts';
import { formatNumber } from '../utils/formatters.ts';
import { ProductCard } from '../components/product/ProductCard.ts';

export class HomeView extends HTMLElement {
  private unsubscribeLang: (() => void) | null = null;
  private localizedStrings = {
    eyebrow: 'Handcrafted Backcountry Gear',
    title: 'Equipped for the North',
    subtitle: 'High-performance expedition gear built to withstand freezing alpine ridges, rugged portages, and unpredictable weather.',
    cta: 'Explore Catalog',
    shopByActivity: 'Shop by Activity',
    viewFullCatalog: 'View Full Catalog',
    essentials: 'Backcountry Essentials',
    browseFullCatalog: 'Browse Full Catalog',
    items: 'items',
    item: 'item',
  };
  private translatedActivities: Map<string, string> = new Map();

  public connectedCallback(): void {
    this.render();
    this.populateFeatured();
    this.unsubscribeLang = translator.subscribe(() => {
      this.localize();
    });
  }

  public disconnectedCallback(): void {
    this.unsubscribeLang?.();
  }

  private async localize(): Promise<void> {
    if (translator.language === 'en') {
      this.localizedStrings = {
        eyebrow: 'Handcrafted Backcountry Gear',
        title: 'Equipped for the North',
        subtitle: 'High-performance expedition gear built to withstand freezing alpine ridges, rugged portages, and unpredictable weather.',
        cta: 'Explore Catalog',
        shopByActivity: 'Shop by Activity',
        viewFullCatalog: 'View Full Catalog',
        essentials: 'Backcountry Essentials',
        browseFullCatalog: 'Browse Full Catalog',
        items: 'items',
        item: 'item',
      };
      this.translatedActivities.clear();
      this.render();
      this.populateFeatured();
      return;
    }

    const [eyebrow, title, subtitle, cta, shopByActivity, viewFullCatalog, essentials, browseFullCatalog, items, item] = await Promise.all([
      translator.t('Handcrafted Backcountry Gear'),
      translator.t('Equipped for the North'),
      translator.t('High-performance expedition gear built to withstand freezing alpine ridges, rugged portages, and unpredictable weather.'),
      translator.t('Explore Catalog'),
      translator.t('Shop by Activity'),
      translator.t('View Full Catalog'),
      translator.t('Backcountry Essentials'),
      translator.t('Browse Full Catalog'),
      translator.t('items'),
      translator.t('item'),
    ]);

    this.localizedStrings = { eyebrow, title, subtitle, cta, shopByActivity, viewFullCatalog, essentials, browseFullCatalog, items, item };

    await Promise.all(
      ACTIVITIES.map(async (act) => {
        const trans = await translator.t(act);
        this.translatedActivities.set(act, trans);
      })
    );

    this.render();
    this.populateFeatured();
  }

  private getFeaturedProducts(): Product[] {
    return CATALOG.filter(p => p.rating >= 4.8).slice(0, 8);
  }

  private populateFeatured(): void {
    const grid = this.querySelector('#home-featured-grid');
    if (!grid) return;
    const featured = this.getFeaturedProducts();

    grid.innerHTML = featured
      .map((_, i) => `<li class="product-flex-item"><product-card id="home-card-${i}"></product-card></li>`)
      .join('');

    featured.forEach((p, i) => {
      const card = grid.querySelector<ProductCard>(`#home-card-${i}`);
      card?.setProduct(p);
    });
  }

  private getActivityIcon(activity: string): string {
    const icons: Record<string, string> = {
      Backpacking: '🎒',
      Camping: '⛺',
      Hiking: '🥾',
      Mountaineering: '🏔️',
      Paddling: '🛶',
      'Trail Running': '🏃',
    };
    return icons[activity] || '🌲';
  }

  private render(): void {
    const activityCards = ACTIVITIES.map(act => ({
      name: this.translatedActivities.get(act) || act,
      slug: act.toLowerCase().replace(/\s+/g, '-'),
      icon: this.getActivityIcon(act),
      count: CATALOG.filter(p => p.activities.includes(act)).length,
    }));

    this.innerHTML = `
      <style>
        home-view { display: block; width: 100%; }
        .hero-section {
          background: linear-gradient(180deg, var(--surface-warm) 0%, var(--bg) 100%);
          border-bottom: 1px solid var(--border);
          padding: 64px var(--page-pad-inline) 56px;
          text-align: center;
        }
        .hero-container { max-width: 780px; margin: 0 auto; }
        .hero-eyebrow { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--terracotta); margin-bottom: 12px; }
        .hero-title { font-family: var(--font-serif); font-size: clamp(28px, 5vw, 44px); font-weight: 900; color: var(--forest-dark); margin-bottom: 16px; line-height: 1.15; text-wrap: balance; }
        .hero-subtitle { font-size: clamp(14px, 2vw, 16px); color: var(--text-muted); margin-bottom: 28px; line-height: 1.6; text-wrap: balance; }
        .hero-cta-btn {
          display: inline-flex; align-items: center; justify-content: center;
          background: var(--forest-primary); color: #fff; text-decoration: none;
          padding: 12px 28px; border-radius: 6px; font-weight: 700; font-size: 14px;
          transition: background 0.15s, transform 0.15s;
        }
        .hero-cta-btn:hover { background: var(--forest-light); transform: translateY(-1px); }

        .home-section { width: 100%; padding: 48px var(--page-pad-inline); box-sizing: border-box; }
        .section-head { margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 12px; display: flex; justify-content: space-between; align-items: baseline; }
        .section-title { font-family: var(--font-serif); font-size: 24px; font-weight: 900; color: var(--forest-primary); margin: 0; text-wrap: balance; }
        .section-link { font-size: 13px; font-weight: 700; color: var(--terracotta); text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
        .section-link:hover { text-decoration: underline; }

        .activity-flex-group {
          list-style: none; padding: 0; margin: 0;
          display: flex; flex-wrap: wrap; justify-content: center; gap: 16px;
        }
        .activity-flex-item { flex: 1 1 160px; min-width: 140px; max-width: 220px; display: flex; }
        .act-card-link { text-decoration: none; color: inherit; display: block; width: 100%; }
        .act-card {
          background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
          padding: 24px 16px; text-align: center; height: 100%; display: flex;
          flex-direction: column; align-items: center; justify-content: center; box-sizing: border-box;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        }
        .act-card:hover { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06); border-color: var(--forest-primary); }
        .act-icon { font-size: 32px; margin-bottom: 10px; }
        .act-name { font-family: var(--font-serif); font-size: 15px; font-weight: 700; color: var(--forest-dark); margin-bottom: 4px; text-wrap: balance; text-transform: capitalize; }
        .act-count { font-size: 12px; color: var(--text-muted); font-variant-numeric: tabular-nums; }

        .products-flex-group {
          list-style: none; padding: 0; margin: 0;
          display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;
        }
        .product-flex-item { flex: 1 1 240px; min-width: 220px; max-width: 300px; display: flex; }
        .product-flex-item product-card { width: 100%; }

        @media (max-width: 600px) {
          .activity-flex-item { flex: 1 1 calc(50% - 8px); min-width: 0; max-width: none; }
          .product-flex-item { flex: 1 1 calc(50% - 10px); min-width: 0; max-width: none; }
          .act-card { padding: 18px 10px; }
        }
      </style>

      <section class="hero-section">
        <div class="hero-container">
          <div class="hero-eyebrow">${this.localizedStrings.eyebrow}</div>
          <h1 class="hero-title">${this.localizedStrings.title}</h1>
          <p class="hero-subtitle">${this.localizedStrings.subtitle}</p>
          <a href="/catalog" class="hero-cta-btn">${this.localizedStrings.cta}</a>
        </div>
      </section>

      <section class="home-section">
        <div class="section-head">
          <h2 class="section-title">${this.localizedStrings.shopByActivity}</h2>
          <a href="/catalog" class="section-link">
            <span>${this.localizedStrings.viewFullCatalog}</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
        <ul class="activity-flex-group" role="list">
          ${activityCards
            .map(
              a => `
            <li class="activity-flex-item">
              <a href="/activity/${encodeURIComponent(a.slug)}" class="act-card-link">
                <div class="act-card">
                  <div class="act-icon">${a.icon}</div>
                  <div class="act-name">${a.name}</div>
                  <div class="act-count">${formatNumber(a.count)} ${a.count === 1 ? this.localizedStrings.item : this.localizedStrings.items}</div>
                </div>
              </a>
            </li>
          `
            )
            .join('')}
        </ul>
      </section>

      <section class="home-section">
        <div class="section-head">
          <h2 class="section-title">${this.localizedStrings.essentials}</h2>
          <a href="/catalog" class="section-link">
            <span>${this.localizedStrings.browseFullCatalog}</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
        <ul class="products-flex-group" id="home-featured-grid" role="list"></ul>
      </section>
    `;
  }
}

customElements.define('home-view', HomeView);
