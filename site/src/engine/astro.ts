// Astro adapter (ClientRouter). Call start(setup) once from the layout's <script>.
// The leave animation runs IN PARALLEL with fetching the next page, so transitions add no latency.
import { boot, cleanup, enter, leave, syncFlags } from './index';
import { scrollToTarget } from './scroll';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let navigating = false;
let traverse = false;

// After a cross-page link to a section (/#install), land on that section instead of the top.
const toHash = () => {
  const el = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (el) requestAnimationFrame(() => scrollToTarget(el, true));
};

export function start(setup?: () => void) {
  document.addEventListener('astro:before-preparation', (e) => {
    navigating = true;
    traverse = e.navigationType === 'traverse'; // back/forward
    const load = e.loader;
    e.loader = async () => { await Promise.all([leave(), load()]); };
  });
  document.addEventListener('astro:before-swap', () => cleanup());
  document.addEventListener('astro:after-swap', () => {
    syncFlags(); // Astro replaces <html> attributes; restore flags before paint
    document.getElementById('loader')?.remove(); // the loader is first-load only
  });
  document.addEventListener('astro:page-load', () => {
    if (!navigating) return void boot(setup); // first load (boot is idempotent)
    navigating = false;
    // Back/forward keeps Astro's restored scroll position and lands on a settled page. Smooth
    // scroll was stopped while Astro restored the position, so re-check every trigger after.
    if (traverse) enter({ scrollTop: false, instant: true }).then(() => ScrollTrigger.refresh());
    else enter().then(toHash);
  });
  // Module scripts run after parsing: boot now instead of waiting for the first astro:page-load.
  boot(setup).then(toHash);
}
