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

  // Check to see if the Prompt API is available

  // Declare the expected inputs and outputs for the model we want to use

  // Check the model's availability

  // Build initial Language Model options, with signal
  // const createOptions: LanguageModelCreateOptions = {

  // }

  // Add in the system prompt, if there is one

  // Check if the model is available and, if not, download the model
  // if (availability !== 'available') {
  //   // Update UI
  //   modelStatusStore.setDownloading('Local AI Model', 0);

  //   // Monitor download progress
  //   createOptions.monitor = monitor => {

  //   };
  // }

  // Add the session to the memoized cache, then return a clone.
}
