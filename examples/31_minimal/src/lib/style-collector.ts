import type { ServerStyleSheet } from 'styled-components';

const STYLE_SHEET_KEY = '__WAKU_STYLE_SHEET__';

/**
 * StyleCollector bridges between SSR environment (where styled-components runs)
 * and RSC environment (where server-entry.tsx runs).
 *
 * Uses globalThis to share the ServerStyleSheet instance between RSC and SSR
 * environments since they run in separate module contexts but share the same process.
 *
 * Supports streaming CSS-in-JS by storing the sheet instance directly,
 * allowing incremental style collection during streaming.
 */
class StyleCollector {
  /**
   * Set the ServerStyleSheet instance.
   * Called from SSR environment where the sheet is created.
   */
  set(sheet: ServerStyleSheet): void {
    (globalThis as Record<string, unknown>)[STYLE_SHEET_KEY] = sheet;
  }

  /**
   * Get styles collected so far and clear the sheet for incremental collection.
   * Can be called multiple times during streaming.
   */
  collect(): string {
    const sheet = (globalThis as Record<string, unknown>)[STYLE_SHEET_KEY] as
      | ServerStyleSheet
      | undefined;
    if (!sheet) {
      return '';
    }
    const styles = sheet.getStyleTags();
    if (styles) {
      sheet.instance.clearTag();
    }
    return styles;
  }
}

export const styleCollector = new StyleCollector();
