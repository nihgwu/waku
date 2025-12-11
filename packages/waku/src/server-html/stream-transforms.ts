/**
 * Stream transform utilities for SSR streaming.
 * These utilities enable injection of server-inserted HTML (like CSS-in-JS styles)
 * into the HTML stream at the appropriate location.
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Number of characters to buffer to handle </head> split across chunks
const OVERLAP = '</head>'.length - 1;

/**
 * Creates a transform stream that inserts HTML content before the closing </head> tag.
 *
 * This is used for injecting server-inserted HTML during streaming SSR,
 * such as CSS-in-JS styles from libraries like styled-components or Emotion.
 *
 * The insertion function is called:
 * - Before each chunk is enqueued (to collect newly registered content)
 * - On flush (to handle any remaining content)
 *
 * @param insert - Async function that returns HTML string to insert
 */
export function createHeadInsertionTransformStream(
  insert: () => Promise<string> | string,
): TransformStream<Uint8Array, Uint8Array> {
  let found = false; // Whether </head> has been found
  let pending = ''; // Buffered chars that may contain partial </head>
  let toInsert = ''; // Accumulated content to insert before </head>

  return new TransformStream({
    async transform(chunk, controller) {
      const content = await insert();

      // After </head> is found, pass through directly
      if (found) {
        if (content) {
          controller.enqueue(encoder.encode(content));
        }
        controller.enqueue(chunk);
        return;
      }

      if (content) {
        toInsert += content;
      }

      // Combine pending buffer with current chunk to search for </head>
      const decoded = decoder.decode(chunk);
      const text = pending ? pending + decoded : decoded;
      const idx = text.indexOf('</head>');

      if (idx !== -1) {
        // Found </head>, insert accumulated content before it
        controller.enqueue(
          encoder.encode(text.slice(0, idx) + toInsert + text.slice(idx)),
        );
        found = true;
        pending = toInsert = '';
      } else if (text.length > OVERLAP) {
        // Buffer last 6 chars in case </head> is split across chunks
        controller.enqueue(encoder.encode(text.slice(0, -OVERLAP)));
        pending = text.slice(-OVERLAP);
      } else {
        // Chunk too small, buffer entirely
        pending = text;
      }
    },
    async flush(controller) {
      // Flush any remaining content (</head> was never found)
      const content = await insert();
      const remaining = toInsert + pending + content;
      if (remaining) {
        controller.enqueue(encoder.encode(remaining));
      }
    },
  });
}

/**
 * Converts a ReadableStream to a string.
 * Useful for rendering React elements to string on the server.
 */
export async function streamToString(
  stream: ReadableStream<Uint8Array>,
): Promise<string> {
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let result = '';

  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      result += decoder.decode(value, { stream: true });
    }
    result += decoder.decode();
  } finally {
    reader.releaseLock();
  }

  return result;
}
