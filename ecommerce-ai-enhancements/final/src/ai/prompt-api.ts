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

/*
 * Every call this application makes into the Prompt API
 */

import { modelStatusStore } from '../state/model-status-store.ts';

// Base sessions, keyed by system prompt
const baseSessions = new Map<string, LanguageModel>();

export const DEFAULT_SYSTEM_PROMPT =
  `You are an expert sales associate for Mont-Royal Plein Air, a technical outdoor gear outfitter. Your job is to understand your customer's intended journey and help them find the perfect gear for their needs.`;

/**
 * Returns a ready-to-prompt session carrying the given system instructions.
 * The returned session is always a clone, so callers may destroy it without discarding the cached base session.
 */
export async function getPromptSession(
  systemPrompt: string = DEFAULT_SYSTEM_PROMPT,
  options: { signal?: AbortSignal } = {}
): Promise<LanguageModel> {
  // 1.1.1 Memoize the sessions, returning a clone with a new signal if one exists
  const base = baseSessions.get(systemPrompt);
  if (base) {
    try {
      return await base.clone({ signal: options.signal });
    } catch {
      // The base session was destroyed or its context was lost; rebuild below.
      baseSessions.delete(systemPrompt);
    }
  }

  // 1.1.2 Check to see if the Prompt API is available
  if (!('LanguageModel' in self)) {
    throw new Error('This browser does not implement the Prompt API.');
  }

  // 1.1.3 Declare the expected inputs and outputs for the model
  const expectedInputs: LanguageModelExpected[] = [{ type: 'text', languages: ['en'] }];
  const expectedOutputs: LanguageModelExpected[] = [{ type: 'text', languages: ['en'] }];

  // Check if the browser supports your model needs
  const availability = await LanguageModel.availability({ expectedInputs, expectedOutputs });
  if (availability === 'unavailable') {
    throw new Error('The language model is unavailable for the requested configuration.');
  }

  // 1.1.4 Create options
  // Build initial Language Model options, with signal and system prompt
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
    createOptions.monitor = (monitor: CreateMonitor) => {
      monitor.addEventListener('downloadprogress', (event: ProgressEvent) => {
        const percent = Math.round(event.loaded * 100);
        if (percent >= 100) {
          modelStatusStore.reset();
          return;
        }
        modelStatusStore.setDownloading('Local AI Model', percent);
      });
    };
  }

  // 1.1.5 Create the Session
  // Add the session to the memoized cache, then return a clone.
  try {
    const newBase = await LanguageModel.create(createOptions);
    baseSessions.set(systemPrompt, newBase);
    return await newBase.clone({ signal: options.signal });
  } finally {
    modelStatusStore.reset();
  }
}
