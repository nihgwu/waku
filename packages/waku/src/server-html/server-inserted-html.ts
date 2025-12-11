/**
 * Internal SSR utilities for server-inserted HTML.
 * This module provides the context and rendering utilities for collecting
 * and injecting HTML content (like CSS-in-JS styles) during streaming SSR.
 */

import { Fragment, createElement } from 'react';
import type { JSX, ReactNode } from 'react';
import { renderToReadableStream } from 'react-dom/server.edge';
import { ServerInsertedHTMLContext } from './context.js';
import { streamToString } from './stream-transforms.js';

/**
 * Creates the provider and render function for server-inserted HTML.
 * This is used internally by Waku's SSR rendering pipeline.
 */
export function createServerInsertedHTML(): {
  ServerInsertedHTMLProvider: ({
    children,
  }: {
    children: JSX.Element;
  }) => JSX.Element;
  renderServerInsertedHTML: () => ReactNode;
} {
  const serverInsertedHTMLCallbacks: Array<() => ReactNode> = [];

  const addInsertedHtml = (handler: () => ReactNode) => {
    serverInsertedHTMLCallbacks.push(handler);
  };

  return {
    ServerInsertedHTMLProvider({ children }: { children: JSX.Element }) {
      return createElement(
        ServerInsertedHTMLContext.Provider,
        { value: addInsertedHtml },
        children,
      );
    },
    renderServerInsertedHTML() {
      return serverInsertedHTMLCallbacks.map((callback, index) =>
        createElement(
          Fragment,
          { key: '__waku_server_inserted__' + index },
          callback(),
        ),
      );
    },
  };
}

/**
 * Creates a function that renders server-inserted HTML to a string.
 * This is used to inject CSS-in-JS styles and other content during streaming.
 */
export function makeGetServerInsertedHTML(
  renderServerInsertedHTML: () => ReactNode,
): () => Promise<string> {
  return async function getServerInsertedHTML(): Promise<string> {
    const serverInsertedHTML = renderServerInsertedHTML();

    // Skip rendering if there's nothing to insert
    if (
      serverInsertedHTML === null ||
      serverInsertedHTML === undefined ||
      (Array.isArray(serverInsertedHTML) && serverInsertedHTML.length === 0)
    ) {
      return '';
    }

    // Render the collected HTML to a stream and convert to string
    const stream = await renderToReadableStream(
      createElement(Fragment, null, serverInsertedHTML),
      {
        // Larger chunk size since this isn't sent over the network
        progressiveChunkSize: 1024 * 1024,
      },
    );

    return streamToString(stream);
  };
}
