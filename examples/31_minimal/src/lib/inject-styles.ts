/**
 * Utility to inject content (like CSS) before the closing </head> tag in an HTML stream.
 * This enables CSS-in-JS libraries like styled-components to work with streaming SSR
 * without modifying Waku.
 *
 * Supports streaming CSS-in-JS where styles may be added during streaming
 * (e.g., when Suspense boundaries resolve and render new styled components).
 */

import { styleCollector } from './style-collector';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Number of characters to buffer to handle </head> split across chunks
const OVERLAP = '</head>'.length - 1;

/**
 * Transforms an HTML Response stream to inject content before </head>.
 * Supports streaming by calling getContent on every chunk.
 *
 * - Before </head> is found: accumulates content and injects before </head>
 * - After </head> is found: injects content inline (for streaming CSS-in-JS)
 *
 * @param response - The Response object from renderHtml
 * @param getContent - Function called on every chunk to get content to inject
 * @returns A new Response with the transformed stream
 */
export async function injectBeforeHead(
  response: Response,
  getContent: () => string,
): Promise<Response> {
  const body = response.body;
  if (!body) {
    return response;
  }

  let found = false;
  let pending = '';
  let toInsert = '';

  const transformStream = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      // Get any new content to inject
      const content = getContent();

      // After </head> is found, inject content inline and pass through
      if (found) {
        if (content) {
          controller.enqueue(encoder.encode(content));
        }
        controller.enqueue(chunk);
        return;
      }

      // Accumulate content to insert before </head>
      if (content) {
        toInsert += content;
      }

      // Combine pending buffer with current chunk to search for </head>
      const decoded = decoder.decode(chunk, { stream: true });
      const text = pending ? pending + decoded : decoded;
      const idx = text.indexOf('</head>');

      if (idx !== -1) {
        // Found </head>, insert accumulated content before it
        controller.enqueue(
          encoder.encode(text.slice(0, idx) + toInsert + text.slice(idx)),
        );
        found = true;
        pending = '';
        toInsert = '';
      } else if (text.length > OVERLAP) {
        // Buffer last chars in case </head> is split across chunks
        controller.enqueue(encoder.encode(text.slice(0, -OVERLAP)));
        pending = text.slice(-OVERLAP);
      } else {
        // Chunk too small, buffer entirely
        pending = text;
      }
    },

    flush(controller) {
      // Get any final content
      const content = getContent();
      const remaining = toInsert + pending + content;
      if (remaining) {
        controller.enqueue(encoder.encode(remaining));
      }
    },
  });

  const transformedStream = body.pipeThrough(transformStream);

  return new Response(transformedStream, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

/**
 * Helper function to wrap renderHtml and automatically inject collected styles.
 * Supports streaming CSS-in-JS by collecting styles on every chunk.
 *
 * @example
 * // In server-entry.tsx:
 * import { withStyles } from './lib/inject-styles';
 *
 * if (input.type === 'custom' && input.pathname === '/') {
 *   return withStyles(() =>
 *     renderHtml({ App: <App name="Waku" /> }, <Slot id="App" />, { rscPath: '' })
 *   );
 * }
 */
export async function withStyles(
  renderFn: () => Promise<Response>,
): Promise<Response> {
  const response = await renderFn();
  return injectBeforeHead(response, () => styleCollector.collect());
}
