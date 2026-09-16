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

import { inferJourneyProfile } from '../ai/journey-profiler.ts';
import type { ProfilerInputContext } from './journey-helpers.ts';
import { catalogApi } from '../catalog/catalog-api.ts';
import { rankComplementaryGear, type RecommendedItem } from '../ai/synergy-reranker.ts';
import { logDevToolsTrace } from '../observability/devtools-trace.ts';
import { historyStore } from '../state/history-store.ts';
import { persistentCache } from './persistent-cache.ts';
import type { Product } from '../catalog/dataset.ts';

export class RecommendationCoordinator {
  private inFlight: Map<string, Promise<readonly RecommendedItem[]>> = new Map();

  private createCacheKey(context: ProfilerInputContext): string {
    const timelineKey = context.timeline
      .map(e => (e.type === 'product' ? `p:${e.productId}` : `a:${e.activity}`))
      .join(',');
    const cartKey = context.cart.map(c => `${c.productId}x${c.quantity}`).sort().join(',');
    const promptKey = context.prompt || 'none';
    const prodKey = context.currentProductId || 'none';
    return persistentCache.createKey('v3', prodKey, timelineKey, cartKey, promptKey);
  }

  public async getRecommendations(
    context: Partial<ProfilerInputContext>,
    catalogMap: ReadonlyMap<string, Product>,
    limit: number = 5
  ): Promise<readonly RecommendedItem[]> {
    const timeline = context.timeline || historyStore.getTimeline();
    const currentProductId = context.currentProductId || historyStore.getCurrentProductId();
    const fullContext: ProfilerInputContext = {
      timeline,
      cart: context.cart || [],
      currentProductId,
      prompt: context.prompt,
    };

    const cacheKey = this.createCacheKey(fullContext);

    // Check reload-surviving persistent cache first
    const cached = await persistentCache.get<readonly RecommendedItem[]>('ai_cache', cacheKey);
    if (cached && cached.length > 0) {
      logDevToolsTrace({
        context: fullContext,
        profile: {
          primaryActivity: historyStore.getActiveActivity() || 'Camping',
          impliedConditions: ['Mild', 'Dry'],
          targetCategories: ['Tents', 'Sleeping Bags', 'Backpacks'],
          equipmentRationale: 'Persistent Cache Hit (0.00s)',
        },
        candidates: cached.map(c => c.product),
        recommendations: cached.slice(0, limit),
        timings: {
          step1DurationMs: 0,
          step2DurationMs: 0,
          step3DurationMs: 0,
          totalDurationMs: 0,
        },
      });
      return cached.slice(0, limit);
    }

    const existingPromise = this.inFlight.get(cacheKey);
    if (existingPromise) {
      const results = await existingPromise;
      return results.slice(0, limit);
    }

    const pipelinePromise = this.runPipeline(cacheKey, fullContext, catalogMap).finally(() => {
      this.inFlight.delete(cacheKey);
    });

    this.inFlight.set(cacheKey, pipelinePromise);
    const resolved = await pipelinePromise;
    return resolved.slice(0, limit);
  }

  private async runPipeline(
    cacheKey: string,
    fullContext: ProfilerInputContext,
    catalogMap: ReadonlyMap<string, Product>
  ): Promise<readonly RecommendedItem[]> {
    const totalStartTime = performance.now();

    // Step 1: AI Journey Profiler (Infers intent from full chronological timeline)
    const step1Start = performance.now();
    const profile = await inferJourneyProfile(fullContext, catalogMap);
    const step1DurationMs = performance.now() - step1Start;

    const currentProd = fullContext.currentProductId ? catalogMap.get(fullContext.currentProductId) : null;
    const cartProds = fullContext.cart.map(c => catalogMap.get(c.productId)).filter(Boolean) as Product[];

    // Step 2: Candidate Query (fetch('/api/catalog/search?...'))
    const step2Start = performance.now();
    const candidates = await catalogApi.queryCandidates({
      categories: profile.targetCategories,
      activity: profile.primaryActivity,
      excludeProductIds: [
        ...(fullContext.currentProductId ? [fullContext.currentProductId] : []),
        ...fullContext.cart.map(c => c.productId),
      ],
      limit: 20,
    });
    const step2DurationMs = performance.now() - step2Start;

    // Step 3: AI Synergy Re-Ranker (LanguageModel + candidate-constrained JSON Schema)
    const step3Start = performance.now();
    const recommendations = await rankComplementaryGear(profile, candidates, currentProd, cartProds, 5);
    const step3DurationMs = performance.now() - step3Start;

    const totalDurationMs = performance.now() - totalStartTime;

    // Store into reload-surviving persistent cache
    await persistentCache.set('ai_cache', cacheKey, recommendations);

    // Observability: Log structured DevTools trace with timing breakdown
    logDevToolsTrace({
      context: fullContext,
      profile,
      candidates,
      recommendations,
      timings: {
        step1DurationMs,
        step2DurationMs,
        step3DurationMs,
        totalDurationMs,
      },
    });

    return recommendations;
  }
}

export const recommendationCoordinator = new RecommendationCoordinator();
