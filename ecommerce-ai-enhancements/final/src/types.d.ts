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

/*
 * Web platform types come from the generated `modern-web-types` (aliased to `@typescript/lib-dom`) and `webmcp-types` packages, which cover the built-in AI APIs, the Navigation API, `Element.moveBefore()`, `Document.modelContext`, and the `WebMCP` namespace.
 * This file declares only the parts of shipped specifications that those packages leave out.
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
       * Chrome requires `inputObject` to be a pre-serialized JSON string.
       *
       * Signature from the specification:
       *
       * ```webidl
       * Promise<DOMString> executeTool(
       *     RegisteredTool tool,
       *     optional any inputObject,
       *     optional ModelContextExecuteToolOptions options = {});
       * ```
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
