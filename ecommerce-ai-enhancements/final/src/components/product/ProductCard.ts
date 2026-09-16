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

import type { Product } from '../../catalog/dataset.ts';
import { cartStore } from '../../state/cart-store.ts';
import { formatCAD } from '../../utils/formatters.ts';
import { translator } from '../../ai/translator.ts';

export class ProductCard extends HTMLElement {
  private product: Product | null = null;
  private unsubscribeLang: (() => void) | null = null;
  private translatedName: string = '';
  private localizedBtn: string = '+ Cart';

  public setProduct(product: Product): void {
    this.product = product;
    this.dataset.productId = product.id;
    this.translatedName = product.name;
    this.localize();
  }

  public connectedCallback(): void {
    this.unsubscribeLang = translator.subscribe(() => {
      this.localize();
    });
    this.addEventListener('click', (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.quick-add-btn')) return;
      this.classList.add('transitioning');
    });
    if (this.product) {
      this.render();
    }
  }

  public disconnectedCallback(): void {
    this.unsubscribeLang?.();
  }

  private async localize(): Promise<void> {
    if (!this.product) return;

    if (translator.language === 'en') {
      this.translatedName = this.product.name;
      this.localizedBtn = '+ Cart';
      this.render();
      return;
    }

    const [tName, tBtn] = await Promise.all([
      translator.t(this.product.name),
      translator.t('+ Cart'),
    ]);

    this.translatedName = tName;
    this.localizedBtn = tBtn;
    this.render();
  }

  private handleQuickAdd = (e: MouseEvent): void => {
    e.preventDefault();
    if (!this.product) return;

    cartStore.addItem(this.product.id, 1);

    const drawer = document.querySelector('cart-drawer');
    drawer?.show();

    const btn = this.querySelector<HTMLButtonElement>('.quick-add-btn');
    if (btn) {
      btn.textContent = '✓ Added';
      setTimeout(() => {
        if (btn) btn.textContent = this.localizedBtn;
      }, 1500);
    }
  };

  private render(): void {
    if (!this.product) {
      this.innerHTML = '';
      return;
    }

    const p = this.product;
    const displayName = this.translatedName || p.name;

    this.innerHTML = `
      <style>
        product-card { display: block; }
        .product-card {
          background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
          overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s; height: 100%;
        }
        .product-card:hover { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08); border-color: var(--border-dark); }
        .card-main-link { text-decoration: none; color: inherit; display: flex; flex-direction: column; flex: 1; }
        .card-photo { height: 180px; background: var(--surface-warm); display: flex; align-items: center; justify-content: center; padding: 12px; }
        .card-img { max-width: 100%; max-height: 100%; object-fit: contain; mix-blend-mode: multiply; }
        .card-content { padding: 16px; flex: 1; display: flex; flex-direction: column; }
        .card-name { font-family: var(--font-serif); font-size: 15px; font-weight: 700; color: var(--forest-dark); margin-bottom: 6px; line-height: 1.3; }
        .card-main-link:hover .card-name { color: var(--forest-primary); text-decoration: underline; }
        .card-footer { display: flex; justify-content: space-between; align-items: center; padding: 0 16px 16px 16px; margin-top: auto; }
        .card-price { font-family: var(--font-serif); font-size: 16px; font-weight: 900; color: var(--forest-primary); font-variant-numeric: tabular-nums; }
        .quick-add-btn { background: var(--surface-warm); color: var(--forest-primary); border: 1px solid var(--border); padding: 6px 12px; font-size: 12px; font-weight: 700; border-radius: 4px; cursor: pointer; transition: all 0.15s; }
        .quick-add-btn:hover { background: var(--terracotta); color: #fff; border-color: var(--terracotta); }
      </style>

      <article class="product-card" data-product-id="${p.id}">
        <a href="/catalog/${p.id}" class="card-main-link" aria-label="${displayName}">
          <div class="card-photo">
            <img 
              src="${p.image}" 
              alt="${displayName}" 
              class="card-img" 
              width="200" 
              height="200" 
              loading="lazy" 
            />
          </div>
          <div class="card-content">
            <h2 class="card-name">${displayName}</h2>
          </div>
        </a>
        <div class="card-footer">
          <span class="card-price">${formatCAD(p.price)}</span>
          <button type="button" class="quick-add-btn" commandfor="cart-dialog" command="show-modal" aria-label="Add ${displayName} to cart">${this.localizedBtn}</button>
        </div>
      </article>
    `;

    const addBtn = this.querySelector<HTMLButtonElement>('.quick-add-btn');
    addBtn?.addEventListener('click', this.handleQuickAdd);
  }
}

customElements.define('product-card', ProductCard);

declare global {
  interface HTMLElementTagNameMap {
    'product-card': ProductCard;
  }
}
