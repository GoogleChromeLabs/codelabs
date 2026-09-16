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
    /*
     * TODO: Register the 'category_filter' WebMCP tool on document.modelContext.
     *
     * Expected Implementation:
     * When WebMCP is supported (document.modelContext?.registerTool):
     * Register 'category_filter' allowing an AI agent or assistant to:
     * - Inspect available product categories with item counts and selected states.
     * - Toggle a category filter (e.g. "Tents", "Backpacks", "Sleeping Bags").
     *
     * Tool specification:
     * - name: 'category_filter'
     * - title: 'Filter by Category'
     * - description: Inspect available product categories or toggle a specific category filter.
     * - inputSchema: {
     *     type: 'object',
     *     properties: {
     *       category: { type: 'string', enum: PRODUCT_CATEGORIES, description: 'Category to filter by.' },
     *       selected: { type: 'boolean', description: 'Explicit selection state.' },
     *     },
     *   }
     * - execute: (input) => {
     *     if (input?.category) this.handleToggle(input.category, input.selected);
     *     return { categories: this.items.map(i => ({ category: i.id, label: i.label, count: i.count, selected: i.checked })) };
     *   }
     */
  }
}

customElements.define('category-facet', CategoryFacet);
