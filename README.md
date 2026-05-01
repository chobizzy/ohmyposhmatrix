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

**Bash / Zsh:**
```bash
eval "$(oh-my-posh init bash --config 'https://raw.githubusercontent.com/chobizzy/ohmyposhmatrix/master/matrix.omp.json')"
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

**Bash (`~/.bashrc`) / Zsh (`~/.zshrc`):**
```bash
eval "$(oh-my-posh init bash --config ~/matrix.omp.json)"
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

## License

MIT
