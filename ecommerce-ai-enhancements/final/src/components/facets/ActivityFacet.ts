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
import { ACTIVITIES } from '../../catalog/dataset.ts';

export class ActivityFacet extends BaseListFacet {
  private toolAbortController: AbortController | null = null;

  public connectedCallback(): void {
    this.facetType = 'activity';
    this.facetTitle = 'Activity';
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
          name: 'activity_filter',
          title: 'Filter by Activity',
          description:
            'Inspect available outdoor activities with their matching product counts and active selection states, or toggle a specific activity filter on the catalog page. Use this tool to filter the catalog for adventures like "Backpacking", "Camping", "Hiking", "Mountaineering", "Paddling", or "Trail Running".',
          inputSchema: {
            type: 'object',
            properties: {
              activity: {
                type: 'string',
                enum: ACTIVITIES,
                description: 'Activity to filter by. Omit to view current activities and counts without changing.',
              },
              selected: {
                type: 'boolean',
                description: 'Explicit selection state: true to select, false to deselect. If omitted, toggles.',
              },
            },
          },
          execute: (input: { activity?: string; selected?: boolean }) => {
            if (input?.activity) {
              this.handleToggle(input.activity, input.selected);
            }
            return {
              activities: this.items.map(i => ({
                activity: i.id,
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

customElements.define('activity-facet', ActivityFacet);
