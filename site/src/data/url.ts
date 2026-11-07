// Prefix a root-relative path with the deploy base (/ohmyposhmatrix on GitHub Pages).
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const u = (path: string) => base + path;
