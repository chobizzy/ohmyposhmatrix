// Page transition: rain columns fall over the page while the prompt types `cd <path>`, then
// keep falling off the bottom of the new page. The prompt bar sits above the curtain.
import { gsap } from 'gsap';
import { setTransition } from '../engine';
import { say } from './prompt';
import { stream } from './source';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const toPath = (url: URL) => {
  if (url.hash.length > 1) return `~/${url.hash.slice(1)}`;
  const p = url.pathname.replace(base, '').replace(/\/$/, '');
  return p ? `~${p}` : '~';
};

export function startCurtain() {
  const host = document.querySelector<HTMLElement>('#curtain .curtain__cols');
  if (!host) return;
  let cols: HTMLElement[] = [];
  let target = '~';
  document.addEventListener('astro:before-preparation', (e) => { target = toPath(e.to); });

  // Each column is a strand of the theme file falling, with a bright glyph at its head, so the
  // covered screen is still rain and never a blank frame.
  const strand = (rows: number) => {
    const start = (Math.random() * stream.length) | 0;
    return Array.from({ length: rows }, (_, i) => stream[(start + i) % stream.length]).join('\n');
  };
  const build = () => {
    const n = gsap.utils.clamp(8, 28, Math.round(innerWidth / 60));
    const rows = Math.ceil(innerHeight / 16) + 1;
    if (cols.length !== n) {
      host.replaceChildren(...Array.from({ length: n }, (_, i) => {
        const c = document.createElement('div');
        c.className = 'curtain__col';
        Object.assign(c.style, { left: `${(i / n) * 100}%`, width: `calc(${100 / n}% + 1px)` });
        c.append(Object.assign(document.createElement('span'), { className: 'curtain__glyphs' }), Object.assign(document.createElement('b'), { className: 'curtain__head' }));
        return c;
      }));
      cols = [...host.children] as HTMLElement[];
    }
    cols.forEach((c) => {
      const s = strand(rows);
      c.firstElementChild!.textContent = s.slice(0, -1);
      c.lastElementChild!.textContent = s.slice(-1);
    });
    return cols;
  };
  // Each column gets its own delay and speed, like separate drops.
  const fall = (tl: gsap.core.Timeline, from: number, to: number) => {
    cols.forEach((c) => tl.fromTo(c, { yPercent: from }, { yPercent: to, duration: gsap.utils.random(0.5, 0.68), ease: 'power2.in' }, gsap.utils.random(0, 0.3)));
    return tl;
  };

  setTransition({
    leave: (c) => {
      build();
      const tl = gsap.timeline().set(c, { autoAlpha: 1 });
      tl.add(() => { say(`cd ${target}`, true); }, 0);
      return fall(tl, -101, 0);
    },
    enter: (c) => {
      const tl = gsap.timeline();
      fall(tl, 0, 101);
      tl.add(() => say(''), 0.35);
      return tl.set(c, { autoAlpha: 0 });
    },
  });
}
