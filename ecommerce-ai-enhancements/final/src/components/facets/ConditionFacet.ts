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

import type { FacetItemData } from './BaseListFacet.ts';
import { translator } from '../../ai/translator.ts';
import { formatNumber } from '../../utils/formatters.ts';
import { CONDITIONS } from '../../catalog/dataset.ts';

export class ConditionFacet extends HTMLElement {
  private items: readonly FacetItemData[] = [];
  private unsubscribeLang: (() => void) | null = null;
  private toolAbortController: AbortController | null = null;
  private localizedTitle: string = 'Conditions';
  private translatedLabels: Map<string, string> = new Map();

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
    this.registerWebMCPTools();
  }

  public disconnectedCallback(): void {
    this.toolAbortController?.abort();
    this.toolAbortController = null;
    this.unsubscribeLang?.();
    this.unsubscribeLang = null;
  }

  private registerWebMCPTools(): void {
    if (typeof document === 'undefined' || !document.modelContext?.registerTool) return;
    this.toolAbortController?.abort();
    this.toolAbortController = new AbortController();
    const signal = this.toolAbortController.signal;

    try {
      document.modelContext.registerTool({
        name: 'condition_filter',
        description: 'Inspect available environmental conditions with their matching product counts and active selection states, or toggle a condition filter on the catalog page. Use this tool to find gear certified for conditions like "Rain", "Snow", "Sub-Zero", "High Wind", "Extreme Cold", or "4-Season".',
        inputSchema: {
          type: 'object',
          properties: {
            condition: {
              type: 'string',
              enum: CONDITIONS,
              description: 'Condition to filter by. Omit to view current conditions and counts without changing.',
            },
            selected: {
              type: 'boolean',
              description: 'Explicit selection state: true to select, false to deselect. If omitted, toggles.',
            },
          },
        },
        execute: (input: { condition?: string; selected?: boolean }) => {
          if (input?.condition) {
            this.handleToggle(input.condition, input.selected);
          }
          return {
            conditions: this.items.map(i => ({
              condition: i.id,
              label: i.label,
              count: i.count,
              selected: i.checked,
            })),
          };
        },
      }, { signal })?.catch(() => {});
    } catch {
      // Ignore if tool is already active
    }
  }

  private async localize(): Promise<void> {
    if (translator.language === 'en') {
      this.localizedTitle = 'Conditions';
      this.translatedLabels.clear();
      this.render();
      return;
    }

    this.localizedTitle = await translator.t('Conditions');

    await Promise.all(
      this.items.map(async (item) => {
        const trans = await translator.t(item.label);
        this.translatedLabels.set(item.id, trans);
      })
    );

    this.render();
  }

  private handleToggle(condId: string, selected?: boolean): void {
    this.dispatchEvent(
      new CustomEvent('facet-toggle', {
        bubbles: true,
        composed: true,
        detail: {
          facetType: 'condition',
          value: condId,
          selected,
        },
      })
    );
  }

  private render(): void {
    if (this.items.length === 0) {
      this.innerHTML = '';
      return;
    }

    this.innerHTML = `
      <style>
        condition-facet {
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
        .cond-grid {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .cond-grid-item {
          margin: 0;
          padding: 0;
          display: inline-flex;
        }
        .cond-checkbox {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        .cond-chip {
          display: inline-grid;
          grid-template-columns: auto 2.2ch;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 8px;
          background: var(--surface-warm);
          border: 1px solid var(--border);
          border-radius: 4px;
          color: var(--text);
          cursor: pointer;
          transition: background-color 0.15s, border-color 0.15s, color 0.15s;
          user-select: none;
          box-sizing: border-box;
        }
        .cond-chip:hover {
          border-color: var(--forest-primary);
          color: var(--forest-primary);
        }
        .cond-chip.active,
        .cond-chip:has(.cond-checkbox:checked) {
          background: var(--forest-primary);
          color: #fff;
          border-color: var(--forest-primary);
        }
        .cond-chip:has(.cond-checkbox:focus-visible) {
          outline: 2px solid var(--forest-primary);
          outline-offset: 2px;
        }
        .cond-chip.disabled,
        .cond-chip:has(.cond-checkbox:disabled) {
          opacity: 0.45;
          cursor: default;
          pointer-events: none;
        }
        .cond-label {
          grid-column: 1;
          white-space: nowrap;
          text-transform: capitalize;
        }
        .cond-count {
          grid-column: 2;
          font-size: 10px;
          font-family: var(--font-mono);
          font-variant-numeric: tabular-nums;
          opacity: 0.85;
          text-align: right;
        }
      </style>

      <fieldset class="facet-section" style="border:none; padding:0; margin:0 0 22px 0;">
        <legend class="facet-title" id="legend-conditions">${this.localizedTitle}</legend>
        <ul class="cond-grid" aria-labelledby="legend-conditions">
          ${this.items
            .map((item, idx) => {
              const inputId = `cond-check-${idx}-${item.id.replace(/[^a-z0-9]/gi, '-')}`;
              const isDisabled = item.count === 0 && !item.checked;
              const displayLabel = this.translatedLabels.get(item.id) || item.label;
              return `
            <li class="cond-grid-item">
              <label 
                class="cond-chip ${item.checked ? 'active' : ''} ${isDisabled ? 'disabled' : ''}" 
                for="${inputId}"
              >
                <input 
                  type="checkbox" 
                  id="${inputId}" 
                  name="condition" 
                  value="${item.id}"
                  class="cond-checkbox"
                  ${item.checked ? 'checked' : ''}
                  ${isDisabled ? 'disabled' : ''}
                />
                <span class="cond-label">${displayLabel}</span>
                <span class="cond-count">${formatNumber(item.count)}</span>
              </label>
            </li>
          `;
            })
            .join('')}
        </ul>
      </fieldset>
    `;

    this.querySelectorAll<HTMLInputElement>('.cond-checkbox').forEach(input => {
      input.addEventListener('change', () => {
        const id = input.value;
        if (id) this.handleToggle(id);
      });
    });
  }
}

customElements.define('condition-facet', ConditionFacet);
