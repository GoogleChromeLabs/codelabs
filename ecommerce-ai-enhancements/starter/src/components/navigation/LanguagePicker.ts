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

import {
  translator,
  SUPPORTED_LANGUAGES,
  SUPPORTED_LANGUAGE_CODES,
  type SupportedLanguage,
} from '../../utils/translator-helpers.ts';

export class LanguagePicker extends HTMLElement {
  private unsubscribe: (() => void) | null = null;
  private selectEl: HTMLSelectElement | null = null;
  private toolAbortController: AbortController | null = null;

  private get signal(): AbortSignal | undefined {
    return this.toolAbortController?.signal;
  }

  public connectedCallback(): void {
    this.toolAbortController = new AbortController();
    this.render();
    this.unsubscribe = translator.subscribe((lang) => {
      if (this.selectEl && this.selectEl.value !== lang) {
        this.selectEl.value = lang;
      }
    });
    this.registerWebMCPTools();
  }

  public disconnectedCallback(): void {
    this.toolAbortController?.abort();
    this.toolAbortController = null;
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  public async switchLanguage(language: SupportedLanguage) {
    if (!language || !SUPPORTED_LANGUAGE_CODES.includes(language)) {
      return { success: false, error: `Invalid language code: ${language}. Supported: ${SUPPORTED_LANGUAGE_CODES.join(', ')}` };
    }
    await translator.getSession(language);
    translator.setLanguage(language);
    return { success: true, language, dir: document.documentElement.dir };
  }

  private registerWebMCPTools(): void {
    // 2.3.1 Register the `switch_language` tool
  }

  private render(): void {
    const currentLang = translator.language;

    this.innerHTML = `
      <select class="lang-select" id="lang-select" aria-label="Language Selector">
        ${SUPPORTED_LANGUAGES.map(
          l => `
          <option value="${l.code}" ${l.code === currentLang ? 'selected' : ''}>
            ${l.nativeName}
          </option>
        `
        ).join('')}
      </select>
    `;

    this.selectEl = this.querySelector<HTMLSelectElement>('#lang-select');
    this.selectEl?.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLSelectElement;
      this.switchLanguage(target.value as SupportedLanguage);
    });
  }
}

customElements.define('language-picker', LanguagePicker);
