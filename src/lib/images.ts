/**
 * Central image catalogue for VITALIS.
 *
 * Every photo is served from a public CDN URL, so the site does NOT depend on
 * binary files inside `public/`. This keeps deploys working even when the
 * project is downloaded/exported without images (text-only archives).
 */

const px = (id: number, w = 1200, h = 800) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

export const IMAGES = {
  /** Atleta con cuerdas de batalla en el gimnasio (retrato, Hero) */
  hero: px(12890807, 900, 1200),
  /** Hombre preparándose para levantar una barra pesada */
  strength: px(2261477),
  /** Boles de ensalada saludables vistos desde arriba */
  nutrition: px(7660437),
  /** Yoga sobre un mar de nubes en la montaña */
  mind: px(13849092),
  /** Clase de fitness en grupo en un estudio moderno */
  community: px(7894538),
  /** Salto al cajón en un gimnasio industrial */
  workoutHiit: px(7675405),
  /** Poke bowl de salmón con aguacate */
  recipeProtein: px(8286764),
  /** Bol de desayuno con fruta, avena y granola */
  recipeBowl: px(12174224),
} as const;

/** Legacy local paths (older builds / values stored in the database). */
const LEGACY_PATHS: Record<string, string> = {
  "/images/hero.jpg": IMAGES.hero,
  "/images/strength.jpg": IMAGES.strength,
  "/images/nutrition.jpg": IMAGES.nutrition,
  "/images/mind.jpg": IMAGES.mind,
  "/images/community.jpg": IMAGES.community,
  "/images/workout-hiit.jpg": IMAGES.workoutHiit,
  "/images/recipe-protein.jpg": IMAGES.recipeProtein,
  "/images/recipe-bowl.jpg": IMAGES.recipeBowl,
};

/**
 * Converts any image value (legacy `/images/...` path, `/images/pexels/...`
 * path or absolute URL) into a URL that works without `public/` assets.
 */
export function resolveImage(src: string | null | undefined, fallback: string = IMAGES.strength): string {
  if (!src) return fallback;
  if (LEGACY_PATHS[src]) return LEGACY_PATHS[src];

  const pexelsLocal = src.match(/^\/images\/pexels\/(food|exercise)-(\d+)\.jpg$/);
  if (pexelsLocal) {
    const [, kind, id] = pexelsLocal;
    return kind === "food"
      ? px(Number(id), 1200, 627)
      : `https://images.pexels.com/videos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=630`;
  }

  if (src.startsWith("/images/")) return fallback;
  return src;
}

/** Elegant gradient placeholder used if a remote photo ever fails to load. */
export const IMAGE_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#190b2e"/><stop offset="50%" stop-color="#0f172a"/><stop offset="100%" stop-color="#06283d"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><circle cx="300" cy="240" r="260" fill="#a855f7" fill-opacity="0.28"/><circle cx="920" cy="560" r="280" fill="#22d3ee" fill-opacity="0.24"/></svg>`,
  );
