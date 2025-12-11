'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';
import { styleCollector } from './style-collector';

/**
 * StyleRegistry provides styled-components SSR support for Waku.
 *
 * Usage:
 * 1. Wrap your styled components with StyleRegistry
 * 2. Use withStyles in server-entry.tsx to inject collected styles
 */
export function StyleRegistry({ children }: { children: ReactNode }) {
  if (import.meta.env.SSR) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [sheet] = useState(() => {
      const newSheet = new ServerStyleSheet();
      styleCollector.set(newSheet);
      return newSheet;
    });

    return (
      <StyleSheetManager sheet={sheet.instance}>{children}</StyleSheetManager>
    );
  }

  return <>{children}</>;
}
