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

export class WeightFacet extends BaseListFacet {
  private toolAbortController: AbortController | null = null;

  public connectedCallback(): void {
    this.facetType = 'weight';
    this.facetTitle = 'Weight';
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
     * TODO: Register the 'weight_filter' WebMCP tool on document.modelContext.
     *
     * Expected Implementation:
     * When WebMCP is supported (document.modelContext?.registerTool):
     * Register 'weight_filter' allowing an AI agent or assistant to:
     * - Inspect available weight brackets ('<500', '500-1000', '1000-2000', '>2000') with product counts.
     * - Toggle a weight bracket filter.
     *
     * Tool specification:
     * - name: 'weight_filter'
     * - description: Inspect available weight brackets or toggle a weight bracket filter.
     * - inputSchema: {
     *     type: 'object',
     *     properties: {
     *       weightRange: { type: 'string', enum: WEIGHT_RANGES, description: 'Weight bracket ID (<500, 500-1000, 1000-2000, >2000).' },
     *       bracket: { type: 'string', enum: WEIGHT_RANGES, description: 'Alias for weightRange.' },
     *       selected: { type: 'boolean', description: 'Explicit selection state.' },
     *     },
     *   }
     * - execute: (input) => {
     *     const val = input?.weightRange || input?.bracket;
     *     if (val) this.handleToggle(val, input.selected);
     *     return { weights: this.items.map(i => ({ bracket: i.id, label: i.label, count: i.count, selected: i.checked })) };
     *   }
     */
  }
}

customElements.define('weight-facet', WeightFacet);
