# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Matrix-inspired [oh-my-posh](https://ohmyposh.dev/) terminal prompt theme (`matrix.omp.json`), plus a landing site for it in `site/`.

## Commands

The theme itself has no build: `matrix.omp.json` is consumed directly by `oh-my-posh init`.

The site (`site/`, Astro 7, Node 22+):
- `cd site && npm install`
- `npm run dev`: dev server
- `npm run build`: static build into `site/dist/` (base path `/ohmyposhmatrix/`, for GitHub Pages)
- `npx astro check`: type check

## Architecture

### Theme (`matrix.omp.json`)
Validates against the oh-my-posh v4 JSON schema. Two prompt blocks:
- **Block 1**: OS icon → `user@host` → `[path]` → `(git branch)`. The branch is meant to turn red (`#FF0000`) when the working tree is dirty, green otherwise
- **Block 2**: `>> ` prompt character

Color palette: neon green `#00FF41` (primary), dark green `#008F11` (accents), black `#000000` (background), red `#FF0000` (dirty git).

### Site (`site/`)
`site/DESIGN.md` holds the concept and art direction; read it before changing the look. The concept: the theme file falls as digital rain, and the rain writes the page's big words.
- `src/data/site.ts`: every visible string, the shell install commands, and the theme facts. It imports `../matrix.omp.json` at build time, so templates, colors and the rain glyphs always come from the real theme file.
- `src/motion/rain.ts`: the WebGL rain shader and the driver that writes `[data-rain-word]` elements
- `src/motion/prompt.ts`: the fixed prompt bar (path tracking, cd menu, copy, dirty flag)
- `src/engine/`: scroll, reveal, loader and page transition plumbing (GSAP ticker is the only clock)
- Colors in `src/styles/tokens.css` are the theme's literal hex values

## Key Constraints

- Install URLs in `README.md` and `site/src/data/site.ts` point to `https://raw.githubusercontent.com/chobizzy/ohmyposhmatrix/master/matrix.omp.json`. Keep the branch name (`master`) and username (`chobizzy`) consistent when editing either file.
- The segment/color documentation in `README.md` should stay in sync with `matrix.omp.json`.
- The theme requires a Nerd Font to render glyphs correctly. The site self-hosts a 4-glyph Nerd Font subset (`site/public/fonts/nf-icons.woff2`); add codepoints there if the prompt shows new icons.
