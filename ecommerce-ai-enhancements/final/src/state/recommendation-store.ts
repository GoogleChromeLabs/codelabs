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

import { recommendationCoordinator } from '../utils/recommendation-coordinator.ts';
import type { RecommendedItem } from '../ai/synergy-reranker.ts';
import { historyStore } from './history-store.ts';
import { cartStore } from './cart-store.ts';
import { CATALOG, type Product } from '../catalog/dataset.ts';

type RecommendationListener = (items: readonly RecommendedItem[], isLoading: boolean) => void;

class RecommendationStore {
  private recommendations: readonly RecommendedItem[] = [];
  private loading: boolean = false;
  private listeners: Set<RecommendationListener> = new Set();
  private catalogMap: Map<string, Product> = new Map(CATALOG.map(p => [p.id, p]));
  private activeProductId: string | null = null;
  private inFlightPromise: Promise<void> | null = null;

  public getRecommendations(): readonly RecommendedItem[] {
    return this.recommendations;
  }

  public isLoading(): boolean {
    return this.loading;
  }

  public subscribe(listener: RecommendationListener): () => void {
    this.listeners.add(listener);
    listener(this.recommendations, this.loading);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.recommendations, this.loading);
    }
  }

  public async setTargetProduct(productId: string | null): Promise<void> {
    if (this.activeProductId === productId && this.recommendations.length > 0) {
      return;
    }
    this.activeProductId = productId;
    await this.refresh();
  }

  public async refresh(): Promise<void> {
    if (this.inFlightPromise) {
      return this.inFlightPromise;
    }

    this.loading = true;
    this.notify();

    this.inFlightPromise = (async () => {
      try {
        const history = historyStore.getHistory();
        const cart = cartStore.getItems();

        const recs = await recommendationCoordinator.getRecommendations(
          {
            history,
            cart,
            currentProductId: this.activeProductId,
          },
          this.catalogMap,
          5
        );

        this.recommendations = recs;
      } catch {
        // Fallback to complementary candidates if offline
        const fallback = CATALOG.filter(p => p.id !== this.activeProductId).slice(0, 5);
        this.recommendations = fallback.map(p => ({
          product: p,
          synergyRationale: 'Complementary outdoor outfitting selection',
        }));
      } finally {
        this.loading = false;
        this.inFlightPromise = null;
        this.notify();
      }
    })();

    return this.inFlightPromise;
  }
}

export const recommendationStore = new RecommendationStore();
