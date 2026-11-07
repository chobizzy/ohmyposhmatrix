// The concept's driver. One fullscreen shader draws the theme file as digital rain on a
// character grid that scrolls with the page, and writes the current [data-rain-word]: cells
// inside the letterforms lock as each column's drop falls through them.
// Inputs, all on the GSAP ticker: a pausable clock (idle motion), the section's [data-rain]
// intensity, the pointer (disturbs nearby cells), and the active word's mask.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Texture, Vec2, Vec4 } from 'ogl';
import { glContext, instantIntro, isMobile, isTouch, onPage, setBackground, setGLPaused } from '../engine';
import { glyphs, stream } from './source';
import { introDelay } from './prompt';

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 uResolution, uMouse, uCell, uAtlasGrid, uSrcSize;
uniform float uClock, uScrollY, uIntensity, uSrcLen, uMaskT, uMaskOn, uPointer;
uniform vec4 uMaskRect;
uniform sampler2D tAtlas, tSrc, tMask;
uniform vec3 uInk, uMuted, uLine, uHead;

// Sin-free hashes (Dave Hoskins): same job as sin-based ones, far cheaper on weak or emulated GPUs.
float h1(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float h2(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }

float srcAt(float i) {
  i = mod(i, uSrcLen);
  vec2 st = vec2(mod(i, uSrcSize.x), floor(i / uSrcSize.x));
  return floor(texture2D(tSrc, (st + 0.5) / uSrcSize).r * 255.0 + 0.5);
}
float glyph(float g, vec2 f) {
  vec2 a = vec2(mod(g, uAtlasGrid.x), floor(g / uAtlasGrid.x));
  return texture2D(tAtlas, (a + f) / uAtlasGrid).r;
}

void main() {
  vec2 px = vec2(vUv.x, 1.0 - vUv.y) * uResolution;   // CSS px, y down
  vec2 page = vec2(px.x, px.y + uScrollY);              // the grid scrolls with the page
  vec2 cell = floor(page / uCell);
  vec2 f = fract(page / uCell);
  float t = uClock;

  // Ambient rain: every column has its own speed, trail and gap.
  float c1 = h1(cell.x), c2 = h1(cell.x + 31.7), c3 = h1(cell.x + 73.1);
  float speed = mix(4.0, 14.0, c1);
  float len = mix(6.0, 22.0, c2);
  float period = len + mix(12.0, 44.0, c3);
  float d = mod(t * speed + c3 * 977.0 - cell.y, period);
  float trail = d < len ? 1.0 - d / len : 0.0;
  float head = 1.0 - smoothstep(0.0, 1.0, d);

  // Pointer proximity per CELL, not per pixel: it picks the glyph, and every pixel of a cell
  // must agree on its glyph (per-pixel values drew fragments of several glyphs in one cell).
  vec2 m = vec2(uMouse.x, 1.0 - uMouse.y) * uResolution;
  float near = uPointer * smoothstep(150.0, 0.0, distance((cell + 0.5) * uCell - vec2(0.0, uScrollY), m));

  float amb = uIntensity * (pow(trail, 1.6) * 0.75 + head) * (1.0 + near * 1.4);

  // The word: a cell locks once its column's writing drop has passed it (lock per cell), and
  // locked cells fill the real letterform (shape per pixel), so the word reads at a glance while
  // it is still made of the file's glyphs.
  vec2 cc = (cell + 0.5) * uCell;
  vec2 mu = (cc - uMaskRect.xy) / uMaskRect.zw;
  float inside = step(0.0, mu.x) * step(mu.x, 1.0) * step(0.0, mu.y) * step(mu.y, 1.0) * uMaskOn;
  float top = floor(uMaskRect.y / uCell.y) - 3.0;
  float rows = uMaskRect.w / uCell.y + 6.0;
  float colIn = step(uMaskRect.x, cc.x) * step(cc.x, uMaskRect.x + uMaskRect.z) * uMaskOn * step(0.0, uMaskT)
              * step(top - 1.0, cell.y) * step(cell.y, top + rows);
  float wHead = top + (uMaskT - h1(cell.x + 9.1) * 0.6) * mix(30.0, 54.0, h1(cell.x + 5.3));
  float wd = wHead - cell.y;
  float writing = colIn * step(-1.5, wd) * step(wd, 9.0);       // the drop or its trail is here
  float lockable = inside * step(0.0, wd) * step(0.0, uMaskT);   // the drop has passed this cell
  float solid = 0.0;
  if (lockable > 0.5) solid = texture2D(tMask, clamp((page - uMaskRect.xy) / uMaskRect.zw, 0.0, 1.0)).r;
  // Most pixels sit in a gap between drops and off the letters: skip the glyph work.
  if (amb < 0.003 && solid < 0.01 && writing < 0.5) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }

  // Each column reads the source downward; a few cells re-roll, and all of them near the pointer.
  float base = floor(c1 * uSrcLen) + cell.y;
  float roll = floor(t * (1.5 + 5.0 * h2(cell + 3.0) + near * 10.0)) * max(step(0.9, h2(cell)), step(0.05, near));
  float a = glyph(srcAt(base + roll * 13.0), f);
  vec3 col = mix(mix(uLine, uMuted, trail), uInk * 0.8, head) * a * amb;
  float wTrail = writing * step(0.0, wd) * (1.0 - smoothstep(0.0, 9.0, wd));
  float wDrop = writing * (1.0 - smoothstep(0.0, 1.2, abs(wd)));

  if (solid > 0.01) {
    float la = glyph(srcAt(base + 7.0 + floor(t * (0.35 + 0.9 * h2(cell + 11.0) + near * 8.0)) * 29.0), f);
    float shimmer = 0.85 + 0.15 * h2(cell + floor(t * 3.0));
    vec3 lockC = mix(uInk, uHead, clamp(0.3 + near * 0.6 + wDrop, 0.0, 1.0)) * shimmer;
    col = mix(col, lockC * la + uInk * 0.36 * (1.0 - la), solid);
  }
  col += (uInk * wTrail * 0.6 + uHead * wDrop) * a * (1.0 - solid);
  gl_FragColor = vec4(col, 1.0);
}`;

const vec3 = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const COLS = 16, CW = 36, CH = 48; // atlas cell, same 3:4 aspect as the rain cell

const state = { clock: 0, rate: 1, maskStart: Infinity };
let uniforms: Record<string, { value: any }> | null = null;
let atlas: HTMLCanvasElement, maskCanvas: HTMLCanvasElement;
let active: HTMLElement | null = null;
let holdIntro: HTMLElement | null = null;

function drawAtlas() {
  const ctx = atlas.getContext('2d')!;
  atlas.width = COLS * CW;
  atlas.height = Math.ceil(glyphs.length / COLS) * CH;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, atlas.width, atlas.height);
  ctx.fillStyle = '#fff';
  ctx.font = "500 32px JBM, ui-monospace, monospace";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Clip each glyph to its cell: a wide fallback glyph must never bleed into its neighbours.
  glyphs.forEach((g, i) => {
    const x = (i % COLS) * CW, y = Math.floor(i / COLS) * CH;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 1, y + 1, CW - 2, CH - 2);
    ctx.clip();
    ctx.fillText(g, x + CW / 2, y + CH * 0.55);
    ctx.restore();
  });
  const tex = uniforms!.tAtlas.value as Texture;
  tex.image = atlas;
  tex.needsUpdate = true;
}

// Draw the word into the mask exactly where the DOM lays it out, one character at a time.
function setMask(el: HTMLElement) {
  if (!uniforms) return;
  if (active && active !== el) active.classList.remove('is-written'); // it shows as type again
  active = el;
  const cs = getComputedStyle(el);
  // The line box (line-height 0.78) is shorter than the glyphs: pad so ascenders aren't clipped.
  const pad = Math.ceil(parseFloat(cs.fontSize) * 0.3);
  const b = el.getBoundingClientRect();
  const r = { left: b.left - pad, top: b.top - pad, width: b.width + pad * 2, height: b.height + pad * 2 };
  const w = Math.max(1, Math.ceil(r.width)), h = Math.max(1, Math.ceil(r.height));
  maskCanvas.width = w;
  maskCanvas.height = h;
  const ctx = maskCanvas.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff';
  ctx.font = `${cs.fontWeight} ${cs.fontSize} JBM, ui-monospace, monospace`;
  ctx.textBaseline = 'alphabetic';
  const ascent = ctx.measureText('M').fontBoundingBoxAscent;
  const range = document.createRange();
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const text = n.textContent || '';
    for (let i = 0; i < text.length; i++) {
      range.setStart(n, i);
      range.setEnd(n, i + 1);
      const cr = range.getBoundingClientRect();
      if (cr.width) ctx.fillText(text[i], cr.left - r.left, cr.top - r.top + ascent);
    }
  }
  const tex = uniforms.tMask.value as Texture;
  tex.image = maskCanvas;
  tex.needsUpdate = true;
  (uniforms.uMaskRect.value as Vec4).set(r.left + scrollX, r.top + scrollY, w, h);
  uniforms.uMaskOn.value = 1;
}

// After back/forward the page returns settled: words entering view in that window are already written.
let settleUntil = 0;
function write(el: HTMLElement) {
  if (el === holdIntro) return setMask(el); // the page intro starts this one
  if (el !== active) setMask(el);
  state.maskStart = performance.now() < settleUntil ? state.clock - 10 : state.clock;
  el.classList.add('is-written'); // the DOM letters fade as the rain takes over
}

function setIntensity(v: number, now = false) {
  if (!uniforms) return;
  gsap.to(uniforms.uIntensity, { value: v, duration: now ? 0 : 1.4, ease: 'power2.out', overwrite: true });
}

function resizeCells() {
  if (uniforms) (uniforms.uCell.value as Vec2).set(...((isMobile() ? [10, 13] : [12, 16]) as [number, number]));
}

/** Call once from setupMotion. Without GL (reduced motion, no WebGL) the DOM words stay solid. */
export function startRain() {
  const gl = glContext();
  if (!gl) return;
  atlas = document.createElement('canvas');
  maskCanvas = document.createElement('canvas');

  const W = 64, H = Math.ceil(stream.length / W);
  const index = new Map(glyphs.map((g, i) => [g, i]));
  const data = new Uint8Array(W * H * 4);
  stream.forEach((g, i) => { data[i * 4] = index.get(g)!; });
  const tex = (o: object) => new Texture(gl, { generateMipmaps: false, flipY: false, ...o });

  uniforms = {
    uClock: { value: 0 },
    uIntensity: { value: 1 },
    uPointer: { value: 0 },
    uCell: { value: new Vec2(12, 16) },
    tAtlas: { value: tex({ image: atlas, minFilter: gl.LINEAR }) },
    uAtlasGrid: { value: new Vec2(COLS, Math.ceil(glyphs.length / COLS)) },
    tSrc: { value: tex({ image: data, width: W, height: H, minFilter: gl.NEAREST, magFilter: gl.NEAREST }) },
    uSrcSize: { value: new Vec2(W, H) },
    uSrcLen: { value: stream.length },
    tMask: { value: tex({ image: maskCanvas, minFilter: gl.LINEAR, magFilter: gl.LINEAR }) },
    uMaskRect: { value: new Vec4(0, 0, 1, 1) },
    uMaskT: { value: -1 },
    uMaskOn: { value: 0 },
    uInk: { value: vec3('#00FF41') },
    uMuted: { value: vec3('#008F11') },
    uLine: { value: vec3('#003B00') },
    uHead: { value: vec3('#D7FFE1') },
  };
  drawAtlas();
  resizeCells();
  if (!setBackground(FRAG, uniforms)) { uniforms = null; return; }

  // The clock is ours so the rain can pause; the writing drop rides the same clock.
  gsap.ticker.add((_t, dt) => {
    state.clock += (Math.min(dt, 100) / 1000) * state.rate;
    uniforms!.uClock.value = state.clock;
    uniforms!.uMaskT.value = Number.isFinite(state.maskStart) ? state.clock - state.maskStart : -1;
  });
  if (!isTouch()) addEventListener('pointermove', () => { uniforms!.uPointer.value = 1; }, { once: true, passive: true });
  // ✓ and ✗ live in a separate subset file that only loads on demand: ask for it explicitly.
  Promise.all([document.fonts.load('500 32px JBM'), document.fonts.load('500 32px JBM', '✓✗'), document.fonts.ready])
    .then(() => { drawAtlas(); ScrollTrigger.refresh(); }, () => {});
  addEventListener('resize', resizeCells);
  ScrollTrigger.addEventListener('refresh', () => { if (active?.isConnected) setMask(active); });

  // WCAG 2.2.2: the rain moves on its own, so it gets a visible pause.
  const toggle = document.querySelector<HTMLButtonElement>('[data-rain-toggle]');
  if (toggle) {
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      const paused = toggle.getAttribute('aria-pressed') !== 'true';
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.textContent = paused ? 'play rain' : 'pause rain';
      gsap.to(state, { rate: paused ? 0 : 1, duration: 0.6, ease: 'power2.out', overwrite: true });
    });
  }

  onPage(({ intro }) => {
    const words = [...document.querySelectorAll<HTMLElement>('[data-rain-word]')];
    const sections = [...document.querySelectorAll<HTMLElement>('[data-rain]')];
    setIntensity(parseFloat(sections[0]?.dataset.rain ?? '1'), true);
    sections.forEach((s) => ScrollTrigger.create({
      trigger: s, start: 'top 60%', end: 'bottom 60%',
      onToggle: (st) => st.isActive && setIntensity(parseFloat(s.dataset.rain || '1')),
    }));
    holdIntro = words.find((w) => w.hasAttribute('data-intro')) ?? null;
    state.maskStart = Infinity;
    if (holdIntro) {
      const el = holdIntro;
      setMask(el);
      intro.add(() => {
        holdIntro = null;
        if (instantIntro.on) settleUntil = performance.now() + 1500; // back/forward: already written
        // Back/forward may restore the scroll far below the hero: a word already written on
        // screen (the footer's) keeps the mask.
        const r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight || !active || active === el) write(el);
      }, instantIntro.on ? 0 : introDelay.v);
    }
    words.forEach((w) => ScrollTrigger.create({
      trigger: w, start: 'top 80%', end: 'bottom 20%',
      onEnter: () => write(w), onEnterBack: () => write(w),
    }));
    // While the opaque green field fills the viewport the rain can't be seen: stop drawing it.
    document.querySelectorAll<HTMLElement>('.field').forEach((f) => ScrollTrigger.create({
      trigger: f, start: 'top top', end: 'bottom bottom', onToggle: (st) => setGLPaused(st.isActive),
    }));
    return () => {
      active = null;
      holdIntro = null;
      setGLPaused(false);
      if (uniforms) uniforms.uMaskOn.value = 0;
    };
  });
}
