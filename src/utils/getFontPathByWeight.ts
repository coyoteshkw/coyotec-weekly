import type { FontData } from "astro:assets";

export function getFontPathByWeight(
  fonts: FontData[],
  weight: number,
  options?: {
    style?: "normal" | "italic";
    format?: string;
  }
): string | undefined {
  if (!fonts || !Array.isArray(fonts)) {
    throw new Error("Font data is missing or invalid. The font may not have been downloaded yet — try restarting the dev server.");
  }

  const style = options?.style ?? "normal";
  const format = options?.format ?? "truetype";

  for (const font of fonts) {
    if (font.weight === String(weight) && font.style === style) {
      const src = font.src.find(file => file.format === format) ?? font.src[0];
      if (src) return src.url;
    }
  }

  return undefined;
}
