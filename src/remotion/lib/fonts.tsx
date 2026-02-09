import { staticFile } from "remotion";

/**
 * Returns a <style> block that loads project fonts for Remotion.
 * Place <FontStyles /> at the top of your composition.
 *
 * We load:
 *  - Geist Sans via Google Fonts CDN (used by the Next.js site)
 *  - Mozilla Headline from the local public/fonts/ directory
 */
export function FontStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&display=swap');

@font-face {
  font-family: 'Mozilla Headline';
  src: url('${staticFile("fonts/MozillaHeadline-Variable.woff2")}') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
`,
      }}
    />
  );
}

export const FONTS = {
  heading: "'Mozilla Headline', 'Geist', sans-serif",
  body: "'Geist', sans-serif",
  mono: "'Geist Mono', monospace",
} as const;
