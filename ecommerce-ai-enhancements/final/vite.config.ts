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

import { defineConfig, type Plugin } from 'vite';
import { CATALOG } from './src/catalog/dataset.ts';

function catalogServerPlugin(): Plugin {
  return {
    name: 'catalog-server-api',
    configureServer(server) {
      server.middlewares.use('/api/catalog/search', (req, res) => {
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const categories = url.searchParams.getAll('categories');
        const activity = url.searchParams.get('activity');
        const exclude = url.searchParams.getAll('exclude');
        const limit = parseInt(url.searchParams.get('limit') || '20', 10);

        const excludeSet = new Set(exclude);
        const available = CATALOG.filter(item => !excludeSet.has(item.id));

        const selected: typeof CATALOG[number][] = [];
        const selectedIds = new Set<string>();

        // 1. Gather balanced candidates across each requested target category
        if (categories.length > 0) {
          const itemsPerCat = Math.max(2, Math.ceil(limit / categories.length));
          for (const cat of categories) {
            const catItems = available.filter(p => p.categories.includes(cat) && !selectedIds.has(p.id));
            for (const item of catItems.slice(0, itemsPerCat)) {
              selected.push(item);
              selectedIds.add(item.id);
              if (selected.length >= limit) break;
            }
            if (selected.length >= limit) break;
          }
        }

        // 2. If pool still has capacity, backfill with activity matches
        if (selected.length < limit && activity) {
          const actItems = available.filter(p => p.activities.includes(activity as any) && !selectedIds.has(p.id));
          for (const item of actItems) {
            selected.push(item);
            selectedIds.add(item.id);
            if (selected.length >= limit) break;
          }
        }

        // 3. If still below limit, fill remaining slots from available catalog
        if (selected.length < limit) {
          for (const item of available) {
            if (!selectedIds.has(item.id)) {
              selected.push(item);
              selectedIds.add(item.id);
              if (selected.length >= limit) break;
            }
          }
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(selected.slice(0, limit)));
      });

      server.middlewares.use('/api/catalog/products', (req, res) => {
        const id = (req.url || '').replace(/^\//, '').split('?')[0];
        const product = CATALOG.find(p => p.id === id);
        res.setHeader('Content-Type', 'application/json');
        if (product) {
          res.end(JSON.stringify(product));
        } else {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Product not found' }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [catalogServerPlugin()],
});
