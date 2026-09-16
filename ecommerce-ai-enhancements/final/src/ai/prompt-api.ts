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

/**
 * Shared Prompt API session management.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Prompt_API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/LanguageModel
 */

import { modelStatusStore } from '../state/model-status-store.ts';

/**
 * Declaring the modalities and languages we actually use lets the user agent
 * pick the right model components, and lets `availability()` tell us up front
 * whether this exact configuration is supported.
 *
 * Note the shape: an array of `{ type, languages }` objects. There is no
 * `expectedInputLanguages`, `expectedOutputLanguages`, or `outputLanguage`
 * option on `LanguageModel` — those belong to the Summarizer/Writer/Rewriter
 * APIs, and are silently ignored here.
 */
const EXPECTED_INPUTS: LanguageModelExpected[] = [{ type: 'text', languages: ['en'] }];
const EXPECTED_OUTPUTS: LanguageModelExpected[] = [{ type: 'text', languages: ['en'] }];

/**
 * Base sessions, keyed by system prompt.
 *
 * A base session holds nothing but its system instructions, so cloning it for
 * each task skips re-parsing those instructions and guarantees that unrelated
 * tasks never inherit each other's conversation history.
 */
const baseSessions = new Map<string, LanguageModel>();

/** Error thrown when the on-device model can't serve this configuration. */
export class PromptApiUnavailableError extends Error {
  readonly availability: Availability | 'unsupported';

  constructor(availability: Availability | 'unsupported') {
    super(
      availability === 'unsupported'
        ? 'This browser does not implement the Prompt API.'
        : `The language model is ${availability} for the requested configuration.`
    );
    this.name = 'PromptApiUnavailableError';
    this.availability = availability;
  }
}

/** Feature detection for the Prompt API. */
export function isPromptApiSupported(): boolean {
  return 'LanguageModel' in self;
}

/**
 * Reports whether the model can serve our configuration, without creating a
 * session or starting a download.
 *
 * @returns `'available'`, `'downloadable'`, `'downloading'`, or `'unavailable'`.
 */
export async function getPromptApiAvailability(): Promise<Availability> {
  if (!isPromptApiSupported()) return 'unavailable';
  return LanguageModel.availability({
    expectedInputs: EXPECTED_INPUTS,
    expectedOutputs: EXPECTED_OUTPUTS,
  });
}

/**
 * Surfaces model download progress in the UI.
 *
 * `downloadprogress` is typed as `ProgressEvent<CreateMonitor>` via
 * `CreateMonitorEventMap`, so `event` needs no annotation. Its `loaded` is a
 * fraction between 0 and 1, so it is scaled rather than divided by `total`.
 */
function monitorDownload(monitor: CreateMonitor): void {
  monitor.addEventListener('downloadprogress', event => {
    const percent = Math.round(event.loaded * 100);
    if (percent >= 100) {
      modelStatusStore.reset();
      return;
    }
    modelStatusStore.setDownloading('Gemini Nano', percent);
  });
}

/**
 * Returns a ready-to-prompt session carrying the given system instructions.
 *
 * The returned session is a clone, so callers can `destroy()` it freely without
 * throwing away the cached base session.
 *
 * @param systemPrompt System instructions for the session. Passed through
 *   `initialPrompts` as a `system` message — this is the only way to set system
 *   instructions, and it must happen at creation time.
 * @param options.signal Aborts session creation.
 * @throws {PromptApiUnavailableError} When the model cannot serve this configuration.
 */
export async function getPromptSession(
  systemPrompt: string = '',
  options: { signal?: AbortSignal } = {}
): Promise<LanguageModel> {
  const base = baseSessions.get(systemPrompt);
  if (base) {
    try {
      return await base.clone({ signal: options.signal });
    } catch {
      // The base session was destroyed or its context was lost; rebuild below.
      baseSessions.delete(systemPrompt);
    }
  }

  if (!isPromptApiSupported()) {
    throw new PromptApiUnavailableError('unsupported');
  }

  const availability = await getPromptApiAvailability();
  if (availability === 'unavailable') {
    throw new PromptApiUnavailableError(availability);
  }

  const createOptions: LanguageModelCreateOptions = {
    expectedInputs: EXPECTED_INPUTS,
    expectedOutputs: EXPECTED_OUTPUTS,
    signal: options.signal,
  };

  if (systemPrompt) {
    createOptions.initialPrompts = [{ role: 'system', content: systemPrompt }];
  }

  // The model only downloads once, and only `create()` can start it.
  if (availability !== 'available') {
    modelStatusStore.setDownloading('Gemini Nano', 0);
    createOptions.monitor = monitorDownload;
  }

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
  if (!isPromptApiSupported()) return;
  try {
    // Only the base session is kept; the clone exists purely to force creation.
    const session = await getPromptSession(systemPrompt);
    session.destroy();
  } catch {
    // Pre-warming is best effort: the real call will surface any error.
  }
}

/** Destroys every cached base session and frees the model's memory. */
export function destroyPromptSessions(): void {
  for (const session of baseSessions.values()) {
    session.destroy();
  }
  baseSessions.clear();
}
