import { flushSync } from "react-dom";

/** Which choreography in `src/styles/index.css` a transition uses. */
export type TransitionKind = "page" | "filter";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

let latest = 0;

/**
 * Run a state update inside a view transition, so the browser can animate
 * from the old layout to the new one. Browsers without the API (and every
 * failure) fall back to the plain update.
 */
export function withTransition(kind: TransitionKind, update: () => void) {
  const doc = document as ViewTransitionDocument;
  if (!doc.startViewTransition) {
    update();
    return;
  }
  const root = document.documentElement;
  const id = ++latest;
  root.dataset.transition = kind;
  const transition = doc.startViewTransition(() => flushSync(update));
  // A newer transition skips this one; only the latest clears the flag.
  transition.finished.finally(() => {
    if (id === latest) delete root.dataset.transition;
  });
}

/** A unique, CSS-safe view-transition-name for a card. */
export function transitionName(prefix: string, id: string) {
  return `${prefix}-${id.replace(/[^\w-]/g, "-")}`;
}
