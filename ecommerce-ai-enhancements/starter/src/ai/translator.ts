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
import { persistentCache } from '../utils/persistent-cache.ts';

export type SupportedLanguage =
  | 'en'
  | 'fr'
  | 'zh'
  | 'zh-Hant'
  | 'es'
  | 'ar'
  | 'ru'
  | 'ko'
  | 'pt'
  | 'vi'
  | 'pl'
  | 'ro'
  | 'el'
  | 'it'
  | 'bn'
  | 'ta'
  | 'de'
  | 'uk'
  | 'he'
  | 'hi';

export interface LanguageOption {
  readonly code: SupportedLanguage;
  readonly name: string;
  readonly nativeName: string;
  readonly dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: readonly LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
  { code: 'zh', name: 'Mandarin', nativeName: '简体中文', dir: 'ltr' },
  { code: 'zh-Hant', name: 'Cantonese', nativeName: '繁體中文', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', dir: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', dir: 'ltr' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', dir: 'ltr' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', dir: 'ltr' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', dir: 'ltr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', dir: 'ltr' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', dir: 'rtl' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
];

export const SUPPORTED_LANGUAGE_CODES = SUPPORTED_LANGUAGES.map(l => l.code);

/**
 * Manages on-device `Translator` sessions, one per target language.
 *
 * Named `TranslationManager` rather than `Translator` so it doesn't shadow the
 * global `Translator` constructor from the Translator API.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Translator
 */
class TranslationManager {
  private currentLang: SupportedLanguage = 'en';
  private subscribers: Set<(lang: SupportedLanguage) => void> = new Set();
  private sessions: Map<SupportedLanguage, Translator> = new Map();
  private sessionPromises: Map<SupportedLanguage, Promise<Translator | null>> = new Map();
  private memoryCache: Map<string, string> = new Map();
  private inFlight: Map<string, Promise<string>> = new Map();
  private initialized: boolean = false;

  constructor() {
    // Reference properties in starter shell to satisfy strict unused checks
    void modelStatusStore;
    void this.sessions;
    void this.sessionPromises;
    void this.memoryCache;
    void this.inFlight;
    this.init();
  }

  private async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    const saved = await persistentCache.get<SupportedLanguage>('app_state', 'active_language');
    if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
      this.currentLang = saved;
      this.updateDocumentAttributes();
      this.notify();
    }
  }

  public get language(): SupportedLanguage {
    return this.currentLang;
  }

  public getOption(code: SupportedLanguage = this.currentLang): LanguageOption {
    return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
  }

  public async setLanguage(code: SupportedLanguage): Promise<void> {
    if (this.currentLang === code) return;
    this.currentLang = code;
    this.updateDocumentAttributes();
    this.notify();
    await persistentCache.set('app_state', 'active_language', code);
  }

  private updateDocumentAttributes(): void {
    const opt = this.getOption();
    document.documentElement.lang = opt.code;
    document.documentElement.dir = opt.dir;
    document.documentElement.setAttribute('lang', opt.code);
    document.documentElement.setAttribute('dir', opt.dir);
  }

  public subscribe(fn: (lang: SupportedLanguage) => void): () => void {
    this.subscribers.add(fn);
    fn(this.currentLang);
    return () => this.subscribers.delete(fn);
  }

  private notify(): void {
    for (const fn of this.subscribers) {
      fn(this.currentLang);
    }
  }

  public async getSession(lang: SupportedLanguage = this.currentLang): Promise<Translator | null> {
    if (lang === 'en') return null;

    /*
     * TODO [Stretch Goal: Explore more built-in AI models]:
     * Implement on-device translation session management using Chrome's built-in Translator API.
     *
     * Docs: https://developer.mozilla.org/en-US/docs/Web/API/Translator
     *
     * Expected Implementation:
     * 1. Feature-detect with `'Translator' in self`, then check this.sessions
     *    for an existing session for the target language.
     * 2. If an initialization promise is in-flight in this.sessionPromises, reuse it.
     * 3. Check support before creating, and only attach a download monitor when
     *    a download is actually pending:
     *
     *    const languagePair = { sourceLanguage: 'en', targetLanguage: lang };
     *    const availability = await Translator.availability(languagePair);
     *    // 'available' | 'downloadable' | 'downloading' | 'unavailable'
     *    if (availability === 'unavailable') return null;
     *
     *    const session = await Translator.create({
     *      ...languagePair,
     *      monitor: (monitor: CreateMonitor) => {
     *        monitor.addEventListener('downloadprogress', (event: ProgressEvent) => {
     *          // `loaded` is a fraction between 0 and 1 — scale it, don't divide by total.
     *          const percent = Math.round(event.loaded * 100);
     *          modelStatusStore.setDownloading(`Language Pack (${lang.toUpperCase()})`, percent);
     *        });
     *      },
     *    });
     *
     * 4. Cache the resulting session in this.sessions and return it.
     * 5. Clean up pending promises and reset status indicators in a finally block.
     */

    // Starter shell fallback
    void lang;
    return null;
  }

  /**
   * Translates text into the active language (or optionally specified language).
   */
  public async translate(text: string, targetLang: SupportedLanguage = this.currentLang): Promise<string> {
    const trimmed = text.trim();
    if (!trimmed || targetLang === 'en') return text;

    /*
     * TODO [Stretch Goal: Explore more built-in AI models]:
     * Implement text translation using the Translator API session and caching.
     *
     * Expected Implementation:
     * 1. Check memoryCache and IndexedDB ('translations_cache') for existing translations.
     * 2. If uncached, obtain a Translator session via this.getSession(targetLang).
     * 3. If session is available, translate the string:
     *    const translated = await session.translate(text);
     * 4. Store the translated text in memoryCache and persistentCache ('translations_cache').
     * 5. Return the translated text (or original text if session unavailable).
     */

    // Starter shell fallback: return original text
    return text;
  }

  /**
   * Concise shorthand for translate().
   */
  public t(text: string, targetLang: SupportedLanguage = this.currentLang): Promise<string> {
    return this.translate(text, targetLang);
  }
}

export const translator = new TranslationManager();
