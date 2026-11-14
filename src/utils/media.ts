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

export function resolveVideoUrl(raw: string | undefined | null): ResolvedMedia | null {
  if (typeof raw !== 'string') return null;
  const url = parseHttps(raw);
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

// Only YouTube exposes a stable thumbnail by id; an uploaded poster covers the
// rest, and providers without either load their iframe directly on the server.
export function embedPoster(media: ResolvedMedia, poster?: string | null): string | null {
  if (media.kind !== 'iframe') return null;
  if (poster?.trim()) return poster;
  return media.provider === 'youtube' ? `https://i.ytimg.com/vi/${media.id}/hqdefault.jpg` : null;
}

export function resolveExternalImageUrl(raw: string | undefined | null): string | null {
  if (typeof raw !== 'string') return null;
  const url = parseHttps(raw);
  if (!url) return null;
  if (UNSAFE_IMAGE_EXTENSIONS.test(url.pathname)) return null;
  return url.href;
}
