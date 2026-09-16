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

// Base sessions, keyed by System Prompt
const baseSessions = new Map<string, LanguageModel>();

/**
 * Returns a ready-to-prompt session carrying the given system instructions.
 *
 * The returned session is always a clone, so callers can `destroy()` it freely
 * without throwing away the cached base session.
 *
 * @param systemPrompt System instructions for the session. Passed through
 *   `initialPrompts` as a `system` message — this is the only way to set system
 *   instructions, and it must happen at creation time.
 * @param options.signal Aborts session creation.
 * @throws When the browser has no Prompt API, or the model cannot serve this
 *   configuration.
 */
export async function getPromptSession(
  systemPrompt: string = '',
  options: { signal?: AbortSignal } = {}
): Promise<LanguageModel> {
  // Memoize the sessions, returning a clone with a new signal if one exists
  const base = baseSessions.get(systemPrompt);
  if (base) {
    try {
      return await base.clone({ signal: options.signal });
    } catch {
      // The base session was destroyed or its context was lost; rebuild below.
      baseSessions.delete(systemPrompt);
    }
  }

  // Check to see if the Prompt API is available
  if (!('LanguageModel' in self)) {
    throw new Error('This browser does not implement the Prompt API.');
  }

  // Declare the expected inputs and outputs for the model we want to use
  const expectedInputs: LanguageModelExpected[] = [{ type: 'text', languages: ['en'] }];
  const expectedOutputs: LanguageModelExpected[] = [{ type: 'text', languages: ['en'] }];

  // Check the model's availability
  const availability = await LanguageModel.availability({ expectedInputs, expectedOutputs });
  if (availability === 'unavailable') {
    throw new Error('The language model is unavailable for the requested configuration.');
  }

  // Build initial Language Model options
  const createOptions: LanguageModelCreateOptions = {
    expectedInputs,
    expectedOutputs,
    signal: options.signal,
  };

  // Add in the system prompt, if there is one
  if (systemPrompt) {
    createOptions.initialPrompts = [{ role: 'system', content: systemPrompt }];
  }

  // Check if the model is available and, if not, download the model
  if (availability !== 'available') {
    // Update UI
    modelStatusStore.setDownloading('Local AI Model', 0);

    // Monitor download progress
    createOptions.monitor = monitor => {
      monitor.addEventListener('downloadprogress', event => {
        const percent = Math.round(event.loaded * 100);
        if (percent >= 100) {
          modelStatusStore.reset();
          return;
        }
        modelStatusStore.setDownloading('Local AI Model', percent);
      });
    };
  }

  // Add the session to the memoized cache, then return a clone.
  try {
    const newBase = await LanguageModel.create(createOptions);
    baseSessions.set(systemPrompt, newBase);
    return await newBase.clone({ signal: options.signal });
  } finally {
    modelStatusStore.reset();
  }
}

/**
 * Warms up the model for a system prompt ahead of the user's first request.
 *
 * Call this as soon as intent is clear (a focused search box, a hovered AI
 * affordance) so the cold start happens while the user is still typing. Session
 * creation requires transient activation, so this must run from a user
 * interaction.
 */
export async function prewarmPromptSession(systemPrompt: string = ''): Promise<void> {
  if (!('LanguageModel' in self)) return;
  try {
    // Only the base session is kept; the clone exists purely to force creation.
    const session = await getPromptSession(systemPrompt);
    session.destroy();
  } catch {
    // Pre-warming is best effort: the real call will surface any error.
  }
}
