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
import { WEIGHT_RANGES } from '../../utils/filter-helpers.ts';

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
    if (typeof document === 'undefined' || !document.modelContext?.registerTool) return;
    this.toolAbortController?.abort();
    this.toolAbortController = new AbortController();
    const signal = this.toolAbortController.signal;

    try {
      document.modelContext.registerTool(
        {
          name: 'weight_filter',
          description:
            'Inspect available weight brackets (\'<500\', \'500-1000\', \'1000-2000\', \'>2000\') with matching item counts and active states, or toggle a weight bracket filter on the catalog page. Use this tool when the user asks for ultralight gear or wants items within specific weight limits.',
          inputSchema: {
            type: 'object',
            properties: {
              weightRange: {
                type: 'string',
                enum: WEIGHT_RANGES,
                description: 'Weight bracket ID to filter by (<500, 500-1000, 1000-2000, >2000). Omit to view brackets without changing.',
              },
              bracket: {
                type: 'string',
                enum: WEIGHT_RANGES,
                description: 'Alias for weightRange.',
              },
              selected: {
                type: 'boolean',
                description: 'Explicit selection state: true to select, false to deselect. If omitted, toggles.',
              },
            },
          },
          execute: (input: { weightRange?: string; bracket?: string; selected?: boolean }) => {
            const val = input?.weightRange || input?.bracket;
            if (val) {
              this.handleToggle(val, input.selected);
            }
            return {
              weights: this.items.map(i => ({
                bracket: i.id,
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

customElements.define('weight-facet', WeightFacet);
