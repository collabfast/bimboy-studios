import { useCallback, useEffect, useState } from "react";

// Viewer mode is a client-side flag identifying whether the current viewer is a
// fan or a creator/pornstar. There is no user<->creator auth link yet (see
// Task #5/#6), so creator-only affordances such as the CollabFast link are gated
// on this localStorage-backed flag combined with an authenticated session.
export type ViewerMode = "fan" | "creator";

const STORAGE_KEY = "bimboy.viewerMode";
const EVENT = "bimboy:viewer-mode-change";

function read(): ViewerMode {
  if (typeof window === "undefined") return "fan";
  return window.localStorage.getItem(STORAGE_KEY) === "creator"
    ? "creator"
    : "fan";
}

export function useViewerMode(): {
  mode: ViewerMode;
  isCreator: boolean;
  setMode: (mode: ViewerMode) => void;
  toggle: () => void;
} {
  const [mode, setModeState] = useState<ViewerMode>(read);

  useEffect(() => {
    const sync = () => setModeState(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setMode = useCallback((next: ViewerMode) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event(EVENT));
    setModeState(next);
  }, []);

  const toggle = useCallback(() => {
    setMode(read() === "creator" ? "fan" : "creator");
  }, [setMode]);

  return { mode, isCreator: mode === "creator", setMode, toggle };
}
