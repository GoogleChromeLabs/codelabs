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
import { formatNumber } from '../../utils/formatters.ts';

export interface FacetItemData {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  readonly checked: boolean;
}

export class BaseListFacet extends HTMLElement {
  protected facetTitle: string = '';
  protected facetType: string = '';
  protected items: readonly FacetItemData[] = [];
  protected unsubscribeLang: (() => void) | null = null;
  protected translatedTitle: string = '';
  protected translatedLabels: Map<string, string> = new Map();

  public configure(facetType: string, facetTitle: string): void {
    this.facetType = facetType;
    this.facetTitle = facetTitle;
    this.translatedTitle = facetTitle;
    if (this.items.length > 0) {
      this.localize();
    }
  }

  public setItems(items: readonly FacetItemData[]): void {
    this.items = items;
    this.localize();
  }

  public connectedCallback(): void {
    this.unsubscribeLang = translator.subscribe(() => {
      this.localize();
    });
    if (this.items.length > 0) {
      this.render();
    }
  }

  public disconnectedCallback(): void {
    this.unsubscribeLang?.();
    this.unsubscribeLang = null;
  }

  protected async localize(): Promise<void> {
    if (!this.facetTitle) return;

    if (translator.language === 'en') {
      this.translatedTitle = this.facetTitle;
      this.translatedLabels.clear();
      this.render();
      return;
    }

    this.translatedTitle = await translator.t(this.facetTitle);

    if (this.facetType === 'category' || this.facetType === 'activity') {
      await Promise.all(
        this.items.map(async (item) => {
          const trans = await translator.t(item.label);
          this.translatedLabels.set(item.id, trans);
        })
      );
    }

    this.render();
  }

  protected handleToggle(itemId: string, selected?: boolean): void {
    this.dispatchEvent(
      new CustomEvent('facet-toggle', {
        bubbles: true,
        composed: true,
        detail: {
          facetType: this.facetType,
          value: itemId,
          selected,
        },
      })
    );
  }

  protected render(): void {
    if (!this.facetTitle || this.items.length === 0) {
      this.innerHTML = '';
      return;
    }

    const title = this.translatedTitle || this.facetTitle;
    const safeTitleId = this.facetTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');

    this.innerHTML = `
      <style>
        base-list-facet,
        category-facet,
        activity-facet,
        weight-facet,
        price-facet,
        rating-facet {
          display: block;
        }
        .facet-section {
          margin-bottom: 22px;
        }
        .facet-title {
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          margin-bottom: 10px;
        }
        .facet-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .facet-list-item {
          margin: 0;
          padding: 0;
        }
        .facet-row {
          display: grid;
          grid-template-columns: 1fr 3ch;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text);
          cursor: pointer;
          user-select: none;
          padding: 2px 0;
          width: 100%;
          font-family: inherit;
        }
        .facet-row:hover {
          color: var(--forest-primary);
        }
        .facet-label-text {
          text-transform: capitalize;
        }
        .facet-row.disabled {
          opacity: 0.45;
          cursor: default;
          pointer-events: none;
        }
        .facet-check-group {
          grid-column: 1;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .facet-checkbox {
          width: 16px;
          height: 16px;
          accent-color: var(--forest-primary);
          cursor: pointer;
          margin: 0;
          border-radius: 4px;
        }
        .facet-checkbox:focus-visible {
          outline: 2px solid var(--forest-primary);
          outline-offset: 2px;
        }
        .facet-count {
          grid-column: 2;
          font-size: 11px;
          color: var(--text-muted);
          font-family: var(--font-mono);
          font-variant-numeric: tabular-nums;
          text-align: right;
        }
      </style>

      <fieldset class="facet-section" style="border:none; padding:0; margin:0 0 22px 0;">
        <legend class="facet-title" id="legend-${safeTitleId}">${title}</legend>
        <ul class="facet-list" aria-labelledby="legend-${safeTitleId}">
          ${this.items
            .map((item, idx) => {
              const inputId = `facet-${safeTitleId}-${idx}-${item.id.replace(/[^a-z0-9]/gi, '-')}`;
              const isDisabled = item.count === 0 && !item.checked;
              const displayLabel = this.translatedLabels.get(item.id) || item.label;
              return `
            <li class="facet-list-item">
              <label class="facet-row ${isDisabled ? 'disabled' : ''}" for="${inputId}">
                <span class="facet-check-group">
                  <input 
                    type="checkbox" 
                    id="${inputId}" 
                    name="${safeTitleId}" 
                    value="${item.id}"
                    class="facet-checkbox"
                    ${item.checked ? 'checked' : ''}
                    ${isDisabled ? 'disabled' : ''}
                  />
                  <span class="facet-label-text">${displayLabel}</span>
                </span>
                <span class="facet-count">${formatNumber(item.count)}</span>
              </label>
            </li>
          `;
            })
            .join('')}
        </ul>
      </fieldset>
    `;

    this.querySelectorAll<HTMLInputElement>('.facet-checkbox').forEach(input => {
      input.addEventListener('change', () => {
        const id = input.value;
        if (id) this.handleToggle(id);
      });
    });
  }
}

customElements.define('base-list-facet', BaseListFacet);
