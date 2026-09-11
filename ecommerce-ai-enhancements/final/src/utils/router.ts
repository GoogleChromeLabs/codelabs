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

import { CATALOG } from '../catalog/dataset.ts';

export interface ParsedRoute {
  readonly type: 'home' | 'catalog' | 'product';
  readonly productId?: string;
  readonly activity?: string;
  readonly category?: string;
  readonly query?: string;
  readonly searchParams: URLSearchParams;
}

export type RouteHandler = (route: ParsedRoute, url: URL) => void | Promise<void>;

export function parseRoute(url: URL): ParsedRoute {
  const pathname = url.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const query = url.searchParams.get('q') || undefined;

  if (pathname === '/' || pathname === '/home') {
    if (query) {
      return { type: 'catalog', query, searchParams: url.searchParams };
    }
    return { type: 'home', searchParams: url.searchParams };
  }

  const productMatch = pathname.match(/^\/?(?:catalog|products)\/([a-z0-9_-]+)$/);
  if (productMatch && productMatch[1]) {
    const candidateId = productMatch[1];
    const isKnownProduct = CATALOG.some(p => p.id.toLowerCase() === candidateId);
    if (isKnownProduct || pathname.startsWith('/products/')) {
      return { type: 'product', productId: candidateId, searchParams: url.searchParams };
    }
  }

  const activityMatch = pathname.match(/^\/?activity\/([a-z0-9_-]+)$/);
  if (activityMatch && activityMatch[1]) {
    return {
      type: 'catalog',
      activity: activityMatch[1],
      query,
      searchParams: url.searchParams,
    };
  }

  const categoryMatch = pathname.match(/^\/?category\/([a-z0-9_-]+)$/);
  if (categoryMatch && categoryMatch[1]) {
    return {
      type: 'catalog',
      category: categoryMatch[1],
      query,
      searchParams: url.searchParams,
    };
  }

  return { type: 'catalog', query, searchParams: url.searchParams };
}

export function navigateTo(url: string): void {
  window.navigation.navigate(url);
}

export function initRouter(onRouteChange: RouteHandler): void {
  let lastRoute = parseRoute(new URL(window.location.href));

  const runRoute = async (url: URL): Promise<void> => {
    const currentRoute = lastRoute;
    const targetRoute = parseRoute(url);
    lastRoute = targetRoute;

    const targetProdId = targetRoute.type === 'product' ? targetRoute.productId : null;
    const currentProdId = currentRoute.type === 'product' ? currentRoute.productId : null;

    if (targetProdId) {
      const card = document.querySelector(`product-card[data-product-id="${targetProdId}"]`);
      card?.classList.add('transitioning');
    }

    const transition = document.startViewTransition(async () => {
      window.scrollTo(0, 0);
      await onRouteChange(targetRoute, url);

      if (currentProdId && targetRoute.type !== 'product') {
        const card = document.querySelector(`product-card[data-product-id="${currentProdId}"]`);
        card?.classList.add('transitioning');
      }
    });

    transition.finished.catch(() => {}).finally(() => {
      document.querySelectorAll('product-card.transitioning').forEach(el => el.classList.remove('transitioning'));
    });

    try {
      await transition.updateCallbackDone;
    } catch {
      // Ignore skipped transition
    }
  };

  window.navigation.addEventListener('navigate', (event: NavigateEvent) => {
    if (!event.canIntercept || event.hashChange || event.downloadRequest || event.formData) {
      return;
    }

    const url = new URL(event.destination.url);
    if (url.origin !== window.location.origin || (event.destination.sameDocument && event.navigationType === 'replace')) {
      return;
    }

    event.intercept({
      scroll: 'after-transition',
      handler: async () => {
        await runRoute(url);
      },
    });
  });

  runRoute(new URL(window.location.href));
}
