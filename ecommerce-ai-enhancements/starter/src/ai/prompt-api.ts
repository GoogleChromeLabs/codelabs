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

  // 1.1.2 Check to see if the Prompt API is available

  // 1.1.3 Declare the expected inputs and outputs for the model

  // 1.1.4 Check if the model is available and, if not, download the model

  // 1.1.5 Create the Session
  // Build initial Language Model options, with signal

  // Add in the system prompt, if there is one

  // Create the session, memoize it, and return a clone
}
