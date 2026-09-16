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
import { ratingFilterSchema } from '../../utils/filter-schemas.ts';

export class RatingFacet extends BaseListFacet {
  public connectedCallback(): void {
    this.facetType = 'rating';
    this.facetTitle = 'Rating';
    super.connectedCallback();
    this.registerWebMCPTools();
  }

  public filterRating(minRating?: string, selected?: boolean) {
    if (minRating) {
      this.handleToggle(minRating, selected);
    }
    return {
      ratings: this.items.map(i => ({
        minRating: i.id,
        label: i.label,
        count: i.count,
        selected: i.checked,
      })),
    };
  }

  private registerWebMCPTools(): void {
    if (!document.modelContext?.registerTool) return;

    try {
      // 3.1.6 Register the 'rating_filter' tool
      document.modelContext.registerTool(
        {
          name: 'rating_filter',
          title: 'Filter by Customer Rating',
          description:
            'Inspect available customer rating thresholds (\'3.0\', \'4.0\', \'4.8\') with matching product counts and active states, or toggle a minimum rating filter on the catalog page. Use this tool when the user wants to see highly rated or top-reviewed gear.',
          inputSchema: ratingFilterSchema,
          execute: (input: { minRating?: string; rating?: string; selected?: boolean }) =>
            this.filterRating(input?.minRating || input?.rating, input?.selected),
        },
        { signal: this.signal }
      )?.catch(() => {});
    } catch {
      // Ignore if tool is already active
    }
  }
}

customElements.define('rating-facet', RatingFacet);
