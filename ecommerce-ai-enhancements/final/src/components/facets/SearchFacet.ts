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

import { translator } from '../../ai/translator-helpers.ts';

export class SearchFacet extends HTMLElement {
  private currentValue: string = '';
  private unsubscribeLang: (() => void) | null = null;
  private toolAbortController: AbortController | null = null;
  private localizedTitle: string = 'Keyword Filter';
  private localizedPlaceholder: string = 'Filter';

  public setValue(val: string): void {
    this.currentValue = val;
    const input = this.querySelector<HTMLInputElement>('.facet-search-input');
    if (input) input.value = val;
  }

  public getValue(): string {
    return this.currentValue;
  }

  public connectedCallback(): void {
    this.render();
    this.unsubscribeLang = translator.subscribe(() => {
      this.localize();
    });
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
      document.modelContext.registerTool(
        {
          name: 'keyword_filter',
          title: 'Filter by Keyword',
          description:
            'Inspect or set the keyword text query filtering items in the catalog sidebar (sets the ?keyword= query parameter). The filter performs an exact case-insensitive substring match against product titles and descriptions. Use concise single keywords or exact text fragments (e.g. "tent", "merino", "titanium", "down"). Do not use natural language phrases or questions that will fail substring matching.',
          inputSchema: {
            type: 'object',
            properties: {
              keyword: {
                type: 'string',
                description: 'Keyword string to filter catalog by. Omit to view current keyword without changing.',
              },
            },
          },
          execute: (input: { keyword?: string }) => {
            if (input?.keyword !== undefined) {
              this.setValue(input.keyword);
              this.dispatchEvent(
                new CustomEvent('search-filter-change', {
                  bubbles: true,
                  composed: true,
                  detail: { query: this.currentValue },
                })
              );
            }
            return { currentKeyword: this.getValue() };
          },
        },
        { signal }
      )?.catch(() => {});
    } catch {
      // Ignore if tool is already active
    }
  }

  private async localize(): Promise<void> {
    if (translator.language === 'en') {
      this.localizedTitle = 'Keyword Filter';
      this.localizedPlaceholder = 'Filter';
    } else {
      const [t, p] = await Promise.all([
        translator.t('Keyword Filter'),
        translator.t('Filter'),
      ]);
      this.localizedTitle = t;
      this.localizedPlaceholder = p;
    }

    const label = this.querySelector('.facet-search-title');
    if (label) label.textContent = this.localizedTitle;
    const input = this.querySelector<HTMLInputElement>('.facet-search-input');
    if (input) input.placeholder = this.localizedPlaceholder;
  }

  private handleInput = (e: Event): void => {
    const input = e.target as HTMLInputElement;
    this.currentValue = input.value;
    this.dispatchEvent(
      new CustomEvent('search-filter-change', {
        bubbles: true,
        composed: true,
        detail: { query: this.currentValue },
      })
    );
  };

  private render(): void {
    this.innerHTML = `
      <style>
        search-facet {
          display: block;
        }
        .facet-search-container {
          margin-bottom: 22px;
        }
        .facet-search-title {
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          margin-bottom: 10px;
          display: block;
        }
        .facet-search-input-wrap {
          position: relative;
        }
        .facet-search-input {
          width: 100%;
          background: var(--surface-warm);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 8px 12px 8px 30px;
          font-size: 13px;
          font-family: var(--font-sans);
          color: var(--text);
          outline: none;
          transition: border-color 0.15s, background-color 0.15s;
        }
        html[dir="rtl"] .facet-search-input { padding: 8px 30px 8px 12px; }
        .facet-search-input:focus {
          border-color: var(--forest-primary);
          background: #fff;
          outline: 2px solid rgba(27, 59, 43, 0.15);
        }
        .facet-search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 11px;
          color: var(--text-muted);
          pointer-events: none;
        }
        html[dir="rtl"] .facet-search-icon { left: auto; right: 10px; }
      </style>

      <div class="facet-search-container">
        <label for="sidebar-search-input" class="facet-search-title">${this.localizedTitle}</label>
        <div class="facet-search-input-wrap">
          <span class="facet-search-icon" aria-hidden="true">🔍</span>
          <input 
            type="search" 
            id="sidebar-search-input" 
            class="facet-search-input" 
            placeholder="${this.localizedPlaceholder}" 
            value="${this.currentValue}"
            autocomplete="off" 
          />
        </div>
      </div>
    `;

    const input = this.querySelector<HTMLInputElement>('.facet-search-input');
    input?.addEventListener('input', this.handleInput);
  }
}

customElements.define('search-facet', SearchFacet);
