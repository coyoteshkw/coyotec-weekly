// Fetch Noto Sans SC from Google Fonts at build time, no local bundling needed
let _font400: Buffer | null = null;
let _font700: Buffer | null = null;

const GOOGLE_FONTS_CSS =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700";

async function fetchFontUrl(weight: number): Promise<string> {
  const css = await fetch(GOOGLE_FONTS_CSS, {
    headers: { "User-Agent": "Mozilla/5.0" },
  }).then((r) => r.text());

  const urls = [...css.matchAll(/url\((https:\/\/[^)]+\.ttf)\)/g)].map(
    (m) => m[1]
  );

  // Google Fonts returns 400 first, then 700
  const idx = weight === 400 ? 0 : urls.length > 1 ? 1 : 0;
  return urls[idx];
}

async function fetchFontData(weight: number): Promise<Buffer> {
  const url = await fetchFontUrl(weight);
  const res = await fetch(url);
  return Buffer.from(await res.arrayBuffer());
}

export async function getFont400(): Promise<Buffer> {
  if (!_font400) _font400 = await fetchFontData(400);
  return _font400;
}

export async function getFont700(): Promise<Buffer> {
  if (!_font700) _font700 = await fetchFontData(700);
  return _font700;
}
