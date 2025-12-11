/**
 * Internal SSR utilities for server-inserted HTML.
 * This module provides the context and rendering utilities for collecting
 * and injecting HTML content (like CSS-in-JS styles) during streaming SSR.
 */

import { createContext } from 'react';
import type { ReactNode } from 'react';
export type ServerInsertedHTMLHook = (callback: () => ReactNode) => void;

/**
 * Context for collecting server-inserted HTML callbacks.
 * Used by CSS-in-JS libraries to inject styles during SSR.
 *
 * We use `React.createContext` to avoid errors from RSC checks because
 * it can't be imported directly in Server Components.
 */
export const ServerInsertedHTMLContext =
  createContext<ServerInsertedHTMLHook | null>(null);
