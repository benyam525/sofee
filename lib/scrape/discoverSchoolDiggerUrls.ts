import { fetchHtml } from "./fetchHtml";
import { DFW_ZIPCITY } from "./dfwZips";

// Pattern for school profile links on SchoolDigger: /go/TX/schools/<digits>/school.aspx
const PROFILE_RE = /href="(https?:\/\/www\.schooldigger\.com\/go\/TX\/schools\/\d+\/school\.aspx)"/gi;

export type ZipCity = { zip: string; city: string };

export async function discoverUrlsForZip(
  z: ZipCity,
  minDelayMs = 2500
): Promise<string[]> {
  const candidates: string[] = [];

  // 1) ZIP search page (most likely)
  candidates.push(`https://www.schooldigger.com/go/TX/zip/${z.zip}/search.aspx`);

  // 2) City search page fallback
  // (Some locales use a city listing page; city name must be URL-encoded; spaces -> %20)
  const citySafe = encodeURIComponent(z.city);
  candidates.push(`https://www.schooldigger.com/go/TX/city/${citySafe}/search.aspx`);

  const found = new Set<string>();
  for (const url of candidates) {
    try {
      const html = await fetchHtml(url, minDelayMs);
      let m: RegExpExecArray | null;
      while ((m = PROFILE_RE.exec(html)) !== null) {
        found.add(m[1]);
      }
      // If this page returned some matches, we keep them; continue to next pattern for more.
    } catch {
      // Ignore page errors and move to the next candidate
    }
  }
  return Array.from(found);
}

export async function discoverAllDFW(minDelayMs = 3000): Promise<string[]> {
  const urls = new Set<string>();
  for (const z of DFW_ZIPCITY) {
    const found = await discoverUrlsForZip(z, minDelayMs);
    found.forEach(u => urls.add(u));
  }
  return Array.from(urls).sort();
}
