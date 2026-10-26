/** The tape colors in `src/styles/index.css`, in the order they are handed out. */
const TONES = ["sage", "marigold", "river", "clay"] as const;

export type Tone = (typeof TONES)[number];

/**
 * Give each category its own tape color. Colors follow the sorted category
 * names, so a category keeps its color on every page; pass the original
 * (English) names so switching language does not repaint them.
 */
export function categoryTones(categories: string[]) {
  const sorted = [...new Set(categories)].sort();
  return (category: string): Tone =>
    TONES[Math.max(sorted.indexOf(category), 0) % TONES.length];
}
