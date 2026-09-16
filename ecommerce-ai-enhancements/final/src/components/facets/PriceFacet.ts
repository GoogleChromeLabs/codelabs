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
import { PRICE_RANGES } from '../../utils/filter-helpers.ts';

export class PriceFacet extends BaseListFacet {
  public connectedCallback(): void {
    this.facetType = 'price';
    this.facetTitle = 'Price';
    super.connectedCallback();
    this.registerWebMCPTools();
  }

  private registerWebMCPTools(): void {
    if (!document.modelContext?.registerTool) return;

    try {
      document.modelContext.registerTool(
        {
          name: 'price_filter',
          title: 'Filter by Price Range',
          description:
            'Inspect available price tiers (\'<50\', \'50-100\', \'100-250\', \'>250\') with matching product counts and active states, or toggle a price filter on the catalog page. Use this tool when the user specifies a budget or price constraint.',
          inputSchema: {
            type: 'object',
            properties: {
              priceRange: {
                type: 'string',
                enum: PRICE_RANGES,
                description: 'Price range ID to filter by. Omit to view tiers without changing.',
              },
              selected: {
                type: 'boolean',
                description: 'Explicit selection state: true to select, false to deselect. If omitted, toggles.',
              },
            },
          },
          execute: (input: { priceRange?: string; selected?: boolean }) => {
            if (input?.priceRange) {
              this.handleToggle(input.priceRange, input.selected);
            }
            return {
              prices: this.items.map(i => ({
                priceRange: i.id,
                label: i.label,
                count: i.count,
                selected: i.checked,
              })),
            };
          },
        },
        { signal: this.signal }
      )?.catch(() => {});
    } catch {
      // Ignore if tool is already active
    }
  }
}

customElements.define('price-facet', PriceFacet);
