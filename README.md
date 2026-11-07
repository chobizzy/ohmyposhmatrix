# matrix.omp.json

```
  01 10 11 00 01 10 11 00 01 10 11 00 01 10 11

 __  __    _  _____ ____  _____  __
|  \/  |  / \|_   _|  _ \|_ _\ \/ /
| |\/| | / _ \ | | | |_) || |  >  <
| |  | |/ ___ \| | |  _ < | | / /\ \
|_|  |_/_/   \_\_| |_| \_\___/_/  \_\

  00 11 10 01 00 11 10 01 00 11 10 01 00 11
```

> A Matrix-inspired [oh-my-posh](https://ohmyposh.dev) theme. Neon green on pure black.

**Website:** https://chobizzy.github.io/ohmyposhmatrix/ (live preview and an install guide for each shell)

---

## Preview

```
  chobi@DESKTOP-XYZ [~/Projects/ohmyposhmatrix] (main ✓)
>> _
```

Git dirty state turns **red**:

```
  chobi@DESKTOP-XYZ [~/Projects/ohmyposhmatrix] (main ✗)
>> _
```

---

## Requirements

- [oh-my-posh](https://ohmyposh.dev/docs/installation/windows) installed
- A [Nerd Font](https://www.nerdfonts.com/) set as your terminal font (JetBrains Mono Nerd Font recommended)

---

## Installation

### Option A — Use directly from GitHub

**PowerShell:**
```powershell
oh-my-posh init pwsh --config 'https://raw.githubusercontent.com/chobizzy/ohmyposhmatrix/master/matrix.omp.json' | Invoke-Expression
```

To load the theme in every new PowerShell session, add that line to your PowerShell profile:

1. Create the profile if it doesn't exist yet, then open it:
   ```powershell
   if (!(Test-Path $PROFILE)) { New-Item -Path $PROFILE -Type File -Force }
   notepad $PROFILE
   ```
2. Add this line to the end of the file and save it:
   ```powershell
   oh-my-posh init pwsh --config 'https://raw.githubusercontent.com/chobizzy/ohmyposhmatrix/master/matrix.omp.json' | Invoke-Expression
   ```
3. Reload the profile (or open a new terminal):
   ```powershell
   . $PROFILE
   ```

> If you get a script execution error, allow local scripts with `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

**Bash:**
```bash
eval "$(oh-my-posh init bash --config 'https://raw.githubusercontent.com/chobizzy/ohmyposhmatrix/master/matrix.omp.json')"
```

**Zsh:**
```zsh
eval "$(oh-my-posh init zsh --config 'https://raw.githubusercontent.com/chobizzy/ohmyposhmatrix/master/matrix.omp.json')"
```

**Fish:**
```fish
oh-my-posh init fish --config 'https://raw.githubusercontent.com/chobizzy/ohmyposhmatrix/master/matrix.omp.json' | source
```

### Option B — Local file

1. Download `matrix.omp.json`
2. Add to your shell profile:

**PowerShell (`$PROFILE`):**
```powershell
oh-my-posh init pwsh --config "$env:USERPROFILE\matrix.omp.json" | Invoke-Expression
```

**Bash (`~/.bashrc`):**
```bash
eval "$(oh-my-posh init bash --config ~/matrix.omp.json)"
```

**Zsh (`~/.zshrc`):**
```zsh
eval "$(oh-my-posh init zsh --config ~/matrix.omp.json)"
```

---

## Segments

| Segment | Description |
|---------|-------------|
| OS icon | Your operating system's icon |
| `user@host` | Current user and hostname |
| `[path]` | Current working directory |
| `(branch ✓/✗)` | Git branch — green when clean, red when dirty |
| `>>` | Prompt character |

---

## Color Palette

| Role | Hex | Preview |
|------|-----|---------|
| Primary | `#00FF41` | Neon green |
| Accent | `#008F11` | Dark green |
| Dirty | `#FF0000` | Red (git dirty state) |
| Background | `#000000` | Pure black (terminal default) |

---

## Website

The theme's site, with an install guide for PowerShell, Bash, Zsh and Fish, is at **https://chobizzy.github.io/ohmyposhmatrix/**.

Its source is in `site/` (built with [Astro](https://astro.build)). The site reads `matrix.omp.json` at build time, so the colors, segment templates and the falling characters always match the theme file.

### Run it locally

Requires Node 22 or newer.

```bash
cd site
npm install
npm run dev       # dev server at http://localhost:4321/ohmyposhmatrix/
```

To check the production build:

```bash
npm run build     # static site in site/dist/
npm run preview   # serves the build at http://localhost:4321/ohmyposhmatrix/
```

### Deploy

Pushing to `master` deploys the site to GitHub Pages automatically when anything in `site/`, `matrix.omp.json` or the workflow changes (`.github/workflows/deploy-site.yml`). You can also run the **Deploy site** workflow by hand from the repo's Actions tab.

### Edit the content

- All text on the site, including the install commands for each shell: `site/src/data/site.ts`
- The concept and design decisions: `site/DESIGN.md`

---

## License

MIT
