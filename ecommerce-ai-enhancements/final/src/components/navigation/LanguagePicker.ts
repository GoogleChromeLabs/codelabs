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

  public connectedCallback(): void {
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

  private registerWebMCPTools(): void {
    if (!document.modelContext?.registerTool) return;
    this.toolAbortController?.abort();
    this.toolAbortController = new AbortController();
    const signal = this.toolAbortController.signal;

    document.modelContext.registerTool(
      {
        name: 'switch_language',
        title: 'Change Language',
        description:
          "Switch the application's active language and document direction (LTR/RTL) using Chrome's built-in Translator API. Re-translates all visible UI components and formats numbers and currency according to the selected language locale. Use this tool when the user requests a language switch or prefers a different language.",
        inputSchema: {
          type: 'object',
          properties: {
            language: {
              type: 'string',
              enum: SUPPORTED_LANGUAGE_CODES,
              description: 'Target language code',
            },
          },
          required: ['language'],
        },
        execute: async (input: { language: SupportedLanguage }) => {
          const lang = input?.language;
          if (!lang || !SUPPORTED_LANGUAGE_CODES.includes(lang)) {
            return { success: false, error: `Invalid language code: ${lang}. Supported: ${SUPPORTED_LANGUAGE_CODES.join(', ')}` };
          }
          await translator.getSession(lang);
          translator.setLanguage(lang);
          return { success: true, language: lang, dir: document.documentElement.dir };
        },
      },
      { signal }
    );
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
      const code = target.value as SupportedLanguage;
      translator.getSession(code);
      translator.setLanguage(code);
    });
  }
}

customElements.define('language-picker', LanguagePicker);
