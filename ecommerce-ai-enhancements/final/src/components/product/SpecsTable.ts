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
import { formatGrams } from '../../utils/formatters.ts';
import { translator } from '../../utils/translator-helpers.ts';

export class SpecsTable extends HTMLElement {
  private product: Product | null = null;
  private unsubscribeLang: (() => void) | null = null;
  private translatedSpecs: Map<string, string> = new Map();
  private localizedLabels = {
    weight: 'Weight',
    categories: 'Categories',
    activities: 'Target Activities',
    conditions: 'Environmental Conditions',
  };

  public setProduct(product: Product): void {
    this.product = product;
    this.localize();
  }

  public connectedCallback(): void {
    this.unsubscribeLang = translator.subscribe(() => {
      this.localize();
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
      this.translatedSpecs.clear();
      this.localizedLabels = {
        weight: 'Weight',
        categories: 'Categories',
        activities: 'Target Activities',
        conditions: 'Environmental Conditions',
      };
      this.render();
      return;
    }

    const [w, c, a, cond] = await Promise.all([
      translator.t('Weight'),
      translator.t('Categories'),
      translator.t('Target Activities'),
      translator.t('Environmental Conditions'),
    ]);

    this.localizedLabels = { weight: w, categories: c, activities: a, conditions: cond };

    const specEntries = Object.entries(this.product.specs);
    await Promise.all([
      ...specEntries.map(async ([key, val]) => {
        const [tk, tv] = await Promise.all([
          translator.t(key),
          translator.t(val),
        ]);
        this.translatedSpecs.set(key, `${tk}:::${tv}`);
      }),
      ...this.product.categories.map(async cat => {
        const tCat = await translator.t(cat);
        this.translatedSpecs.set(`cat::${cat}`, tCat);
      }),
      ...this.product.activities.map(async act => {
        const tAct = await translator.t(act);
        this.translatedSpecs.set(`act::${act}`, tAct);
      }),
      ...this.product.conditions.map(async condItem => {
        const tCond = await translator.t(condItem);
        this.translatedSpecs.set(`cond::${condItem}`, tCond);
      }),
    ]);

    this.render();
  }

  private render(): void {
    if (!this.product) {
      this.innerHTML = '';
      return;
    }

    const { specs, weight, categories, activities, conditions } = this.product;

    const specsRows = Object.entries(specs)
      .map(([key, value]) => {
        const trans = this.translatedSpecs.get(key);
        let displayKey = key;
        let displayVal = value;
        if (trans) {
          const parts = trans.split(':::');
          displayKey = parts[0] || key;
          displayVal = parts[1] || value;
        }
        return `
          <tr>
            <th scope="row">${displayKey}</th>
            <td>${displayVal}</td>
          </tr>
        `;
      })
      .join('');

    const displayCats = categories.map(c => this.translatedSpecs.get(`cat::${c}`) || c).join(', ');
    const displayActs = activities.map(a => this.translatedSpecs.get(`act::${a}`) || a).join(', ');
    const displayConds = conditions.map(c => this.translatedSpecs.get(`cond::${c}`) || c).join(', ');

    this.innerHTML = `
      <style>
        specs-table { display: block; }
        .pdp-specs { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
        .pdp-specs tr { border-bottom: 1px solid var(--border); }
        .pdp-specs th { text-align: start; padding: 8px 0; color: var(--text-muted); font-weight: 600; width: 40%; text-transform: capitalize; }
        .pdp-specs td { padding: 8px 0; color: var(--forest-dark); font-weight: 700; text-transform: capitalize; }
      </style>
      <table class="pdp-specs" aria-label="Technical Specifications">
        <caption class="sr-only">Technical Product Specifications</caption>
        <tbody>
          ${specsRows}
          <tr>
            <th scope="row">${this.localizedLabels.weight}</th>
            <td>${formatGrams(weight)}</td>
          </tr>
          <tr>
            <th scope="row">${this.localizedLabels.categories}</th>
            <td>${displayCats}</td>
          </tr>
          <tr>
            <th scope="row">${this.localizedLabels.activities}</th>
            <td>${displayActs}</td>
          </tr>
          <tr>
            <th scope="row">${this.localizedLabels.conditions}</th>
            <td>${displayConds}</td>
          </tr>
        </tbody>
      </table>
    `;
  }
}

customElements.define('specs-table', SpecsTable);

declare global {
  interface HTMLElementTagNameMap {
    'specs-table': SpecsTable;
  }
}
