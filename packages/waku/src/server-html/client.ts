'use client';

import { useContext } from 'react';
import type { ReactNode } from 'react';
import { ServerInsertedHTMLContext } from './context.js';

/**
 * Hook to register HTML content to be inserted during server-side rendering.
 * This is similar to Next.js's `useServerInsertedHTML` hook.
 *
 * The callback will be called during streaming and its result will be
 * inserted into the HTML stream before the closing </head> tag.
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useState } from 'react';
 * import { useServerInsertedHTML } from 'waku/server-html';
 *
 * export function StyleRegistry({ children }) {
 *   const [styles, setStyles] = useState<string[]>([]);
 *
 *   useServerInsertedHTML(() => {
 *     if (styles.length === 0) return null;
 *     const html = styles.join('');
 *     setStyles([]);
 *     return <style dangerouslySetInnerHTML={{ __html: html }} />;
 *   });
 *
 *   return <>{children}</>;
 * }
 * ```
 */
export function useServerInsertedHTML(callback: () => ReactNode): void {
  const addInsertedServerHTMLCallback = useContext(ServerInsertedHTMLContext);
  // Should have no effects on client where there's no provider
  if (addInsertedServerHTMLCallback) {
    addInsertedServerHTMLCallback(callback);
  }
}
