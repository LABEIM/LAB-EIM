export type ResolvedMedia =
  | { kind: 'iframe'; src: string; provider: 'youtube' | 'vimeo' | 'drive'; id: string }
  | { kind: 'video'; src: string };

const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com']);
const YOUTU_BE_HOSTS = new Set(['youtu.be', 'www.youtu.be']);
const YOUTUBE_ID = /^[A-Za-z0-9_-]{6,}$/;
const VIMEO_HOSTS = new Set(['vimeo.com', 'www.vimeo.com']);
const DRIVE_HOSTS = new Set(['drive.google.com']);
const DRIVE_ID = /^[A-Za-z0-9_-]+$/;
const VIDEO_EXTENSIONS = /\.(mp4|webm|ogv)$/i;
const UNSAFE_IMAGE_EXTENSIONS = /\.(js|html|svg|pdf|zip)$/i;
const IPV4_LITERAL = /^\d{1,3}(?:\.\d{1,3}){3}$/;

// Untrusted links become iframe/img src, so only absolute https URLs get through.
// `//host` throws in the URL constructor without a base and returns null here.
// The WHATWG parser normalises every IPv4 spelling to a dotted quad and keeps
// IPv6 brackets in `hostname`, so both literals are caught here. A LAN or
// loopback literal would otherwise make each visitor's browser probe that host.
function parseHttps(raw: string | undefined | null): URL | null {
  if (typeof raw !== 'string') return null;
  const value = raw.trim();
  if (!value) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  if (url.hostname.startsWith('[') || IPV4_LITERAL.test(url.hostname)) return null;
  return url;
}

// mute=1 is required for autoplay; loop=1 only loops when playlist repeats the id.
function youtubeEmbed(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}`;
}

export type IframeMedia = Extract<ResolvedMedia, { kind: 'iframe' }>;

// A loop that ships with the site (public/…) is referenced by a root-relative
// path, so preview and production read the same file. `//host` and `/\host` are
// protocol-relative URLs, hence the lookahead.
const LOCAL_VIDEO_PATH = /^\/(?!\/)[A-Za-z0-9._\-/]+\.(?:mp4|webm|ogv)$/i;

export function resolveVideoUrl(raw: string | undefined | null): ResolvedMedia | null {
  if (typeof raw !== 'string') return null;
  const value = raw.trim();
  if (LOCAL_VIDEO_PATH.test(value) && !value.includes('..')) return { kind: 'video', src: value };

  const url = parseHttps(value);
  if (!url) return null;

  const host = url.hostname;
  const segments = url.pathname.split('/').filter(Boolean);

  if (YOUTU_BE_HOSTS.has(host)) {
    const id = segments[0];
    if (id && YOUTUBE_ID.test(id)) {
      return { kind: 'iframe', provider: 'youtube', src: youtubeEmbed(id), id };
    }
    return null;
  }

  if (YOUTUBE_HOSTS.has(host)) {
    const id = url.pathname === '/watch'
      ? url.searchParams.get('v')
      : segments[0] === 'shorts' || segments[0] === 'embed'
        ? segments[1]
        : null;
    if (id && YOUTUBE_ID.test(id)) {
      return { kind: 'iframe', provider: 'youtube', src: youtubeEmbed(id), id };
    }
    return null;
  }

  if (VIMEO_HOSTS.has(host)) {
    const id = segments[0];
    if (id && /^\d+$/.test(id)) {
      return { kind: 'iframe', provider: 'vimeo', src: `https://player.vimeo.com/video/${id}`, id };
    }
    return null;
  }

  if (host === 'player.vimeo.com') {
    const id = segments[0] === 'video' ? segments[1] : undefined;
    if (id && /^\d+$/.test(id)) {
      return { kind: 'iframe', provider: 'vimeo', src: `https://player.vimeo.com/video/${id}`, id };
    }
    return null;
  }

  if (DRIVE_HOSTS.has(host)) {
    const id = segments[0] === 'file' && segments[1] === 'd'
      ? segments[2]
      : url.pathname === '/open'
        ? url.searchParams.get('id')
        : null;
    if (id && DRIVE_ID.test(id)) {
      return { kind: 'iframe', provider: 'drive', src: `https://drive.google.com/file/d/${id}/preview`, id };
    }
    return null;
  }

  if (VIDEO_EXTENSIONS.test(url.pathname)) {
    return { kind: 'video', src: url.href };
  }

  return null;
}

// The stage embed runs unattended: muted, looping, and stripped of controls so
// the overlay button owns every click. Drive's preview cannot autoplay or loop,
// so it keeps the plain preview URL.
export function buildBackgroundEmbed(media: IframeMedia): string {
  if (media.provider === 'youtube') {
    return `${media.src}&controls=0&rel=0&playsinline=1`;
  }
  if (media.provider === 'vimeo') {
    return `${media.src}?autoplay=1&muted=1&loop=1&background=1`;
  }
  return media.src;
}

// The click-through player starts on the visitor's gesture, so it can play with
// sound and keeps its controls. Direct video files never reach these builders.
export function buildPlayerEmbed(media: IframeMedia): string {
  if (media.provider === 'youtube') {
    return `https://www.youtube-nocookie.com/embed/${media.id}?autoplay=1&rel=0&playsinline=1`;
  }
  if (media.provider === 'vimeo') {
    return `${media.src}?autoplay=1&rel=0`;
  }
  return media.src;
}

export interface RevealVideoPlan {
  /** Native <video> src, from a direct background link. */
  nativeSrc: string | null;
  /** Controls stay only when no embed provides the click-to-open modal. */
  controls: boolean;
  /** Background iframe src from a provider link, when no native source exists. */
  backgroundSrc: string | null;
  /** Click-to-open player src; also gates the overlay and modal. */
  playerSrc: string | null;
}

// The intro has two roles: `backgroundUrl` loops as the background, and
// `videoUrl`'s embeddable link opens in the modal. A direct `videoUrl` file only
// stands in as background when `backgroundUrl` is empty.
export function planRevealVideo(
  backgroundUrl: string | undefined | null,
  videoUrl: string | undefined | null
): RevealVideoPlan {
  const playerResolved = resolveVideoUrl(videoUrl);
  const playerEmbed = playerResolved?.kind === 'iframe' ? playerResolved : null;
  const backgroundResolved = resolveVideoUrl(backgroundUrl);
  const fallback = !backgroundResolved ? playerResolved : null;

  const nativeSrc =
    (backgroundResolved?.kind === 'video' ? backgroundResolved.src : null) ??
    (fallback?.kind === 'video' ? fallback.src : null);

  const backgroundEmbed =
    backgroundResolved?.kind === 'iframe' ? backgroundResolved : !backgroundResolved ? playerEmbed : null;

  return {
    nativeSrc,
    controls: !playerEmbed,
    backgroundSrc: backgroundEmbed ? buildBackgroundEmbed(backgroundEmbed) : null,
    playerSrc: playerEmbed ? buildPlayerEmbed(playerEmbed) : null,
  };
}

export function resolveExternalImageUrl(raw: string | undefined | null): string | null {
  if (typeof raw !== 'string') return null;
  const url = parseHttps(raw);
  if (!url) return null;
  if (UNSAFE_IMAGE_EXTENSIONS.test(url.pathname)) return null;
  return url.href;
}
