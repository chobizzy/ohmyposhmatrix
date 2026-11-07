// "Lock": text scrambles through the theme's own glyphs, then locks left to right.
// The font is monospaced, so a scrambling line never changes width.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isTouch, onPage, prefersReducedMotion } from '../engine';
import { randomGlyph } from './source';

const running = new WeakMap<HTMLElement, gsap.core.Tween>();

export function decode(el: HTMLElement, duration = 0.8) {
  if (prefersReducedMotion()) return;
  const final = (el.dataset.final ??= el.textContent || '');
  const chars = Array.from(final);
  running.get(el)?.kill();
  const o = { p: 0 };
  let lastRoll = -1;
  const tween = gsap.to(o, {
    p: 1, duration, ease: 'power1.in',
    onUpdate: () => {
      const roll = Math.floor(tween.time() / 0.045); // re-roll at ~22 Hz, not every frame
      if (roll === lastRoll) return;
      lastRoll = roll;
      const n = Math.floor(o.p * chars.length);
      el.textContent = chars.map((c, i) => (i < n || c === ' ' ? c : randomGlyph())).join('');
    },
    onComplete: () => { el.textContent = final; },
    onInterrupt: () => { el.textContent = final; },
  });
  running.set(el, tween);
  return tween;
}

export function startDecode() {
  onPage(() => {
    if (prefersReducedMotion()) return;
    // Headings decode as they scroll in.
    document.querySelectorAll<HTMLElement>('[data-decode]').forEach((el) => {
      el.setAttribute('aria-label', el.textContent || '');
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => { gsap.set(el, { visibility: 'visible' }); decode(el, 0.9); },
      });
    });
    // Index links decode their label on hover and on keyboard focus.
    const off: (() => void)[] = [];
    document.querySelectorAll<HTMLElement>('[data-hover-decode]').forEach((a) => {
      const label = a.querySelector<HTMLElement>('[data-decode-label]');
      if (!label) return;
      const go = () => decode(label, 0.45);
      const focus = () => a.matches(':focus-visible') && go();
      if (!isTouch()) a.addEventListener('pointerenter', go);
      a.addEventListener('focus', focus);
      off.push(() => { a.removeEventListener('pointerenter', go); a.removeEventListener('focus', focus); });
    });
    return () => off.forEach((f) => f());
  });
}
