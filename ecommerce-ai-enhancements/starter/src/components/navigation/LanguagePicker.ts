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
  type SupportedLanguage,
} from '../../ai/translator.ts';

export class LanguagePicker extends HTMLElement {
  private unsubscribe: (() => void) | null = null;
  private selectEl: HTMLSelectElement | null = null;

  public connectedCallback(): void {
    this.render();
    this.unsubscribe = translator.subscribe((lang) => {
      if (this.selectEl && this.selectEl.value !== lang) {
        this.selectEl.value = lang;
      }
    });
  }

  public disconnectedCallback(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
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
