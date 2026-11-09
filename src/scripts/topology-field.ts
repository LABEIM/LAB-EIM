/**
 * Sparse network topology behind the hero.
 *
 * Nodes drift slowly upward, links form between near neighbours, and packets
 * travel along those links. The composition is structural — the field encodes
 * infrastructure instead of typing digits about it — while staying as quiet as
 * the previous binary field: 30fps cap, DPR cap, paused offscreen, and a
 * static constellation under reduced motion.
 *
 * Plain DOM script (no framework, no hydration): Astro bundles this as a
 * deferred module on the homepage.
 */

const MAX_DPR = 1.5;
const MIN_FRAME_MS = 1000 / 30;

/** Roughly one node per 134x134 CSS px, clamped for small and large heroes. */
const AREA_PER_NODE = 18_000;
const MIN_NODES = 28;
const MAX_NODES = 64;

/** Links only form between nodes closer than this. */
const LINK_DIST = 210;
const LINK_ALPHA = 0.34;
const CURSOR_RADIUS = 200;
const CURSOR_ALPHA = 0.42;

const NODE_ALPHA = 0.88;
const HUB_ALPHA = 1;
const PACKET_ALPHA = 0.95;
const PACKET_COUNT = 9;
/** Progress per millisecond along a link. */
const PACKET_SPEED = 0.00035;

/** Upward drift, in CSS px per ms. */
const DRIFT_X = 0.008;
const DRIFT_Y_MIN = 0.002;
const DRIFT_Y_MAX = 0.01;

interface Palette {
  node: string;
  link: string;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hub: boolean;
}

interface Packet {
  a: Node | null;
  b: Node | null;
  t: number;
}

function readPalette(canvas: HTMLCanvasElement): Palette {
  const styles = getComputedStyle(canvas);
  const ink = styles.color;
  return {
    node: styles.getPropertyValue('--color-brand-bright').trim() || ink,
    link: styles.getPropertyValue('--color-brand').trim() || ink,
  };
}

export function initTopologyField(): void {
  const canvasQuery = document.querySelector<HTMLCanvasElement>('.eim-hero-canvas');
  if (!canvasQuery) return;
  // Typed aliases: TS does not narrow captured variables inside hoisted
  // function declarations, so give the closures non-nullable bindings.
  const canvas: HTMLCanvasElement = canvasQuery;
  const ctxQuery = canvas.getContext('2d');
  if (!ctxQuery) return;
  const ctx: CanvasRenderingContext2D = ctxQuery;

  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const followQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

  let palette = readPalette(canvas);
  let width = 0;
  let height = 0;
  let dpr = 1;
  const nodes: Node[] = [];
  const packets: Packet[] = [];

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

  function createNode(): Node {
    const hub = nodes.length > 0 && Math.random() < 0.1;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * DRIFT_X,
      vy: -(DRIFT_Y_MIN + Math.random() * (DRIFT_Y_MAX - DRIFT_Y_MIN)),
      r: hub ? 2.8 + Math.random() * 0.7 : 1.3 + Math.random() * 0.9,
      hub,
    };
  }

  function pickPair(): [Node, Node] | null {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      if (!a) return null;
      const neighbours = nodes.filter(
        (node) => node !== a && Math.hypot(node.x - a.x, node.y - a.y) < LINK_DIST
      );
      if (neighbours.length > 0) {
        return [a, neighbours[Math.floor(Math.random() * neighbours.length)]];
      }
    }
    return null;
  }

  function respawnPacket(packet: Packet): void {
    const pair = pickPair();
    packet.a = pair ? pair[0] : null;
    packet.b = pair ? pair[1] : null;
    packet.t = 0;
  }

  /** Rebuilds the node field. Runs on mount, resize and DPR changes. */
  function rebuild(): void {
    const rect = canvas.getBoundingClientRect();
    width = Math.round(rect.width);
    height = Math.round(rect.height);
    if (width <= 0 || height <= 0) {
      nodes.length = 0;
      packets.length = 0;
      pointerReady = false;
      return;
    }

    palette = readPalette(canvas);
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    const target = Math.max(
      MIN_NODES,
      Math.min(MAX_NODES, Math.round((width * height) / AREA_PER_NODE))
    );
    while (nodes.length > target) nodes.pop();
    while (nodes.length < target) nodes.push(createNode());

    packets.length = 0;
    while (packets.length < PACKET_COUNT) {
      const packet: Packet = { a: null, b: null, t: 0 };
      respawnPacket(packet);
      packets.push(packet);
    }

    pointerReady = false;
  }

  function drawLinks(): void {
    ctx.strokeStyle = palette.link;
    ctx.lineWidth = 0.8;
    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j];
        const distance = Math.hypot(b.x - a.x, b.y - a.y);
        if (distance >= LINK_DIST) continue;
        ctx.globalAlpha = (1 - distance / LINK_DIST) * LINK_ALPHA;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  function drawCursorLinks(): void {
    if (!following || !pointerReady) return;
    ctx.strokeStyle = palette.node;
    ctx.lineWidth = 0.9;
    for (const node of nodes) {
      const distance = Math.hypot(node.x - smoothX, node.y - smoothY);
      if (distance >= CURSOR_RADIUS) continue;
      ctx.globalAlpha = (1 - distance / CURSOR_RADIUS) * CURSOR_ALPHA;
      ctx.beginPath();
      ctx.moveTo(smoothX, smoothY);
      ctx.lineTo(node.x, node.y);
      ctx.stroke();
    }
  }

  function drawNodes(): void {
    ctx.fillStyle = palette.node;
    for (const node of nodes) {
      ctx.globalAlpha = node.hub ? HUB_ALPHA : NODE_ALPHA;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPackets(dt: number): void {
    ctx.fillStyle = palette.node;
    ctx.strokeStyle = palette.node;
    ctx.lineWidth = 1.2;
    for (const packet of packets) {
      if (!packet.a || !packet.b) continue;
      packet.t += dt * PACKET_SPEED;
      if (
        packet.t >= 1 ||
        Math.hypot(packet.b.x - packet.a.x, packet.b.y - packet.a.y) > LINK_DIST * 1.3
      ) {
        respawnPacket(packet);
        continue;
      }
      const x = packet.a.x + (packet.b.x - packet.a.x) * packet.t;
      const y = packet.a.y + (packet.b.y - packet.a.y) * packet.t;
      // Short trail so the dot reads as a travelling packet, not a stray node.
      const tail = Math.max(0, packet.t - 0.05);
      ctx.globalAlpha = PACKET_ALPHA * 0.35;
      ctx.beginPath();
      ctx.moveTo(
        packet.a.x + (packet.b.x - packet.a.x) * tail,
        packet.a.y + (packet.b.y - packet.a.y) * tail
      );
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.globalAlpha = PACKET_ALPHA;
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function clearFrame(): void {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  /** Reduced motion: one static constellation instead of an animation. */
  function paintStatic(): void {
    clearFrame();
    if (nodes.length === 0) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawLinks();
    drawNodes();
    ctx.globalAlpha = 1;
  }

  function step(dt: number): void {
    for (const node of nodes) {
      node.x += node.vx * dt;
      node.y += node.vy * dt;
      if (node.y < -24) node.y = height + 24;
      if (node.y > height + 24) node.y = -24;
      if (node.x < -24) node.x = width + 24;
      if (node.x > width + 24) node.x = -24;
    }
  }

  function paint(dt: number): void {
    clearFrame();
    if (nodes.length === 0) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (following && pointerReady) {
      smoothX += (targetX - smoothX) * 0.1;
      smoothY += (targetY - smoothY) * 0.1;
    }

    step(dt);
    drawLinks();
    drawCursorLinks();
    drawPackets(dt);
    drawNodes();
    ctx.globalAlpha = 1;
  }

  function tick(now: number): void {
    rafId = window.requestAnimationFrame(tick);
    if (now - lastFrame < MIN_FRAME_MS) return;
    const dt = lastFrame === 0 ? MIN_FRAME_MS : Math.min(now - lastFrame, 50);
    lastFrame = now;
    paint(dt);
  }

  function shouldRun(): boolean {
    return visible && !document.hidden && !reduced && nodes.length > 0;
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
    if (!followQuery.matches || nodes.length === 0) return;
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
      fall back to the idle drift instead of converging on a stale point. */
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
}
