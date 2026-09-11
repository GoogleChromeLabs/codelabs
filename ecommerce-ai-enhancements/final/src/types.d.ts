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

export {};

declare global {
  interface LanguageModelDownloadProgressEvent extends Event {
    loaded: number;
    total: number;
  }

  interface LanguageModelCreateOptions {
    systemPrompt?: string;
    expectedInputLanguages?: readonly string[];
    expectedOutputLanguages?: readonly string[];
    expectedInputs?: readonly { type: string; language: string }[];
    expectedOutputs?: readonly { type: string; language: string }[];
    outputLanguage?: string;
    monitor?: (target: EventTarget) => void;
    signal?: AbortSignal;
  }

  interface LanguageModelPromptOptions {
    responseConstraint?: Record<string, unknown>;
    expectedInputLanguages?: readonly string[];
    expectedOutputLanguages?: readonly string[];
    expectedInputs?: readonly { type: string; language: string }[];
    expectedOutputs?: readonly { type: string; language: string }[];
    outputLanguage?: string;
    signal?: AbortSignal;
  }

  interface LanguageModelSession {
    prompt(input: string, options?: LanguageModelPromptOptions): Promise<string>;
    promptStreaming(input: string, options?: LanguageModelPromptOptions): ReadableStream<string>;
    clone(): Promise<LanguageModelSession>;
    destroy(): void;
  }

  interface LanguageModelFactory {
    availability(options?: LanguageModelCreateOptions): Promise<'readily' | 'after-download' | 'no' | 'unavailable'>;
    create(options?: LanguageModelCreateOptions): Promise<LanguageModelSession>;
  }

  interface TranslatorCreateOptions {
    sourceLanguage: string;
    targetLanguage: string;
    monitor?: (target: EventTarget) => void;
    signal?: AbortSignal;
  }

  interface TranslatorSession {
    translate(input: string): Promise<string>;
    translateStreaming(input: string): ReadableStream<string>;
    destroy(): void;
  }

  interface TranslatorFactory {
    availability(options: TranslatorCreateOptions): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable' | 'readily' | 'after-download' | 'no'>;
    create(options: TranslatorCreateOptions): Promise<TranslatorSession>;
  }

  interface NavigateEvent extends Event {
    canIntercept: boolean;
    destination: { url: string; id?: string; index?: number; key?: string; sameDocument?: boolean };
    downloadRequest: string | null;
    formData: FormData | null;
    hashChange: boolean;
    info: unknown;
    navigationType: 'reload' | 'push' | 'replace' | 'traverse';
    signal: AbortSignal;
    userInitiated: boolean;
    intercept(options?: {
      handler?: () => Promise<void> | void;
      focusReset?: 'after-transition' | 'manual';
      scroll?: 'after-transition' | 'manual';
    }): void;
  }

  interface NavigationEventMap {
    navigate: NavigateEvent;
  }

  interface Navigation extends EventTarget {
    navigate(url: string, options?: { state?: unknown; info?: unknown; history?: 'auto' | 'push' | 'replace' }): {
      committed: Promise<void>;
      finished: Promise<void>;
    };
    addEventListener<K extends keyof NavigationEventMap>(
      type: K,
      listener: (this: Navigation, ev: NavigationEventMap[K]) => unknown,
      options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener<K extends keyof NavigationEventMap>(
      type: K,
      listener: (this: Navigation, ev: NavigationEventMap[K]) => unknown,
      options?: boolean | EventListenerOptions
    ): void;
  }

  interface Window {
    readonly LanguageModel: LanguageModelFactory;
    readonly Translator: TranslatorFactory;
    readonly navigation: Navigation;
  }

  interface Element {
    moveBefore(node: Node, child: Node | null): void;
  }

  namespace WebMCP {
    interface ModelContext {
      executeTool(tool: RegisteredTool, args: string): Promise<string>;
    }
  }
}

