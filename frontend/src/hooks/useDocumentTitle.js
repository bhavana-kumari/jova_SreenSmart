/**
 * hooks/useDocumentTitle.js
 * -------------------------
 * Tiny helper to set the browser tab title per page.
 */

import { useEffect } from "react";

export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · ScreenSmart` : "ScreenSmart";
    return () => {
      document.title = previous;
    };
  }, [title]);
}
