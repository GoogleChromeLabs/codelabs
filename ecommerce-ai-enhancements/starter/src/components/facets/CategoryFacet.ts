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
import { categoryFilterSchema } from '../../utils/filter-schemas.ts';

export class CategoryFacet extends BaseListFacet {
  public connectedCallback(): void {
    this.facetType = 'category';
    this.facetTitle = 'Category';
    super.connectedCallback();
    this.registerWebMCPTools();
  }

  public filterCategory(category?: string, selected?: boolean) {
    if (category) {
      this.handleToggle(category, selected);
    }
    return {
      categories: this.items.map(i => ({
        category: i.id,
        label: i.label,
        count: i.count,
        selected: i.checked,
      })),
    };
  }

  private registerWebMCPTools(): void {
    // 3.1.2 Register the 'category_filter' tool
  }
}

customElements.define('category-facet', CategoryFacet);
