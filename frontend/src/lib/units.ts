/**
 * Sizing helpers that follow the root font size, which grows with the screen (see styles/base.css).
 * Use these for inline sizes so they scale with the rest of the CSS.
 */

/** A design-pixel value (at the 16px base) as a rem string. */
export const rem = (px: number) => `${px / 16}rem`;

/** Current root font size relative to the 16px base, e.g. 1.25 on a large monitor. */
export const rootScale = () => parseFloat(getComputedStyle(document.documentElement).fontSize) / 16 || 1;
