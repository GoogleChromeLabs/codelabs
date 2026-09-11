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

import { modelStatusStore, type ModelStatus } from '../../state/model-status-store.ts';

export class ModelDownloadBar extends HTMLElement {
  private unsubscribe: (() => void) | null = null;

  public connectedCallback(): void {
    this.unsubscribe = modelStatusStore.subscribe(status => this.render(status));
    this.render(modelStatusStore.getStatus());
  }

  public disconnectedCallback(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  private render(status: ModelStatus): void {
    if (!status.isDownloading) {
      this.innerHTML = '';
      this.style.display = 'none';
      return;
    }

    this.style.display = 'block';
    this.innerHTML = `
      <style>
        model-download-bar {
          display: block;
          position: sticky;
          top: 0;
          z-index: 1000;
          background: var(--forest-primary);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        .model-download-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 8px var(--page-pad-inline);
          font-size: 13px;
          font-weight: 600;
        }
        .model-download-info {
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }
        .model-spinner {
          display: inline-block;
          animation: spin 2s linear infinite;
        }
        .model-progress-bar {
          flex: 1;
          max-width: 300px;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          accent-color: var(--terracotta);
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 600px) {
          .model-download-banner {
            flex-direction: column;
            align-items: stretch;
            gap: 6px;
          }
          .model-progress-bar {
            max-width: 100%;
          }
        }
      </style>
      <div 
        class="model-download-banner" 
        role="status" 
        aria-live="polite" 
        aria-label="AI Model Download Status"
      >
        <div class="model-download-info">
          <span class="model-spinner" aria-hidden="true">⚙️</span>
          <span class="model-text">${status.message} (${status.progressPercent}%)</span>
        </div>
        <progress 
          class="model-progress-bar" 
          value="${status.progressPercent}" 
          max="100" 
          aria-valuenow="${status.progressPercent}" 
          aria-valuemin="0" 
          aria-valuemax="100"
        >${status.progressPercent}%</progress>
      </div>
    `;
  }
}

customElements.define('model-download-bar', ModelDownloadBar);
