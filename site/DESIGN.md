# DESIGN.md: matrix.omp.json landing site

## Phase 0: Brief

- **Subject:** `matrix.omp.json`, a Matrix-inspired oh-my-posh prompt theme by chobizzy. One
  2.7 KB JSON file, MIT licensed, four segments plus a prompt character, four colors.
- **Audience:** developers who customise their terminal (PowerShell on Windows Terminal, Bash,
  Zsh, Fish), arriving from GitHub, Reddit or a dotfiles thread.
- **Job:** get the install line into their clipboard in under ten seconds, and make them want to.
  Secondary: star the repo.
- **Assets:** the theme file itself (real palette, real templates), the README install steps.
- **Constraints:** static host (GitHub Pages under `/ohmyposhmatrix/`), no backend, English.
- **Assumptions (listed again in the final message):** hosted on GitHub Pages at
  `https://chobizzy.github.io/ohmyposhmatrix/`; the visitor's prompt is shown as
  `you@localhost` on branch `main`; the site shows the prompt as the README describes it
  (branch red when dirty, `>>` on its own line).

## Phase 1: Concept

| | A. The rain is the source (formal/material) | B. The prompt is the interface (material) | C. Phosphor (place/history) |
|---|---|---|---|
| Idea | The theme's own JSON falls as digital rain, and the rain writes every big word on the page | The site's navigation is a live render of the theme's prompt: `[path]` is where you are, the branch goes red when you change something | `#00FF41` is P1 phosphor green: the page is a CRT where whatever you touch burns in and fades |
| Anchor | the product is literally one JSON file; the theme is Matrix-inspired | the theme's four segments and `>>` | green-on-black terminals |
| Layout | character-cell grid; mega words built from cells | a fixed two-line prompt as the frame | scanline bands |
| Motion verb | fall and lock | type and return | burn in, decay |
| Signature | mega words assembled from source glyphs that lock as each falling column passes | path segment updates as you scroll, copy flips the tree dirty | pointer beam with persistence |
| O / F / Fe / P | 4 / 5 / 4 / 2 | 4 / 5 / 5 / 2 | 3 / 3 / 4 / 4 |

**Pick A**, because it makes the cliché of the genre (digital rain) carry the product itself:
the glyphs are the theme file, and the rain does the typography. **Steal from B** for the
chrome: the fixed prompt bar is the site's orientation and its secondary navigation. C is
dropped.

### Concept card

```
Idea:        The theme's own source code falls as digital rain, and the rain writes the page's big words.
Metaphor:    a terminal session lit by this theme: the screen is a character grid, the rain is the file, the prompt is where you are.
Signature:   rain-written type. Mega words ("matrix", "pwsh", "404", ">>") are built from glyph cells that lock
             in place as a falling column passes through the letterform. Fullscreen GL background with a text mask
             (src/motion/rain.ts). The pointer disturbs the stream.
Emotion:     black screen, a cursor, one command types itself, Enter: rain, and the name locks into place.
Motion verb: fall and lock. Things drop in from above, scramble through source glyphs, then lock to the grid.
Screenshot:  "matrix" at 20vw made of bright JSON glyphs, dim source rain around it, the real prompt at the bottom.
```

## Phase 2: Art direction system

### Palette (every value is in matrix.omp.json)

| Role | Hex | Source in the theme | Use |
|---|---|---|---|
| ground | `#000000` | `background: transparent` on a black terminal | page, curtain |
| ink | `#00FF41` | primary foreground | text, heads, focus ring, field section |
| muted | `#008F11` | accent (`@`, brackets) | secondary text (4.9:1 on black, AA) |
| line | `#003B00` | darkest rain trail | hairlines and dim rain only, never text |
| dirty | `#FF0000` | git dirty foreground | only when something changed: copied, 404 |
| head | `#D7FFE1` | rain head glow | GL only |

Near-black + acid green is on the avoid list. Here it is the product: these are the theme's
literal hex values, so the site uses them with no other hue, no glow, no gradients. Contrast
comes from scale, weight and one inverted section (black on `#00FF41`).

### Type

One family: **JetBrains Mono** (Google, OFL, variable 100 to 800), the font the README
recommends for the theme. The site is set in the font your prompt will be in. Hierarchy is
weight and scale only: rain words 800 (rendered as cells), display 200 with negative tracking,
headings 300, body 400 at 17 px / 1.6, UI 13 px 500. Nerd Font icons (U+E0A0 branch, U+E62A,
U+F179, U+F17C) and ✓ ✗ are self-hosted subsets, so the prompt renders with its real glyphs.
UI labels are lowercase like shell paths; copy is sentence case.

### Grid, rhythm, shape

- 12 columns, gutter `--gutter`, spines at columns 1, 5 and 9. Body measure 60ch max.
- Rhythm: hero full viewport; segments sticky stage (5 chapters, 90svh each); palette field
  airy; install rows tight; finale full viewport.
- Radius 0 everywhere. Cells are square-ish, the cursor is a block.

### Motion language

- Eases: engine `expo.out` for entrances, `expo.inOut` for the curtain, `power3.out` for UI.
- Fall and lock: line reveals drop in from above (`yPercent -110 → 0`), clip reveals wipe top
  to bottom, headings decode through source glyphs and lock left to right.
- Hovers: nav letters fall out and fall back in with a rain stagger; buttons fill from the top
  down (ink floods, label inverts); index rows decode their label and the arrow travels.
- Transition: rain columns fall over the page while `cd <path>` types in the center, then keep
  falling off the bottom.
- Idle: the rain is the concept, so it keeps falling on the GL clock. A visible
  "pause rain" toggle sits in the prompt bar (WCAG 2.2.2). Without GL (reduced motion, no
  WebGL) the page is still by decision: the mega words render solid and the cursor stops.

### Composition plan

```
HERO (poster)                         SEGMENTS (sticky narrative)
+-------------------------------+     +-------------------------------+
| matrix.omp.json      nav ...  |     |  you@localhost [~/x] (main ✓)|  big prompt, active segment lit
|                               |     |  >>                           |
|  M A T R I X   (rain cells)   |     |        |  falling callout     |
|  .omp.json                    |     |        +- git: the branch...  |  caption hangs under its segment
|  lede          [copy] pwsh .. |     |                               |
|  > prompt bar (fixed) ....... |     +-------------------------------+
+-------------------------------+
PALETTE (field color, inverted)       INSTALL (index list)
+===============================+     +-------------------------------+
| #00FF41 mega (the field)      |     | before you paste: 2 needs     |
| Four colors ...               |     | PowerShell  command   copy  ->|
|-------------------------------|     | Bash        command   copy  ->|
| #008F11 accent band           |     | Zsh         command   copy  ->|
| #000000 ground band           |     | Fish        command   copy  ->|
| #FF0000 dirty band (thin)     |     +-------------------------------+
+===============================+
FINALE (footer)                       INNER /install/<shell>/ (scrollback)
+-------------------------------+     +-------------------------------+
|  >>  (rain)    Your turn.     |     | pwsh (rain)                   |
|  _             [copy]         |     | h1 + profile file             |
| colophon  links  license      |     | 1 try it  2 open  3 add  4 .  |
+-------------------------------+     | local copy, troubleshooting   |
                                      | next shell ->                 |
404: rain writes 404, the output      +-------------------------------+
`cd: no such file or directory`, cd ~
```

### Genericness test

A generic answer: black page, a decorative `<canvas>` rain at 35% opacity, Courier, a
terminal window with traffic-light dots, `text-shadow` glow. Changed:
- The rain is not decoration: it is the theme file, and it renders the headlines.
- No fake terminal window. The page itself is the terminal; the prompt bar is the real prompt.
- No glow and no gradients: crisp cells, four exact hex values, one inverted section.
- Type is one family at extreme scale contrast instead of small Courier.

## Phase 3/4 decisions and QA log

- **Stack:** Astro 7 + GSAP + Lenis + OGL. Content-only microsite where motion is the product;
  static output for GitHub Pages; ~81 KB JS gzipped.
- **Idle:** the rain is the concept and keeps falling on its own clock; a "pause rain" toggle in
  the prompt bar freezes it (WCAG 2.2.2). Under reduced motion there is no GL: rain words render
  as solid type and the page is still, by decision.
- **Rain grid scrolls with the page** (page-space cells), so the mask and the cells never drift
  apart while scrolling.
- **Rain words lock per cell, fill per pixel:** a cell locks when its column's drop passes, and
  locked cells fill the real letterform (dim ink) with bright source glyphs on top. A pure cell
  mosaic read as noise to the critic; the filled letterform reads at a glance.
- **Text over rain:** every reading block sits on solid black (`.cleared` and the reading-block
  selectors in site.css), so the rain runs in the gutters around copy, never under it.
- **No loader.** The hero and the install line are on screen from the first paint. On the first
  page of a session the prompt types `oh-my-posh init <shell> --config matrix.omp.json`, then the
  rain writes the word as the command "runs". Later loads write the word straight away.
- **Prompt bar persists** across navigations and sits above the curtain: it types `cd <path>`
  while columns of the theme file fall over the page, and its `[path]` updates when the new
  page lands. Back/forward returns a settled page (no replayed reveals) at the restored scroll.
- QA pass 1: footer text rendered under the canvas (outside `#main`), atlas glyph bleed,
  install-row marker off-grid, tiny `~` targets, loader 4.3 s on the throttled phone, cd menu
  links unfocusable during their entrance (autoAlpha). All fixed.
- Critic 1 (7.3): color-only and invisible hovers, dead left column on guides, tripled names in
  innerText, intro on every load, mid-word code breaks. Critic 2 (7.65): hero word unreadable,
  loader gate, empty band after the sticky stage, dead transition frame. All addressed.
- Bug found by tracing: GSAP runs callbacks inside the page's context, so the intro's typing
  tween was reverted on navigation and its onUpdate overwrote the typed `cd`. `say()` now only
  lets the latest call write.
- Critic 3 (7.85): back navigation lost the footer word and the path (smooth scroll was stopped
  during Astro's scroll restore; the end-'max' path trigger handed the path back at the page
  bottom). Critic 4 (7.55): glyph "overprint" near the pointer. Cause: pointer proximity was
  computed per pixel, so pixels in one cell picked different glyphs. Now per cell. Also from
  critic 4: the word is real type at first paint (accent green, then it fades as the rain
  writes it), short brand on phones so all four sections show, step 03 no longer repeats 01.
- Final pass: 0 audit FAIL, 0 axe violations, LCP is the h1 word (~1.36 s throttled phone),
  CLS ≤ 0.011, phone FPS 51 to 60. Remaining audit WARNs (robots, sitemap) are structural on a
  GitHub Pages project site: crawlers only read them at the domain root.
