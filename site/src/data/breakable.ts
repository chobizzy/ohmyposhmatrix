// HTML for a shell command that wraps only at spaces and after a slash, never inside a token
// (so `--config` or `New-Item` never split at their hyphen). Each piece is a nowrap span;
// <wbr> and the spans add no text, so copying the rendered command still yields the exact line.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const nw = (s: string) => (s ? `<span class="nw">${esc(s)}</span>` : '');
export const breakable = (code: string) =>
  code.split(' ').map((tok) => tok.split('/').map(nw).join('/<wbr>')).join(' ');

/** Prose with `backticked` commands: the commands get the same wrapping rules, in <code>. */
export const withCode = (text: string) =>
  text.split('`').map((part, i) => (i % 2 ? `<code>${breakable(part)}</code>` : esc(part))).join('');
