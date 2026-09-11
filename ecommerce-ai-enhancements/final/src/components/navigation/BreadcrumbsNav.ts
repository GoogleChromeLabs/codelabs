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

import { translator } from '../../ai/translator.ts';

export class BreadcrumbsNav extends HTMLElement {
  private unsubscribeLang: (() => void) | null = null;
  private localizedHome: string = 'Home';
  private translatedCategory: string = '';
  private translatedProductName: string = '';

  public static get observedAttributes(): string[] {
    return ['category', 'product-name'];
  }

  public attributeChangedCallback(): void {
    this.localize();
  }

  public connectedCallback(): void {
    this.unsubscribeLang = translator.subscribe(() => {
      this.localize();
    });
    this.localize();
  }

  public disconnectedCallback(): void {
    this.unsubscribeLang?.();
  }

  private async localize(): Promise<void> {
    const category = this.getAttribute('category') || '';
    const productName = this.getAttribute('product-name') || '';

    if (translator.language === 'en') {
      this.localizedHome = 'Home';
      this.translatedCategory = category;
      this.translatedProductName = productName;
      this.render();
      return;
    }

    const [tHome, tCat, tProd] = await Promise.all([
      translator.t('Home'),
      category ? translator.t(category) : Promise.resolve(''),
      productName ? translator.t(productName) : Promise.resolve(''),
    ]);

    this.localizedHome = tHome;
    this.translatedCategory = tCat;
    this.translatedProductName = tProd;
    this.render();
  }

  private render(): void {
    const rawCategory = this.getAttribute('category') || '';
    const rawProductName = this.getAttribute('product-name') || '';
    const catSlug = encodeURIComponent(rawCategory.toLowerCase().replace(/\s+/g, '-'));
    const displayCategory = this.translatedCategory || rawCategory;
    const displayProduct = this.translatedProductName || rawProductName;

    this.innerHTML = `
      <style>
        breadcrumbs-nav { display: block; }
        .breadcrumbs { margin-bottom: 24px; }
        .breadcrumbs-list { list-style: none; padding: 0; margin: 0; display: flex; align-items: center; flex-wrap: wrap; font-size: 13px; color: var(--text-muted); font-weight: 600; }
        .breadcrumbs-item { display: inline-flex; align-items: center; }
        .breadcrumbs-item + .breadcrumbs-item::before { content: "/"; margin: 0 8px; color: var(--text-muted); font-weight: 400; }
        .breadcrumbs-link { color: var(--forest-primary); text-decoration: none; cursor: pointer; }
        .breadcrumbs-link:hover { text-decoration: underline; }
        .breadcrumbs-current { color: var(--text); font-weight: 700; }
      </style>
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <ol class="breadcrumbs-list" role="list">
          <li class="breadcrumbs-item">
            <a href="/catalog" class="breadcrumbs-link">${this.localizedHome}</a>
          </li>
          ${
            rawCategory
              ? `
            <li class="breadcrumbs-item">
              <a href="/category/${catSlug}" class="breadcrumbs-link">${displayCategory}</a>
            </li>
          `
              : ''
          }
          <li class="breadcrumbs-item">
            <span class="breadcrumbs-current" aria-current="page">${displayProduct}</span>
          </li>
        </ol>
      </nav>
    `;
  }
}

customElements.define('breadcrumbs-nav', BreadcrumbsNav);
