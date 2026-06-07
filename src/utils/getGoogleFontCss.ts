/**
 * Fetch Google Fonts CSS and return the raw CSS text.
 * Used to obtain font-file URLs for Satori without relying on
 * Astro’s Font component (which only downloads fonts referenced in templates).
 */
export async function getGoogleFontCss(
  family: string,
  weights: number[],
): Promise<string> {
  const wght = weights.join(";");
  const url = `https://fonts.googleapis.com/css2?family=${
    encodeURIComponent(family)
  }:wght@${wght}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch Google Font CSS for "${family}": ${res.status} ${res.statusText}`,
    );
  }

  return res.text();
}

/**
 * Parse a Google Fonts CSS string and return an array of { weight, url }
 * for each @font-face src entry.
 */
export function parseFontUrls(css: string): { weight: number; url: string }[] {
  const result: { weight: number; url: string }[] = [];
  const blocks = css.split("}");

  for (const block of blocks) {
    const weightMatch = block.match(/font-weight:\s*(\d+)/);
    const urlMatch = block.match(/url\(([^)]+)\)/);
    if (weightMatch && urlMatch) {
      result.push({
        weight: parseInt(weightMatch[1]),
        url: urlMatch[1],
      });
    }
  }

  return result;
}
