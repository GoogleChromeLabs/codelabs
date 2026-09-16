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
import { activityFilterSchema } from '../../utils/filter-schemas.ts';

export class ActivityFacet extends BaseListFacet {
  public connectedCallback(): void {
    this.facetType = 'activity';
    this.facetTitle = 'Activity';
    super.connectedCallback();
    this.registerWebMCPTools();
  }

  public filterActivity(activity?: string, selected?: boolean) {
    if (activity) {
      this.handleToggle(activity, selected);
    }
    return {
      activities: this.items.map(i => ({
        activity: i.id,
        label: i.label,
        count: i.count,
        selected: i.checked,
      })),
    };
  }

  private registerWebMCPTools(): void {
    if (!document.modelContext?.registerTool) return;

    try {
      // 3.1.1 Register the 'activity_filter' tool
      document.modelContext.registerTool(
        {
          name: 'activity_filter',
          title: 'Filter by Activity',
          description:
            'Inspect available outdoor activities with their matching product counts and active selection states, or toggle a specific activity filter on the catalog page. Use this tool to filter the catalog for adventures like "Backpacking", "Camping", "Hiking", "Mountaineering", "Paddling", or "Trail Running".',
          inputSchema: activityFilterSchema,
          execute: (input: { activity?: string; selected?: boolean }) =>
            this.filterActivity(input?.activity, input?.selected),
        },
        { signal: this.signal }
      )?.catch(() => {});
    } catch {
      // Ignore if tool is already active
    }
  }
}

customElements.define('activity-facet', ActivityFacet);
