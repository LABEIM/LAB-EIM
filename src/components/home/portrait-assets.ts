import type { ImageMetadata } from 'astro';

/**
 * Resolve a member portrait path from src/data/members.json (a public URL)
 * to the statically imported asset Astro can optimize.
 */
const portraitModules = import.meta.glob<ImageMetadata>(
  '../../../public/image/division/**/*.avif',
  { eager: true, import: 'default' }
);

const portraitByPublicPath = new Map<string, ImageMetadata>();

for (const [modulePath, image] of Object.entries(portraitModules)) {
  const publicPath = modulePath.replace(/^.*\/public/, '');
  portraitByPublicPath.set(publicPath, image);
}

export function getPortraitImage(publicPath?: string | null): ImageMetadata | undefined {
  if (!publicPath) return undefined;
  return portraitByPublicPath.get(publicPath);
}
