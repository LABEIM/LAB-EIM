import { useEffect, useRef } from 'react';

/** Cell size in CSS px — must match the fallback tile in `src/styles/pages/home-eim.css`. */
const CELL = 18;
const MAX_DPR = 1.5;
const INFLUENCE_RADIUS = 200;
const MAX_ACTIVE_CELLS = 300;
const IDLE_BRIGHTNESS = 0.4;
const MIN_FRAME_MS = 1000 / 30;

interface Palette {
  background: string;
  dim: string;
  bright: string;
  mono: string;
}

function readPalette(canvas: HTMLCanvasElement): Palette {
  const styles = getComputedStyle(canvas);
  const ink = styles.color;
  const hero = canvas.closest('.eim-hero');
  return {
    background: hero ? getComputedStyle(hero).backgroundColor : 'transparent',
    dim: styles.getPropertyValue('--color-brand').trim() || ink,
    bright: styles.getPropertyValue('--color-brand-bright').trim() || ink,
    mono: styles.getPropertyValue('--font-mono').trim() || 'monospace',
  };
}

export default function BinaryField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasNode = canvasRef.current;
    if (!canvasNode) return;
    const context = canvasNode.getContext('2d');
    if (!context) return;
    /* Non-null aliases: nested function declarations lose the guard narrowing. */
    const canvas = canvasNode;
    const ctx = context;

    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const followQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

    let palette = readPalette(canvas);
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let dpr = 1;
    let baseLayer = document.createElement('canvas');
    let brightLayer = document.createElement('canvas');
    const active = new Map<number, number>();

    let smoothX = 0;
    let smoothY = 0;
    let targetX = 0;
    let targetY = 0;
    let pointerReady = false;
    let following = false;
    let idleX = 0;
    let idleY = 0;
    let idleUntil = 0;

    let visible = true;
    let reduced = reduceQuery.matches;
    let running = false;
    let disposed = false;
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

    /** Rebuilds both offscreen layers. Runs on mount, resize and font load. */
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

      baseLayer = document.createElement('canvas');
      baseLayer.width = canvas.width;
      baseLayer.height = canvas.height;
      brightLayer = document.createElement('canvas');
      brightLayer.width = canvas.width;
      brightLayer.height = canvas.height;

      const baseCtx = baseLayer.getContext('2d');
      const brightCtx = brightLayer.getContext('2d');
      if (!baseCtx || !brightCtx) {
        cols = 0;
        rows = 0;
        return;
      }

      baseCtx.fillStyle = palette.background;
      baseCtx.fillRect(0, 0, canvas.width, canvas.height);
      paintGlyphs(baseCtx, palette.dim, 0.14);
      /* Opaque background so a bright cell fully replaces its dim counterpart. */
      brightCtx.fillStyle = palette.background;
      brightCtx.fillRect(0, 0, canvas.width, canvas.height);
      paintGlyphs(brightCtx, palette.bright, 0.5);

      active.clear();
      pointerReady = false;
    }

    function paintStatic(): void {
      if (cols <= 0 || rows <= 0) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(baseLayer, 0, 0);
    }

    function paint(now: number): void {
      paintStatic();
      for (const [index, until] of active) {
        if (until <= now) active.delete(index);
      }
      if (reduced || active.size === 0) return;

      ctx.globalAlpha = following ? 1 : IDLE_BRIGHTNESS;
      for (const index of active.keys()) {
        const col = index % cols;
        const row = Math.floor(index / cols);
        ctx.drawImage(
          brightLayer,
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

    function addCell(index: number, now: number, ttl: number): void {
      if (active.size >= MAX_ACTIVE_CELLS || active.has(index)) return;
      active.set(index, now + ttl);
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
          if (Math.random() >= 0.06 * (1 - distance / INFLUENCE_RADIUS)) continue;
          addCell(row * cols + col, now, 450 + Math.random() * 750);
        }
      }
    }

    function spawnIdle(now: number): void {
      if (now >= idleUntil) {
        idleX = Math.random() * width;
        idleY = Math.random() * height;
        idleUntil = now + 900 + Math.random() * 700;
      }
      for (let i = 0; i < 70; i += 1) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        if (Math.hypot(x - idleX, y - idleY) > INFLUENCE_RADIUS * 1.2) continue;
        if (Math.random() >= 0.3) continue;
        const col = Math.min(cols - 1, Math.floor(x / CELL));
        const row = Math.min(rows - 1, Math.floor(y / CELL));
        addCell(row * cols + col, now, 500 + Math.random() * 700);
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
      } else {
        spawnIdle(now);
      }
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
        if (disposed) return;
        rebuild();
        paintStatic();
        sync();
      });
    }

    return () => {
      disposed = true;
      stop();
      intersection.disconnect();
      resize.disconnect();
      dprMedia?.removeEventListener('change', onDprChange);
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', resetFollow);
      window.removeEventListener('blur', resetFollow);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', sync);
      reduceQuery.removeEventListener('change', onReducedMotionChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="eim-hero-canvas" aria-hidden="true" />;
}
