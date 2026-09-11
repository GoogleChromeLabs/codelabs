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

export interface CartItem {
  readonly productId: string;
  quantity: number;
}

export type CartSubscriber = (items: readonly CartItem[]) => void;

const CART_STORAGE_KEY = 'montreal_cart_v1';

export class CartStore {
  private items: CartItem[] = [];
  private subscribers: Set<CartSubscriber> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const saved = sessionStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        this.items = JSON.parse(saved);
      }
    } catch {
      // ignore
    }
  }

  private saveToStorage(): void {
    try {
      sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
    } catch {
      // ignore
    }
  }

  public getItems(): readonly CartItem[] {
    return [...this.items];
  }

  public getTotalQuantity(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  public addItem(productId: string, quantity: number = 1): void {
    const existing = this.items.find(item => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({ productId, quantity });
    }
    this.saveToStorage();
    this.notify();
  }

  public removeItem(productId: string): void {
    this.items = this.items.filter(item => item.productId !== productId);
    this.saveToStorage();
    this.notify();
  }

  public updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const existing = this.items.find(item => item.productId === productId);
    if (existing) {
      existing.quantity = quantity;
      this.saveToStorage();
      this.notify();
    }
  }

  public clear(): void {
    this.items = [];
    this.saveToStorage();
    this.notify();
  }

  public subscribe(callback: CartSubscriber): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notify(): void {
    const snapshot = this.getItems();
    for (const sub of this.subscribers) {
      sub(snapshot);
    }
  }
}

export const cartStore = new CartStore();
