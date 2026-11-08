/**
 * Binary 0/1 field behind the hero.
 *
 * Plain DOM script (no framework, no hydration): Astro bundles this as a
 * deferred module on the homepage, so the effect runs whenever JS is enabled.
 *
 * Sparse by design: only short-lived, drifting digits are painted — the
 * background itself stays clean, like the Antigravity reference.
 */

/** Grid step in CSS px the digits are sampled on. */
const CELL = 18;
const MAX_DPR = 1.5;
const INFLUENCE_RADIUS = 200;
const MAX_ACTIVE_CELLS = 240;
const MIN_FRAME_MS = 1000 / 30;

/* Ambient sprinkle: ~2 new digits per frame give roughly 4% coverage. */
const AMBIENT_SPAWNS = 2;
const AMBIENT_ALPHA = 0.8;
const AMBIENT_TTL = 1500;
const AMBIENT_TTL_VAR = 1300;

/* Cursor cluster: denser while the pointer moves over the hero. */
const FOLLOW_CHANCE = 0.012;
const FOLLOW_TTL = 450;
const FOLLOW_TTL_VAR = 750;

/** Digits drift upward while they fade out. */
const DRIFT_SPEED = 0.012;
const FADE_IN_MS = 200;
const FADE_OUT_MS = 400;

interface Palette {
  bright: string;
  mono: string;
}

interface Cell {
  born: number;
  until: number;
}

function readPalette(canvas: HTMLCanvasElement): Palette {
  const styles = getComputedStyle(canvas);
  const ink = styles.color;
  return {
    bright: styles.getPropertyValue('--color-brand-bright').trim() || ink,
    mono: styles.getPropertyValue('--font-mono').trim() || 'monospace',
  };
}

export function initBinaryField(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('.eim-hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const followQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

  let palette = readPalette(canvas);
  let width = 0;
  let height = 0;
  let cols = 0;
  let rows = 0;
  let dpr = 1;
  let layer = document.createElement('canvas');
  const active = new Map<number, Cell>();

  let smoothX = 0;
  let smoothY = 0;
  let targetX = 0;
  let targetY = 0;
  let pointerReady = false;
  let following = false;

  let visible = true;
  let reduced = reduceQuery.matches;
  let running = false;
  let rafId = 0;
  let lastFrame = 0;

  function paintGlyphs(
    target: CanvasRenderingContext2D,
    color: string,
    alpha: number
  ): void {
    target.setTransform(dpr, 0, 0, dpr, 0, 0);
    target.font = `500 ${Math.round(CELL * 0.72)}px ${palette.mono}`;
    target.textAlign = 'center';
    target.textBaseline = 'middle';
    target.fillStyle = color;
    target.globalAlpha = alpha;
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        target.fillText(
          Math.random() < 0.5 ? '0' : '1',
          col * CELL + CELL / 2,
          row * CELL + CELL / 2
        );
      }
    }
    target.globalAlpha = 1;
  }

  /** Rebuilds the glyph layer. Runs on mount, resize and font load. */
  function rebuild(): void {
    const rect = canvas.getBoundingClientRect();
    width = Math.round(rect.width);
    height = Math.round(rect.height);
    if (width <= 0 || height <= 0) {
      cols = 0;
      rows = 0;
      active.clear();
      pointerReady = false;
      return;
    }

    palette = readPalette(canvas);
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    cols = Math.ceil(width / CELL);
    rows = Math.ceil(height / CELL);

    layer = document.createElement('canvas');
    layer.width = canvas.width;
    layer.height = canvas.height;

    const layerCtx = layer.getContext('2d');
    if (!layerCtx) {
      cols = 0;
      rows = 0;
      return;
    }
    /* Transparent background: only glyph pixels are copied when drawn. */
    paintGlyphs(layerCtx, palette.bright, 0.85);

    active.clear();
    pointerReady = false;
  }

  function clearFrame(): void {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  /** Reduced motion: a static sprinkle instead of an animation. */
  function paintStatic(): void {
    clearFrame();
    if (!reduced || cols <= 0 || rows <= 0) return;
    const count = Math.round(cols * rows * 0.04);
    ctx.globalAlpha = AMBIENT_ALPHA;
    for (let i = 0; i < count; i += 1) {
      const col = Math.floor(Math.random() * cols);
      const row = Math.floor(Math.random() * rows);
      ctx.drawImage(
        layer,
        col * CELL * dpr,
        row * CELL * dpr,
        CELL * dpr,
        CELL * dpr,
        col * CELL * dpr,
        row * CELL * dpr,
        CELL * dpr,
        CELL * dpr
      );
    }
    ctx.globalAlpha = 1;
  }

  function paint(now: number): void {
    clearFrame();
    for (const [index, cell] of active) {
      if (cell.until <= now) {
        active.delete(index);
        continue;
      }
      const age = now - cell.born;
      const fade = Math.min(1, age / FADE_IN_MS, (cell.until - now) / FADE_OUT_MS);
      if (fade <= 0) continue;

      const col = index % cols;
      const row = Math.floor(index / cols);
      const driftY = -age * DRIFT_SPEED;
      ctx.globalAlpha = (following ? 1 : AMBIENT_ALPHA) * fade;
      ctx.drawImage(
        layer,
        col * CELL * dpr,
        row * CELL * dpr,
        CELL * dpr,
        CELL * dpr,
        col * CELL * dpr,
        row * CELL * dpr + driftY * dpr,
        CELL * dpr,
        CELL * dpr
      );
    }
    ctx.globalAlpha = 1;
  }

  function addCell(index: number, now: number, ttl: number): void {
    if (active.size >= MAX_ACTIVE_CELLS || active.has(index)) return;
    active.set(index, { born: now, until: now + ttl });
  }

  function spawnAmbient(now: number): void {
    for (let i = 0; i < AMBIENT_SPAWNS; i += 1) {
      const col = Math.floor(Math.random() * cols);
      const row = Math.floor(Math.random() * rows);
      addCell(row * cols + col, now, AMBIENT_TTL + Math.random() * AMBIENT_TTL_VAR);
    }
  }

  function spawnFollow(now: number): void {
    const minCol = Math.max(0, Math.floor((smoothX - INFLUENCE_RADIUS) / CELL));
    const maxCol = Math.min(cols - 1, Math.ceil((smoothX + INFLUENCE_RADIUS) / CELL));
    const minRow = Math.max(0, Math.floor((smoothY - INFLUENCE_RADIUS) / CELL));
    const maxRow = Math.min(rows - 1, Math.ceil((smoothY + INFLUENCE_RADIUS) / CELL));

    for (let row = minRow; row <= maxRow; row += 1) {
      for (let col = minCol; col <= maxCol; col += 1) {
        const distance = Math.hypot(
          col * CELL + CELL / 2 - smoothX,
          row * CELL + CELL / 2 - smoothY
        );
        if (distance > INFLUENCE_RADIUS) continue;
        if (Math.random() >= FOLLOW_CHANCE * (1 - distance / INFLUENCE_RADIUS)) continue;
        addCell(row * cols + col, now, FOLLOW_TTL + Math.random() * FOLLOW_TTL_VAR);
      }
    }
  }

  function tick(now: number): void {
    rafId = window.requestAnimationFrame(tick);
    if (now - lastFrame < MIN_FRAME_MS) return;
    lastFrame = now;

    if (following && pointerReady) {
      smoothX += (targetX - smoothX) * 0.1;
      smoothY += (targetY - smoothY) * 0.1;
      spawnFollow(now);
    }
    spawnAmbient(now);
    paint(now);
  }

  function shouldRun(): boolean {
    return visible && !document.hidden && !reduced && cols > 0 && rows > 0;
  }

  function start(): void {
    if (running || !shouldRun()) return;
    running = true;
    lastFrame = 0;
    rafId = window.requestAnimationFrame(tick);
  }

  function stop(): void {
    if (!running) return;
    running = false;
    window.cancelAnimationFrame(rafId);
  }

  function sync(): void {
    if (shouldRun()) start();
    else stop();
  }

  function onPointerMove(event: PointerEvent): void {
    if (!followQuery.matches || cols <= 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      resetFollow();
      return;
    }
    targetX = x;
    targetY = y;
    if (!pointerReady) {
      smoothX = x;
      smoothY = y;
      pointerReady = true;
    }
    following = true;
  }

  /** Cursor left the canvas or the window (other monitor, browser chrome):
      fall back to the idle drift instead of glowing at a stale point. */
  function resetFollow(): void {
    following = false;
    pointerReady = false;
  }

  function onReducedMotionChange(): void {
    reduced = reduceQuery.matches;
    if (reduced) {
      stop();
      paintStatic();
    } else {
      sync();
    }
  }

  function onResize(): void {
    rebuild();
    paintStatic();
    sync();
  }

  /* Monitor moves can change devicePixelRatio without a CSS-size change:
     re-arm a resolution query so the backing store re-samples the DPR. */
  let dprMedia: MediaQueryList | null = null;

  function onDprChange(): void {
    watchDpr();
    rebuild();
    paintStatic();
    sync();
  }

  function watchDpr(): void {
    dprMedia?.removeEventListener('change', onDprChange);
    dprMedia = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    dprMedia.addEventListener('change', onDprChange);
  }

  const intersection = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    sync();
  });
  const resize = new ResizeObserver(onResize);

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', resetFollow);
  window.addEventListener('blur', resetFollow);
  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', sync);
  reduceQuery.addEventListener('change', onReducedMotionChange);

  rebuild();
  watchDpr();
  paintStatic();
  intersection.observe(canvas);
  resize.observe(canvas);
  sync();

  if (document.fonts) {
    void document.fonts.ready.then(() => {
      rebuild();
      paintStatic();
      sync();
    });
  }
}
