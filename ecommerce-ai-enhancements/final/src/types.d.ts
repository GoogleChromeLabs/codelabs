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

/**
 * This project gets its web platform types from two generated sources, so there
 * is nothing to hand-write here:
 *
 * - `modern-web-types`, installed under the `@typescript/lib-dom` alias and
 *   enabled by `"libReplacement": true` in tsconfig.json. It replaces
 *   TypeScript's built-in `lib.dom.d.ts` with one generated from the same
 *   pipeline, but including APIs that have shipped in a single engine. That
 *   covers the built-in AI APIs (`LanguageModel`, `Translator`,
 *   `LanguageDetector`, `Summarizer`, `CreateMonitor`, `Availability`), the
 *   Navigation API, and `Element.moveBefore()`.
 * - `webmcp-types`, listed in the tsconfig `types` array, which declares
 *   `Document.modelContext` and the `WebMCP` namespace.
 *
 * Do not redeclare platform APIs in this file. Hand-written copies drift from
 * the spec and hide real errors — that is exactly the bug this file used to
 * have.
 *
 * @see https://philipwalton.com/articles/modern-web-types/
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Prompt_API
 */

declare global {
  namespace WebMCP {
    interface ModelContext {
      /**
       * Executes a tool returned by {@linkcode ModelContext.getTools}.
       *
       * This is the one genuine gap in our generated types: `executeTool()` is
       * in the WebMCP IDL and has shipped in Chrome, but `webmcp-types@0.1.6`
       * only declares `registerTool()` and `getTools()`. Remove this block once
       * the package catches up.
       *
       * The signature below is the one from the specification:
       *
       * ```webidl
       * Promise<DOMString> executeTool(
       *     RegisteredTool tool,
       *     optional any inputObject,
       *     optional ModelContextExecuteToolOptions options = {});
       * ```
       *
       * `inputObject` is typed as `unknown` rather than `object` because Chrome
       * currently requires a pre-serialized JSON string here. See the
       * compatibility note in `src/ai/catalog-semantic-filter.ts`.
       *
       * @see https://webmachinelearning.github.io/webmcp/#dom-modelcontext-executetool
       */
      executeTool(
        tool: RegisteredTool,
        inputObject?: unknown,
        options?: { signal?: AbortSignal }
      ): Promise<string>;
    }
  }
}
