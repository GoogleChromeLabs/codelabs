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
import {
  type SupportedLanguage,
  getCachedTranslator,
} from '../utils/translator-helpers.ts';

/**
 * Creates an on-device `Translator` session for the given target language.
 * Uses Chrome's built-in Translation API:
 * https://developer.mozilla.org/en-US/docs/Web/API/Translator
 */
export async function createTranslator(
  targetLang: SupportedLanguage
): Promise<Translator | null> {
  // 1.4.1 Check for support for the Translator API
  if (targetLang === 'en' || !('Translator' in self)) return null;

  try {
    // 1.4.2 Build a language pair and check for translator availability
    const languagePair = { sourceLanguage: 'en', targetLanguage: targetLang };
    const availability = await Translator.availability(languagePair);
    if (availability === 'unavailable') return null;

    // 1.4.3 Create translator options and attach a monitor if the language is not available
    const createOptions: TranslatorCreateOptions = { ...languagePair };

    if (availability !== 'available') {
      createOptions.monitor = (monitor: CreateMonitor) => {
        monitor.addEventListener('downloadprogress', (event: ProgressEvent) => {
          const percent = Math.round(event.loaded * 100);
          if (percent >= 100) {
            modelStatusStore.reset();
            return;
          }
          modelStatusStore.setDownloading(`Language Pack (${targetLang.toUpperCase()})`, percent);
        });
      };
    }

    // 1.4.4 Return the translator
    return await Translator.create(createOptions);
  } catch {
    return null;
  }
}

/**
 * Translates text into the specified target language.
 */
export async function translate(
  text: string,
  targetLang: SupportedLanguage
): Promise<string> {
  // 1.4.5 See if there's an available translator
  const session = await getCachedTranslator(targetLang);
  if (!session) return text;

  // 1.4.6 Return translated text
  return await session.translate(text);
}
