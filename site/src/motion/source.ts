// The theme file as a glyph stream: everything that falls or scrambles on this site is a
// character of matrix.omp.json, whitespace removed so every cell holds a glyph.
import { themeSource } from '../data/site';

export const stream = Array.from(themeSource.replace(/\s+/g, ''));
export const glyphs = [...new Set(stream)];
export const randomGlyph = () => glyphs[(Math.random() * glyphs.length) | 0];
