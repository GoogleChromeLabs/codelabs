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
    /*
     * TODO: Register the 'activity_filter' WebMCP tool on document.modelContext.
     *
     * Expected Implementation:
     * When WebMCP is supported (document.modelContext?.registerTool):
     * Register 'activity_filter' allowing an AI agent or assistant to:
     * - Inspect available outdoor activities with product counts and selected states.
     * - Toggle an activity filter (e.g. "Camping", "Backpacking", "Hiking").
     *
     * Tool specification:
     * - name: 'activity_filter'
     * - description: Inspect available outdoor activities or toggle a specific activity filter.
     * - inputSchema: {
     *     type: 'object',
     *     properties: {
     *       activity: { type: 'string', enum: ACTIVITIES, description: 'Activity to filter by.' },
     *       selected: { type: 'boolean', description: 'Explicit selection state.' },
     *     },
     *   }
     * - execute: (input) => {
     *     if (input?.activity) this.handleToggle(input.activity, input.selected);
     *     return { activities: this.items.map(i => ({ activity: i.id, label: i.label, count: i.count, selected: i.checked })) };
     *   }
     */
  }
}

customElements.define('activity-facet', ActivityFacet);
