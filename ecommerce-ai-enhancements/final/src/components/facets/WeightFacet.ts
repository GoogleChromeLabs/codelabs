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
import { weightFilterSchema } from '../../utils/filter-schemas.ts';

export class WeightFacet extends BaseListFacet {
  public connectedCallback(): void {
    this.facetType = 'weight';
    this.facetTitle = 'Weight';
    super.connectedCallback();
    this.registerWebMCPTools();
  }

  public filterWeight(weightRange?: string, selected?: boolean) {
    if (weightRange) {
      this.handleToggle(weightRange, selected);
    }
    return {
      weights: this.items.map(i => ({
        bracket: i.id,
        label: i.label,
        count: i.count,
        selected: i.checked,
      })),
    };
  }

  private registerWebMCPTools(): void {
    if (!document.modelContext?.registerTool) return;

    try {
      // 3.1.5 Register the 'weight_filter' tool
      document.modelContext.registerTool(
        {
          name: 'weight_filter',
          title: 'Filter by Weight Range',
          description:
            'Inspect available weight brackets (\'<500\', \'500-1000\', \'1000-2000\', \'>2000\') with matching item counts and active states, or toggle a weight bracket filter on the catalog page. Use this tool when the user asks for ultralight gear or wants items within specific weight limits.',
          inputSchema: weightFilterSchema,
          execute: (input: { weightRange?: string; bracket?: string; selected?: boolean }) =>
            this.filterWeight(input?.weightRange || input?.bracket, input?.selected),
        },
        { signal: this.signal }
      )?.catch(() => {});
    } catch {
      // Ignore if tool is already active
    }
  }
}

customElements.define('weight-facet', WeightFacet);
