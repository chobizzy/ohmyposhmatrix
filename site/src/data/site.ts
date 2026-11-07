// Every visible string on the site lives here. Theme facts are read from the real theme file at
// build time, so the rain, the templates and the colors can't drift from matrix.omp.json.
//
// Assumptions (owner should confirm):
// - Hosted on GitHub Pages at https://chobizzy.github.io/ohmyposhmatrix/ (see astro.config.mjs).
// - The visitor's prompt is shown as `you@localhost` on branch `main`.
// - The prompt is drawn as the README describes it: branch red when dirty, `>>` on its own line.
import themeSource from '../../../matrix.omp.json?raw';

export const theme = JSON.parse(themeSource) as {
  blocks: { segments: { type: string; template: string; foreground: string }[] }[];
};
export { themeSource };

const repo = 'https://github.com/chobizzy/ohmyposhmatrix';
export const RAW = 'https://raw.githubusercontent.com/chobizzy/ohmyposhmatrix/master/matrix.omp.json';

export const site = {
  name: 'matrix.omp.json',
  title: 'matrix.omp.json, a Matrix prompt theme for oh-my-posh',
  description:
    'A Matrix-inspired oh-my-posh prompt theme. Neon green on pure black, four segments and one prompt character. Install it in PowerShell, Bash, Zsh or Fish with one line.',
  url: 'https://chobizzy.github.io/ohmyposhmatrix/',
  author: 'chobizzy',
  repo,
  raw: RAW,
  readme: `${repo}#readme`,
  bytes: new TextEncoder().encode(themeSource).length,
  links: {
    omp: 'https://ohmyposh.dev/docs/installation/windows',
    nerd: 'https://www.nerdfonts.com/',
  },
};

// copy: a line already shown in an earlier step, offered as a button instead of printed twice.
export type Step = { text: string; code?: string[]; copy?: string };
export type Shell = {
  slug: 'pwsh' | 'bash' | 'zsh' | 'fish';
  name: string;
  profile: string;
  init: string;
  summary: string;
  steps: Step[];
  note: string;
  local: { download: string; init: string };
};

const nix = (shell: string, profile: string, reload: string, note: string): Shell => ({
  slug: shell as Shell['slug'],
  name: shell === 'bash' ? 'Bash' : 'Zsh',
  profile,
  init: `eval "$(oh-my-posh init ${shell} --config '${RAW}')"`,
  summary: `One eval line in ${profile}, and every new ${shell === 'bash' ? 'Bash' : 'Zsh'} session opens on the theme.`,
  steps: [
    { text: 'Try it in the session you have open. It lasts until you close the tab.', code: [`eval "$(oh-my-posh init ${shell} --config '${RAW}')"`] },
    { text: `Open ${profile} in any editor.`, code: [`nano ${profile}`] },
    { text: 'Paste the line from step 01 at the end of the file, then save it.', copy: `eval "$(oh-my-posh init ${shell} --config '${RAW}')"` },
    { text: 'Reload the shell, or open a new tab.', code: [reload] },
  ],
  note,
  local: {
    download: `curl -fsSL -o ~/matrix.omp.json '${RAW}'`,
    init: `eval "$(oh-my-posh init ${shell} --config ~/matrix.omp.json)"`,
  },
});

export const shells: Shell[] = [
  {
    slug: 'pwsh',
    name: 'PowerShell',
    profile: '$PROFILE',
    init: `oh-my-posh init pwsh --config '${RAW}' | Invoke-Expression`,
    summary: 'One line in your PowerShell profile, and every new tab opens on the theme.',
    steps: [
      { text: 'Try it in the session you have open. It lasts until you close the tab.', code: [`oh-my-posh init pwsh --config '${RAW}' | Invoke-Expression`] },
      { text: "Create your profile if it doesn't exist yet, then open it.", code: ['if (!(Test-Path $PROFILE)) { New-Item -Path $PROFILE -Type File -Force }', 'notepad $PROFILE'] },
      { text: 'Paste the line from step 01 at the end of the file, then save it.', copy: `oh-my-posh init pwsh --config '${RAW}' | Invoke-Expression` },
      { text: 'Reload the profile, or open a new tab.', code: ['. $PROFILE'] },
    ],
    note: 'A script execution error on reload means PowerShell blocks local scripts. Allow them for your user only with `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.',
    local: {
      download: `Invoke-WebRequest '${RAW}' -OutFile "$env:USERPROFILE\\matrix.omp.json"`,
      init: 'oh-my-posh init pwsh --config "$env:USERPROFILE\\matrix.omp.json" | Invoke-Expression',
    },
  },
  nix('bash', '~/.bashrc', 'source ~/.bashrc', 'On macOS, Terminal starts login shells, which read `~/.bash_profile` instead. Add the line there, or source `~/.bashrc` from it.'),
  nix('zsh', '~/.zshrc', 'exec zsh', 'If Oh My Zsh or another framework sets a theme in `~/.zshrc`, set `ZSH_THEME=""` so the two prompts don\'t fight.'),
  {
    slug: 'fish',
    name: 'Fish',
    profile: '~/.config/fish/config.fish',
    init: `oh-my-posh init fish --config '${RAW}' | source`,
    summary: 'One line in config.fish, and every new Fish session opens on the theme.',
    steps: [
      { text: 'Try it in the session you have open. It lasts until you close the tab.', code: [`oh-my-posh init fish --config '${RAW}' | source`] },
      { text: 'Open your Fish config in any editor.', code: ['nano ~/.config/fish/config.fish'] },
      { text: 'Paste the line from step 01 at the end of the file, then save it.', copy: `oh-my-posh init fish --config '${RAW}' | source` },
      { text: 'Start a fresh Fish session, or open a new tab.', code: ['exec fish'] },
    ],
    note: 'Fish reads `config.fish` at the start of every session, so there is nothing else to reload.',
    local: {
      download: `curl -fsSL -o ~/matrix.omp.json '${RAW}'`,
      init: 'oh-my-posh init fish --config ~/matrix.omp.json | source',
    },
  },
];

export const needs = [
  {
    title: 'oh-my-posh',
    text: 'The prompt engine that reads the theme. Windows installs it with winget, macOS and Linux with Homebrew.',
    code: ['winget install JanDeDobbeleer.OhMyPosh -s winget', 'brew install jandedobbeleer/oh-my-posh/oh-my-posh'],
    link: { label: 'Install docs', href: site.links.omp },
  },
  {
    title: 'A Nerd Font',
    text: 'The OS and branch icons are Nerd Font glyphs. JetBrains Mono Nerd Font is the recommended one; set it as your terminal font after installing.',
    code: ['oh-my-posh font install JetBrainsMono'],
    link: { label: 'nerdfonts.com', href: site.links.nerd },
  },
];

// Segment captions. `type` and `template` come from the theme file; only the sentence is written here.
const words: Record<string, string> = {
  os: "The icon of the machine you're on, so a remote shell never looks like a local one.",
  session: 'Who and where. Your user name in neon, the @ in dark green, then the host.',
  path: 'The full path, never shortened, inside dark green brackets. Folders split on forward slashes on every OS, Windows included.',
  git: 'The branch you are on. A check while the working tree is clean, and a red cross the moment you change a file.',
  text: 'The prompt character, alone on the next line, so a long path never pushes your command off screen.',
};
export const segments = theme.blocks.flatMap((b) => b.segments).map((s) => ({
  type: s.type,
  template: s.template.trim(),
  text: words[s.type] ?? '',
}));

export const palette = [
  { hex: '#008F11', role: 'Accent', text: 'The @, the brackets and the parentheses. Five characters per prompt.' },
  { hex: '#FF0000', role: 'Dirty', text: 'Used once: the branch, while the working tree has changes.' },
  { hex: '#000000', role: 'Background', text: "Every segment is transparent, so this is your terminal's own black." },
];

// Where each part of a page lives, as the prompt's [path] segment shows it.
export const paths = [
  { path: '~', href: '/', label: 'home' },
  { path: '~/segments', href: '/#segments', label: 'how the prompt reads' },
  { path: '~/palette', href: '/#palette', label: 'the four colors' },
  { path: '~/install', href: '/#install', label: 'one line per shell' },
  ...shells.map((s) => ({ path: `~/install/${s.slug}`, href: `/install/${s.slug}/`, label: `${s.name} guide` })),
];
