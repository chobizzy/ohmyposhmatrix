# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Matrix-inspired [oh-my-posh](https://ohmyposh.dev/) terminal prompt theme (`matrix.omp.json`) plus a standalone landing page (`index.html`) that showcases it.

## No Build System

There are no build, lint, or test commands. This repo is entirely static files:
- `matrix.omp.json` — the oh-my-posh theme, consumed directly by `oh-my-posh init`
- `index.html` — the landing page, opened directly in a browser

To preview the landing page, just open `index.html` in a browser — no server required.

## Architecture

### Theme (`matrix.omp.json`)
Validates against the oh-my-posh v4 JSON schema. Two prompt blocks:
- **Block 1**: OS icon → `user@host` → `[path]` → `(git branch)` — branch turns red (`#FF0000`) when the working tree is dirty, green otherwise
- **Block 2**: `>> ` prompt character

Color palette: neon green `#00FF41` (primary), dark green `#008F11` (accents), black `#000000` (background), red `#FF0000` (dirty git).

### Landing Page (`index.html`)
Single-file vanilla HTML/CSS/JS (578 lines, no frameworks, no dependencies):
- **Canvas Matrix rain** — initialized on load, runs in the background
- **`switchTab(tab)`** — controls the PowerShell / Bash-Zsh / Fish install code blocks
- **`copy(elementId)`** — clipboard copy with visual feedback

Both the install URLs and the segment/color documentation in `index.html` should stay in sync with `README.md` and `matrix.omp.json`.

## Key Constraints

- Install URLs in `README.md` and `index.html` point to `https://raw.githubusercontent.com/chobizzy/ohmyposhmatrix/master/matrix.omp.json` — keep branch name (`master`) and username (`chobizzy`) consistent when editing either file.
- The theme requires a Nerd Font to render glyphs correctly.
