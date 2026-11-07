// The prompt bar and everything it reports: the OS icon, the shell you picked, the [path] of
// the section you're in, the cd menu, and the git segment that goes dirty when you copy.
// The bar persists across navigations, so its listeners are bound once.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ease, onPage, onScroll, prefersReducedMotion } from '../engine';
import { shells, type Shell } from '../data/site';
import { decode } from './decode';
import { breakable } from '../data/breakable';

type OS = 'win' | 'mac' | 'linux';
const ICON: Record<OS, string> = { win: '', mac: '', linux: '' };
const DEFAULT_SHELL: Record<OS, Shell['slug']> = { win: 'pwsh', mac: 'zsh', linux: 'bash' };

function detectOS(): OS {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const p = `${nav.userAgentData?.platform ?? ''} ${navigator.platform} ${navigator.userAgent}`.toLowerCase();
  if (p.includes('win')) return 'win';
  if (/mac|iphone|ipad/.test(p)) return 'mac';
  return 'linux';
}
const os = detectOS();

const KEY = 'omp-matrix-shell';
function loadShell(): Shell['slug'] {
  try {
    const s = localStorage.getItem(KEY);
    if (shells.some((x) => x.slug === s)) return s as Shell['slug'];
  } catch {}
  return DEFAULT_SHELL[os];
}
let shell = loadShell();
export const currentShell = () => shells.find((s) => s.slug === shell)!;

const bar = () => document.querySelector<HTMLElement>('[data-bar]');
const out = () => bar()?.querySelector<HTMLElement>('[data-out]');

let typing: gsap.core.Tween | null = null;
let sayId = 0;
/** Write a line of output after the >> (status, typed commands). */
export function say(text: string, typed = false) {
  const el = out();
  if (!el) return;
  typing?.kill();
  const id = ++sayId;
  if (!typed) { el.textContent = text; return; }
  const o = { n: 0 };
  // Only the latest say() may write: a typing tween that belonged to the previous page gets
  // reverted on navigation, and its onUpdate must not overwrite the line typed since.
  typing = gsap.to(o, { n: text.length, duration: Math.min(0.5, text.length * 0.025), ease: 'none', onUpdate: () => { if (id === sayId) el.textContent = text.slice(0, Math.round(o.n)); } });
  return typing;
}

let pageDirty = false;
let dirtyCall: gsap.core.Tween | null = null;
function setDirty(d: boolean) {
  const b = bar();
  if (!b) return;
  b.classList.toggle('is-dirty', d);
  const mark = b.querySelector('[data-mark]');
  if (mark) mark.textContent = d ? '✗' : '✓';
}
/** Something changed (a copy): the branch goes red for a moment, like a modified tree. */
export function flagDirty(msg: string) {
  setDirty(true);
  say(msg);
  dirtyCall?.kill();
  dirtyCall = gsap.delayedCall(4.5, () => { setDirty(pageDirty); say(''); });
}

function setPath(p: string) {
  const el = bar()?.querySelector('[data-path]');
  if (el && el.textContent !== p) {
    el.textContent = p;
    gsap.fromTo(el, { yPercent: -60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.4, ease: ease.soft });
  }
  bar()?.querySelectorAll<HTMLElement>('[data-cd-link]').forEach((a) => {
    if (a.dataset.cdLink === p) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

function setShell(slug: Shell['slug'], animate = true) {
  shell = slug;
  try { localStorage.setItem(KEY, slug); } catch {}
  const s = currentShell();
  document.querySelectorAll<HTMLElement>('[data-shell-pick]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.shellPick === slug)));
  document.querySelectorAll<HTMLElement>('[data-shell-cmd]').forEach((el) => {
    if (el.dataset.final === s.init || (!el.dataset.final && el.textContent === s.init)) return;
    el.textContent = el.dataset.final = s.init;
    const settle = () => { el.innerHTML = breakable(s.init); };
    const tween = animate ? decode(el, 0.6) : undefined;
    if (tween) tween.then(settle); else settle();
  });
  if (!document.querySelector('main[data-shell]')) document.querySelectorAll('[data-shell-name]').forEach((el) => { el.textContent = s.slug; });
}

async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); return true; } catch {}
  const ta = Object.assign(document.createElement('textarea'), { value: text });
  ta.setAttribute('readonly', '');
  Object.assign(ta.style, { position: 'fixed', opacity: '0' });
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch {}
  ta.remove();
  return ok;
}

function bindMenu() {
  const b = bar();
  const btn = b?.querySelector<HTMLButtonElement>('[data-cd]');
  const menu = document.getElementById('cd-menu');
  if (!b || !btn || !menu) return;
  const links = () => [...menu.querySelectorAll<HTMLAnchorElement>('a')];
  const open = () => {
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    // Opacity, not autoAlpha: visibility:hidden would make the links unfocusable for a moment.
    gsap.fromTo(menu.querySelectorAll('li, .cd__hint'), { yPercent: -50, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, stagger: 0.025, ease: ease.soft });
    (links().find((a) => a.hasAttribute('aria-current')) ?? links()[0])?.focus();
  };
  const close = (refocus: boolean) => {
    if (menu.hidden) return;
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    if (refocus) btn.focus();
  };
  btn.addEventListener('click', () => (menu.hidden ? open() : close(true)));
  b.addEventListener('keydown', (e) => {
    if (menu.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(true); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const l = links();
      const i = l.indexOf(document.activeElement as HTMLAnchorElement);
      l[(i + (e.key === 'ArrowDown' ? 1 : -1) + l.length) % l.length]?.focus();
    }
  });
  b.addEventListener('focusout', (e) => { if (!b.contains(e.relatedTarget as Node)) close(false); });
  document.addEventListener('pointerdown', (e) => { if (!b.contains(e.target as Node)) close(false); });
  menu.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('a')) close(false); });
  document.addEventListener('astro:before-preparation', () => close(false));
}

function bindCopy() {
  document.addEventListener('click', async (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-copy], [data-copy-current]');
    if (!btn) return;
    const own = btn.dataset.copy;
    const text = own ?? currentShell().init;
    const label = btn.querySelector<HTMLElement>('[data-label]');
    const ok = await copyText(text);
    if (!ok) { say('copy failed: select the line and copy it by hand'); return; }
    flagDirty(own && !shells.some((s) => s.init === own) ? '1 change: clipboard' : `1 change: clipboard. paste it into ${shells.find((s) => s.init === text)?.name ?? 'your shell'}`);
    if (!label) return;
    label.dataset.rest ??= label.textContent || '';
    btn.style.minWidth = `${btn.offsetWidth}px`;
    label.textContent = 'Copied';
    btn.classList.add('is-done');
    gsap.delayedCall(1.8, () => { label.textContent = label.dataset.rest!; btn.classList.remove('is-done'); });
  });
}

export function startPrompt() {
  document.querySelectorAll('[data-os]').forEach((el) => { el.textContent = ICON[os]; });
  bindMenu();
  bindCopy();

  // The top bar steps aside while you scroll down and comes back when you scroll up.
  let last = 0;
  onScroll(({ y }) => {
    if (Math.abs(y - last) < 4) return;
    document.documentElement.classList.toggle('frame-away', y > 160 && y > last);
    last = y;
  });

  // First page of a session: the prompt types the init command while the hero is already on
  // screen, and the rain writes the word as the command "runs". No loader, nothing blocks.
  let typedIntro = !document.documentElement.classList.contains('seen') && !prefersReducedMotion();
  let leaving = false;
  document.addEventListener('astro:before-preparation', () => { leaving = true; });

  onPage(({ intro }) => {
    const main = document.getElementById('main');
    document.querySelectorAll('main [data-os]').forEach((el) => { el.textContent = ICON[os]; });
    pageDirty = main?.hasAttribute('data-dirty') ?? false;
    setDirty(pageDirty);
    const home = main?.dataset.path ?? '~';
    setPath(home);
    const missing = document.querySelector('[data-missing]');
    if (missing) missing.textContent = `~${location.pathname.replace(import.meta.env.BASE_URL.replace(/\/$/, ''), '').replace(/\/$/, '') || '/'}`;

    introDelay.v = typedIntro ? TYPE_S : 0;
    if (typedIntro) {
      // A click during the intro wins: the transition types its own `cd` into the same line.
      intro.add(() => { if (!leaving) say(initCommand(), true); }, 0);
      intro.add(() => { if (!leaving) say(''); }, TYPE_S + 0.15);
    }
    typedIntro = false;
    leaving = false;

    // The path is the last section whose top has passed the middle of the screen. Only the start
    // matters (enter / leave back): an end at the bottom of the page would hand the path back.
    const sections = [...document.querySelectorAll<HTMLElement>('main [data-path]')];
    sections.forEach((s, i) => ScrollTrigger.create({
      trigger: s, start: 'top 50%',
      onEnter: () => setPath(s.dataset.path!),
      onLeaveBack: () => setPath(sections[i - 1]?.dataset.path ?? home),
    }));
    // The top bar takes the section's tone while it sits over it (or until data-tone-end, e.g. the
    // black band at the bottom of the green field).
    document.querySelectorAll<HTMLElement>('[data-tone]').forEach((s) => {
      const endEl = s.dataset.toneEnd ? s.querySelector<HTMLElement>(s.dataset.toneEnd) : null;
      ScrollTrigger.create({
        trigger: s, start: 'top top+=40',
        ...(endEl ? { endTrigger: endEl, end: 'top top+=40' } : { end: 'bottom top+=40' }),
        onToggle: (st) => { document.documentElement.dataset.tone = st.isActive ? s.dataset.tone : ''; },
      });
    });

    setShell(shell, false);
    const picks = [...document.querySelectorAll<HTMLButtonElement>('[data-shell-pick]')];
    const pick = (e: Event) => setShell((e.currentTarget as HTMLElement).dataset.shellPick as Shell['slug']);
    picks.forEach((b) => b.addEventListener('click', pick));
    return () => {
      picks.forEach((b) => b.removeEventListener('click', pick));
      delete document.documentElement.dataset.tone;
    };
  });
}

/** The first-visit intro types the init command for the visitor's shell. */
export const initCommand = () => `oh-my-posh init ${shell} --config matrix.omp.json`;
const TYPE_S = 0.85; // how long the init command takes to type; the rain writes when it "runs"
/** Seconds the page intro waits before the rain writes (the typed command's length). */
export const introDelay = { v: 0 };
