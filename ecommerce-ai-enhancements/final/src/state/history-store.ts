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

import type { ActivityType } from '../catalog/dataset.ts';
import { persistentCache } from '../utils/persistent-cache.ts';

export type HistoryTimelineEvent =
  | { readonly type: 'product'; readonly productId: string; readonly timestamp: number }
  | { readonly type: 'activity'; readonly activity: ActivityType; readonly timestamp: number };

export type HistorySubscriber = (timeline: readonly HistoryTimelineEvent[]) => void;

export class HistoryStore {
  private timeline: HistoryTimelineEvent[] = [];
  private subscribers: Set<HistorySubscriber> = new Set();
  private readonly maxTimelineLength: number = 5;
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    try {
      const saved = await persistentCache.get<HistoryTimelineEvent[]>('app_state', 'browsing_timeline');
      if (saved && Array.isArray(saved)) {
        this.timeline = saved.slice(0, this.maxTimelineLength);
        this.notify();
      }
    } catch {
      // ignore
    }
  }

  private async saveToStorage(): Promise<void> {
    try {
      await persistentCache.set('app_state', 'browsing_timeline', this.timeline);
    } catch {
      // ignore
    }
  }

  public getTimeline(): readonly HistoryTimelineEvent[] {
    return [...this.timeline];
  }

  public getHistory(): readonly { productId: string; timestamp: number }[] {
    return this.timeline
      .filter((e): e is { type: 'product'; productId: string; timestamp: number } => e.type === 'product')
      .map(e => ({ productId: e.productId, timestamp: e.timestamp }));
  }

  public getCurrentProductId(): string | null {
    const latestProd = this.timeline.find(e => e.type === 'product');
    return latestProd && latestProd.type === 'product' ? latestProd.productId : null;
  }

  public getActiveActivity(): ActivityType | null {
    const latestAct = this.timeline.find(e => e.type === 'activity');
    return latestAct && latestAct.type === 'activity' ? latestAct.activity : null;
  }

  public recordActivity(activity: ActivityType): void {
    const latest = this.timeline[0];
    if (latest && latest.type === 'activity' && latest.activity === activity) {
      return;
    }

    this.timeline.unshift({
      type: 'activity',
      activity,
      timestamp: Date.now(),
    });

    if (this.timeline.length > this.maxTimelineLength) {
      this.timeline = this.timeline.slice(0, this.maxTimelineLength);
    }

    this.saveToStorage();
    this.notify();
  }

  public recordView(productId: string): void {
    const latest = this.timeline[0];
    if (latest && latest.type === 'product' && latest.productId === productId) {
      // On page reload, do not re-add to history
      return;
    }

    this.timeline = this.timeline.filter(e => !(e.type === 'product' && e.productId === productId));
    this.timeline.unshift({
      type: 'product',
      productId,
      timestamp: Date.now(),
    });

    if (this.timeline.length > this.maxTimelineLength) {
      this.timeline = this.timeline.slice(0, this.maxTimelineLength);
    }

    this.saveToStorage();
    this.notify();
  }

  public clear(): void {
    this.timeline = [];
    this.saveToStorage();
    this.notify();
  }

  public subscribe(callback: HistorySubscriber): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notify(): void {
    const snapshot = this.getTimeline();
    for (const sub of this.subscribers) {
      try {
        sub(snapshot);
      } catch {
        // ignore
      }
    }
  }
}

export const historyStore = new HistoryStore();
