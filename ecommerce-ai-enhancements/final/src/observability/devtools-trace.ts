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

import type { JourneyProfile, ProfilerInputContext } from '../ai/journey-helpers.ts';
import type { RecommendedItem } from '../ai/synergy-reranker.ts';
import type { Product } from '../catalog/dataset.ts';
import type { SemanticFilterResult } from '../ai/catalog-semantic-filter.ts';
import type { SemanticFilterResponse } from '../ai/recommendation-schemas.ts';

export interface PipelineTimings {
  readonly step1DurationMs: number;
  readonly step2DurationMs: number;
  readonly step3DurationMs: number;
  readonly totalDurationMs: number;
}

export interface DevToolsTracePayload {
  readonly context: ProfilerInputContext;
  readonly profile: JourneyProfile;
  readonly candidates: readonly Product[];
  readonly recommendations: readonly RecommendedItem[];
  readonly timings?: PipelineTimings;
}

const HEADER_STYLE = 'color: #1b3b2b; font-weight: bold; background: #e8ede9; padding: 2px 6px; border-radius: 3px;';
const formatSec = (ms: number): string => `${(ms / 1000).toFixed(2)}s`;
const createTimingRow = (step: string, ms: number) => ({
  Step: step,
  'Duration (ms)': `${ms.toFixed(1)} ms`,
  'Duration (s)': `${(ms / 1000).toFixed(2)} s`,
});
const stepLabel = (label: string, ms?: number): string =>
  ms === undefined ? label : `${label} (${formatSec(ms)})`;

export function logDevToolsTrace(payload: DevToolsTracePayload): void {
  const time = new Date().toLocaleTimeString();
  const totalDurationStr = payload.timings
    ? ` (${formatSec(payload.timings.totalDurationMs)} total)`
    : '';

  console.groupCollapsed(
    `%c[AI Recommender] Pipeline Execution @ ${time} — ${payload.recommendations.length} items recommended${totalDurationStr}`,
    HEADER_STYLE
  );

  if (payload.timings) {
    console.group(`⏱️ Timing Trace (${formatSec(payload.timings.totalDurationMs)} total)`);
    console.table([
      createTimingRow('Step 1: AI Journey Profiler', payload.timings.step1DurationMs),
      createTimingRow('Step 2: Server Candidate Search', payload.timings.step2DurationMs),
      createTimingRow('Step 3: AI Synergy Re-Ranker', payload.timings.step3DurationMs),
      createTimingRow('Total Pipeline Execution', payload.timings.totalDurationMs),
    ]);
    console.groupEnd();
  }

  console.group('1. Shopper Context');
  console.log('Current Product:', payload.context.currentProductId || 'None');
  console.log('Cart Items (3.0x Weight):', payload.context.cart);
  console.log('Browsing History Timeline:', payload.context.timeline || payload.context.history || []);
  console.groupEnd();

  console.group(stepLabel('2. Step 1 — Inferred Journey Profile', payload.timings?.step1DurationMs));
  console.log('Primary Activity:', payload.profile.primaryActivity);
  console.log('Implied Conditions:', payload.profile.impliedConditions);
  console.log('Target Categories:', payload.profile.targetCategories);
  console.log('Equipment Rationale:', payload.profile.equipmentRationale);
  console.groupEnd();

  console.group(
    stepLabel(`3. Step 2 — Candidate Retrieval (${payload.candidates.length} products)`, payload.timings?.step2DurationMs)
  );
  console.table(
    payload.candidates.map(c => ({
      ID: c.id,
      Name: c.name,
      Categories: c.categories.join(', '),
      Activities: c.activities.join(', '),
      Price: `$${c.price}`,
    }))
  );
  console.groupEnd();

  console.group(stepLabel('4. Step 3 — AI Synergy Re-Ranker Selections', payload.timings?.step3DurationMs));
  console.table(
    payload.recommendations.map(r => ({
      ID: r.product.id,
      Name: r.product.name,
      Price: `$${r.product.price}`,
      'Synergy Rationale': r.synergyRationale,
    }))
  );
  console.groupEnd();

  console.groupEnd();
}

export interface SemanticSearchTimings {
  readonly step1DurationMs: number;
  readonly step2DurationMs: number;
  readonly step3DurationMs: number;
  readonly totalDurationMs: number;
}

export interface SemanticSearchTracePayload {
  readonly query: string;
  readonly cachedJourney: JourneyProfile | null;
  readonly promptOutput: SemanticFilterResponse;
  readonly appliedFilters: SemanticFilterResult['appliedFilters'];
  readonly toolsExecuted: string[];
  readonly matchingProducts: readonly Product[];
  readonly cacheHit: boolean;
  readonly timings?: SemanticSearchTimings;
}

export function logSemanticSearchTrace(payload: SemanticSearchTracePayload): void {
  const time = new Date().toLocaleTimeString();
  const totalDurationStr = payload.timings
    ? ` (${(payload.timings.totalDurationMs / 1000).toFixed(2)}s total)`
    : '';
  const cacheStr = payload.cacheHit ? ' [Cache Hit]' : '';

  console.groupCollapsed(
    `%c[AI Semantic Search] Query: "${payload.query}" @ ${time} — ${payload.matchingProducts.length} items matched${totalDurationStr}${cacheStr}`,
    HEADER_STYLE
  );

  if (payload.timings) {
    console.group(`⏱️ Timing Trace (${formatSec(payload.timings.totalDurationMs)} total)`);
    console.table([
      createTimingRow('Step 1: Cached Journey Retrieval', payload.timings.step1DurationMs),
      createTimingRow('Step 2: AI Prompt Inference (Gemini Nano)', payload.timings.step2DurationMs),
      createTimingRow('Step 3: WebMCP Filter Tools Execution', payload.timings.step3DurationMs),
      createTimingRow('Total Search Pipeline', payload.timings.totalDurationMs),
    ]);
    console.groupEnd();
  }

  console.group('1. Search Context');
  console.log('Search Query:', payload.query);
  console.log('Cache Status:', payload.cacheHit ? 'Cache Hit' : 'Cold Inference');
  console.groupEnd();

  console.group(stepLabel('2. Step 1 — Cached Journey Profile', payload.timings?.step1DurationMs));
  if (payload.cachedJourney) {
    console.log('Primary Activity:', payload.cachedJourney.primaryActivity);
    console.log('Implied Conditions:', payload.cachedJourney.impliedConditions);
    console.log('Target Categories:', payload.cachedJourney.targetCategories);
    console.log('Equipment Rationale:', payload.cachedJourney.equipmentRationale);
  } else {
    console.log('Journey Profile:', 'None (fresh journey)');
  }
  console.groupEnd();

  console.group(stepLabel('3. Step 2 — AI Prompt Inference', payload.timings?.step2DurationMs));
  console.log('Prompt API Output:', payload.promptOutput);
  console.log('Applied Facet Filters:', payload.appliedFilters);
  console.groupEnd();

  console.group(
    stepLabel(`4. Step 3 — WebMCP Filter Tools Execution (${payload.matchingProducts.length} products)`, payload.timings?.step3DurationMs)
  );
  console.log('Tools Executed:', payload.toolsExecuted);
  console.table(
    payload.matchingProducts.map(p => ({
      ID: p.id,
      Name: p.name,
      Categories: p.categories.join(', '),
      Activities: p.activities.join(', '),
      Price: `$${p.price}`,
      Rating: `${p.rating} ★`,
    }))
  );
  console.groupEnd();

  console.groupEnd();
}

