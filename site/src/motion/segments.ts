// The segments stage: scroll walks along the prompt, one segment per chapter. The active
// segment is underlined, its caption drops in under it on a falling line, and the git chapter
// shows the dirty state. Without motion the captions are a plain list (CSS).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ease, isMobile, onPage, prefersReducedMotion } from '../engine';
import { decode } from './decode';

export function startSegments() {
  onPage(() => {
    const track = document.querySelector<HTMLElement>('[data-segs]');
    const big = track?.querySelector<HTMLElement>('[data-bigpr]');
    if (!track || !big) return;
    const stage = track.querySelector<HTMLElement>('.segs__stage')!;
    const list = track.querySelector<HTMLElement>('.segs__list')!;
    const drop = track.querySelector<HTMLElement>('.segs__drop')!;
    const caps = [...track.querySelectorAll<HTMLElement>('[data-cap]')];
    const segOf = (cap: HTMLElement) => big.querySelector<HTMLElement>(`[data-seg="${cap.dataset.cap}"]`)!;
    const toggle = track.querySelector<HTMLButtonElement>('[data-dirty-toggle]');
    const mark = big.querySelector('[data-mark]');

    let dirty = false;
    const setDirty = (d: boolean) => {
      dirty = d;
      big.classList.toggle('is-dirty', d);
      if (mark) mark.textContent = d ? '✗' : '✓';
      if (toggle) {
        toggle.setAttribute('aria-pressed', String(d));
        toggle.textContent = d ? 'Commit it' : 'Change a file';
      }
    };
    const flip = () => setDirty(!dirty);
    toggle?.addEventListener('click', flip);
    if (prefersReducedMotion()) return () => toggle?.removeEventListener('click', flip);

    let idx = -1;
    let demo: gsap.core.Tween | null = null;
    const show = (i: number, force = false) => {
      if (i === idx && !force) return;
      const changed = i !== idx;
      idx = i;
      const cap = caps[i];
      const seg = segOf(cap);
      big.querySelectorAll('[data-seg]').forEach((s) => s.classList.toggle('is-active', s === seg));
      caps.forEach((c) => c.classList.toggle('is-active', c === cap));

      // Hang the caption under its segment, and drop a line from one to the other.
      const sr = seg.getBoundingClientRect();
      const lr = list.getBoundingClientRect();
      const st = stage.getBoundingClientRect();
      const mobile = isMobile();
      const x = mobile ? 0 : gsap.utils.clamp(0, Math.max(0, lr.width - cap.offsetWidth), sr.left - lr.left);
      gsap.set(cap, { x });
      const lineX = (mobile ? lr.left : Math.max(sr.left, lr.left + x)) - st.left;
      const y0 = sr.bottom - st.top + 8;
      const y1 = cap.getBoundingClientRect().top - st.top - 10; // captions sit at the bottom of the list
      gsap.set(drop, { x: lineX, y: y0, height: Math.max(0, y1 - y0), autoAlpha: mobile ? 0 : 1 });
      if (!changed) return;
      gsap.fromTo(drop, { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: ease.out });
      gsap.fromTo(cap.children, { yPercent: -35, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.7, stagger: 0.06, ease: ease.out, delay: 0.15 });
      const type = cap.querySelector<HTMLElement>('.seg__type code');
      if (type) decode(type, 0.5);

      demo?.kill();
      if (cap.dataset.cap === 'git') demo = gsap.delayedCall(1.1, () => setDirty(true));
      else setDirty(false);
    };

    ScrollTrigger.create({
      trigger: track, start: 'top top', end: 'bottom bottom', invalidateOnRefresh: true,
      onUpdate: (s) => show(Math.min(caps.length - 1, Math.floor(s.progress * caps.length))),
      onRefresh: () => idx > -1 && show(idx, true),
    });
    show(0);
    return () => { toggle?.removeEventListener('click', flip); demo?.kill(); };
  });
}
