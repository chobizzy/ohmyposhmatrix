// Global motion for this site: runs once on the client, before the first page initializes.
// There is no loader: the first-visit intro is the prompt typing `oh-my-posh init` (prompt.ts)
// while the hero is already readable, then the rain writing the word (rain.ts).
import { startPrompt } from './prompt';
import { startRain } from './rain';
import { startDecode } from './decode';
import { startSegments } from './segments';
import { startCurtain } from './curtain';

export function setupMotion() {
  startPrompt();
  startRain();
  startDecode();
  startSegments();
  startCurtain();
}
