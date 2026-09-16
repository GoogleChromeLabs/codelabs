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

import { translator, type SupportedLanguage } from './translator-helpers.ts';

const LOCALE_MAP: Record<SupportedLanguage, string> = {
  en: 'en-CA',
  fr: 'fr-CA',
  zh: 'zh-CN',
  'zh-Hant': 'zh-TW',
  es: 'es-ES',
  ar: 'ar-EG',
  ru: 'ru-RU',
  ko: 'ko-KR',
  pt: 'pt-BR',
  vi: 'vi-VN',
  pl: 'pl-PL',
  ro: 'ro-RO',
  el: 'el-GR',
  it: 'it-IT',
  bn: 'bn-BD',
  ta: 'ta-IN',
  de: 'de-DE',
  uk: 'uk-UA',
  he: 'he-IL',
  hi: 'hi-IN',
};

export function getActiveLocale(lang: SupportedLanguage = translator.language): string {
  return LOCALE_MAP[lang] || `${lang}-CA`;
}

/**
 * Formats an amount as Canadian dollars.
 */
export function formatCAD(amount: number, locale: string = getActiveLocale()): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a number in the active locale's numeral system and separators.
 */
export function formatNumber(num: number, locale: string = getActiveLocale()): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Formats a weight in grams, switching to kilograms at 1 kg and above.
 */
export function formatGrams(grams: number, locale: string = getActiveLocale()): string {
  if (grams >= 1000) {
    return new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: 'kilogram',
      maximumFractionDigits: 2,
    }).format(grams / 1000);
  }
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'gram',
    maximumFractionDigits: 0,
  }).format(grams);
}

/**
 * Formats a rating as five filled or empty stars.
 */
export function formatRatingStars(rating: number): string {
  const fullStars = Math.round(rating);
  return '★'.repeat(fullStars) + '☆'.repeat(Math.max(0, 5 - fullStars));
}
