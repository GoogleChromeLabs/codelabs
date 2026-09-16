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
import { persistentCache } from './persistent-cache.ts';
import { createTranslator, translate } from '../ai/translator.ts';

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

// Language State & DOM Synchronization
let activeLanguage: SupportedLanguage = 'en';
const subscribers = new Set<(lang: SupportedLanguage) => void>();
let initialized = false;

export function getLanguageOption(code: SupportedLanguage = activeLanguage): LanguageOption {
  return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
}

function updateDocumentAttributes(): void {
  const opt = getLanguageOption(activeLanguage);
  document.documentElement.lang = opt.code;
  document.documentElement.dir = opt.dir;
  document.documentElement.setAttribute('lang', opt.code);
  document.documentElement.setAttribute('dir', opt.dir);
}

function notifySubscribers(): void {
  for (const fn of subscribers) {
    fn(activeLanguage);
  }
}

async function initLanguageState(): Promise<void> {
  if (initialized) return;
  initialized = true;

  const saved = await persistentCache.get<SupportedLanguage>('app_state', 'active_language');
  if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
    activeLanguage = saved;
    updateDocumentAttributes();
    notifySubscribers();
  }
}

initLanguageState();

export function getActiveLanguage(): SupportedLanguage {
  return activeLanguage;
}

export async function setActiveLanguage(code: SupportedLanguage): Promise<void> {
  if (activeLanguage === code) return;
  activeLanguage = code;
  updateDocumentAttributes();
  notifySubscribers();
  await persistentCache.set('app_state', 'active_language', code);
}

export function subscribeLanguage(fn: (lang: SupportedLanguage) => void): () => void {
  subscribers.add(fn);
  fn(activeLanguage);
  return () => {
    subscribers.delete(fn);
  };
}

// Session Caching
const sessionMap = new Map<SupportedLanguage, Translator>();
const sessionPromises = new Map<SupportedLanguage, Promise<Translator | null>>();

export async function getCachedTranslator(
  targetLang: SupportedLanguage
): Promise<Translator | null> {
  if (targetLang === 'en' || !('Translator' in self)) return null;

  const existing = sessionMap.get(targetLang);
  if (existing) return existing;

  const pending = sessionPromises.get(targetLang);
  if (pending) return pending;

  const promise = createTranslator(targetLang).finally(() => {
    modelStatusStore.reset();
    sessionPromises.delete(targetLang);
  });

  sessionPromises.set(targetLang, promise);
  const session = await promise;
  if (session) {
    sessionMap.set(targetLang, session);
  }
  return session;
}

// Translation Caching & In-Flight Deduplication
const memoryCache = new Map<string, string>();
const inFlight = new Map<string, Promise<string>>();

async function translateWithCache(
  text: string,
  targetLang: SupportedLanguage,
  translateFn: (cleanText: string, lang: SupportedLanguage) => Promise<string>
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || targetLang === 'en') return text;

  const key = `${targetLang}::${trimmed}`;
  const mem = memoryCache.get(key);
  if (mem !== undefined) return mem;

  const idbCached = await persistentCache.get<string>('translations_cache', key);
  if (idbCached !== null) {
    memoryCache.set(key, idbCached);
    return idbCached;
  }

  const existingInFlight = inFlight.get(key);
  if (existingInFlight) return existingInFlight;

  const promise = (async () => {
    try {
      const result = await translateFn(trimmed, targetLang);
      memoryCache.set(key, result);
      await persistentCache.set('translations_cache', key, result);
      return result;
    } catch {
      return text;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
}

/**
 * Application-wide translation client used by UI components and views.
 *
 * Exposes active language state, language change subscriptions, session
 * prewarming, and text translation methods (`translate` and shorthand `t`).
 */
export const translator = {
  get language(): SupportedLanguage {
    return getActiveLanguage();
  },
  setLanguage: setActiveLanguage,
  getOption: getLanguageOption,
  subscribe: subscribeLanguage,
  getSession(lang?: SupportedLanguage): Promise<Translator | null> {
    return getCachedTranslator(lang ?? getActiveLanguage());
  },
  translate(
    text: string,
    targetLang: SupportedLanguage = getActiveLanguage()
  ): Promise<string> {
    return translateWithCache(text, targetLang, translate);
  },
  t(text: string, targetLang?: SupportedLanguage): Promise<string> {
    return this.translate(text, targetLang);
  },
};
