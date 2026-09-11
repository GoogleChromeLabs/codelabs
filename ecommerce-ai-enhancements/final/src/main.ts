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

import './style.css';
import './components/common/ModelDownloadBar.ts';
import './components/navigation/SiteHeader.ts';
import './components/cart/CartDrawer.ts';
import './views/HomeView.ts';
import './views/CatalogView.ts';
import './views/ProductView.ts';
import { historyStore } from './state/history-store.ts';
import { initRouter, type ParsedRoute } from './utils/router.ts';
import type { CatalogView } from './views/CatalogView.ts';
import type { ProductView } from './views/ProductView.ts';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <model-download-bar></model-download-bar>
  <site-header></site-header>
  <main id="main-content" class="site-main" role="main"></main>
  <cart-drawer></cart-drawer>
`;

const mainContainer = app.querySelector<HTMLElement>('#main-content')!;

async function handleRouteChange(route: ParsedRoute): Promise<void> {
  if (route.activity) {
    historyStore.recordActivity(route.activity as any);
  }

  if (route.type === 'home') {
    if (!mainContainer.querySelector('home-view')) {
      mainContainer.innerHTML = '<home-view></home-view>';
    }
    document.title = 'Mont-Royal Plein Air — Outfitter & Catalog';
  } else if (route.type === 'product' && route.productId) {
    let productView = mainContainer.querySelector<ProductView>('product-view');
    if (!productView) {
      mainContainer.innerHTML = '<product-view></product-view>';
      productView = mainContainer.querySelector<ProductView>('product-view')!;
    }
    await productView.loadProduct(route.productId);
    document.title = `${route.productId} — Mont-Royal Plein Air`;
  } else {
    let catalogView = mainContainer.querySelector<CatalogView>('catalog-view');
    if (!catalogView) {
      mainContainer.innerHTML = '<catalog-view></catalog-view>';
      catalogView = mainContainer.querySelector<CatalogView>('catalog-view')!;
    }
    catalogView.setRoute({
      category: route.category,
      activity: route.activity,
      query: route.query,
      searchParams: route.searchParams,
    });

    const titlePrefix = route.activity
      ? `${route.activity} Gear`
      : route.category
        ? `${route.category} Gear`
        : route.query
          ? `Search: "${route.query}"`
          : 'Catalog';

    document.title = `${titlePrefix} — Mont-Royal Plein Air`;
  }
}

initRouter(handleRouteChange);

