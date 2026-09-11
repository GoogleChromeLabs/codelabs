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

import { modelStatusStore } from '../state/model-status-store.ts';

const baseSessions = new Map<string, LanguageModelSession>();

export async function getPromptSession(systemPrompt: string = ''): Promise<LanguageModelSession> {
  // Clone from base session if available to eliminate system prompt compilation overhead
  const base = baseSessions.get(systemPrompt);
  if (base) {
    try {
      return await base.clone();
    } catch {
      baseSessions.delete(systemPrompt);
    }
  }

  const options: LanguageModelCreateOptions = {
    expectedInputLanguages: ['en'],
    expectedOutputLanguages: ['en'],
    expectedInputs: [{ type: 'text', language: 'en' }],
    expectedOutputs: [{ type: 'text', language: 'en' }],
    outputLanguage: 'en',
  };

  if (systemPrompt) {
    options.systemPrompt = systemPrompt;
  }

  const status = await window.LanguageModel.availability(options);
  if (status === 'after-download') {
    options.monitor = (m: EventTarget) => {
      m.addEventListener('downloadprogress', (e: Event) => {
        const progress = e as LanguageModelDownloadProgressEvent;
        if (progress.total && progress.total > 0 && progress.loaded < progress.total) {
          const percent = Math.round((progress.loaded / progress.total) * 100);
          modelStatusStore.setDownloading('Gemini Nano', percent);
        } else if (progress.loaded >= progress.total) {
          modelStatusStore.reset();
        }
      });
    };
  }

  const newBase = await window.LanguageModel.create(options);
  modelStatusStore.reset();
  baseSessions.set(systemPrompt, newBase);

  try {
    return await newBase.clone();
  } catch {
    return newBase;
  }
}

export async function prewarmPromptSession(systemPrompt: string = ''): Promise<void> {
  if (typeof window === 'undefined' || !window.LanguageModel) return;
  try {
    const session = await getPromptSession(systemPrompt);
    session.destroy();
  } catch {
    // Graceful ignore
  }
}
