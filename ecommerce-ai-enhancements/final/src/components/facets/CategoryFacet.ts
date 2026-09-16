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

import { BaseListFacet } from './BaseListFacet.ts';
import { PRODUCT_CATEGORIES } from '../../catalog/dataset.ts';

export class CategoryFacet extends BaseListFacet {
  private toolAbortController: AbortController | null = null;

  public connectedCallback(): void {
    this.facetType = 'category';
    this.facetTitle = 'Category';
    super.connectedCallback();
    this.registerWebMCPTools();
  }

  public disconnectedCallback(): void {
    this.toolAbortController?.abort();
    this.toolAbortController = null;
    super.disconnectedCallback();
  }

  private registerWebMCPTools(): void {
    if (!document.modelContext?.registerTool) return;
    this.toolAbortController?.abort();
    this.toolAbortController = new AbortController();
    const signal = this.toolAbortController.signal;

    try {
      document.modelContext.registerTool(
        {
          name: 'category_filter',
          title: 'Filter by Category',
          description:
            'Inspect available product categories with their matching item counts and active selection states, or toggle a specific category filter on the catalog page. Use this tool when you need to see what categories are available or narrow down the catalog to gear categories like "tents", "backpacks", or "boots".',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                enum: PRODUCT_CATEGORIES,
                description: 'Category to filter by. Omit to view current categories and counts without changing.',
              },
              selected: {
                type: 'boolean',
                description: 'Explicit selection state: true to select, false to deselect. If omitted, toggles.',
              },
            },
          },
          execute: (input: { category?: string; selected?: boolean }) => {
            if (input?.category) {
              this.handleToggle(input.category, input.selected);
            }
            return {
              categories: this.items.map(i => ({
                category: i.id,
                label: i.label,
                count: i.count,
                selected: i.checked,
              })),
            };
          },
        },
        { signal }
      )?.catch(() => {});
    } catch {
      // Ignore if tool is already active
    }
  }
}

customElements.define('category-facet', CategoryFacet);
