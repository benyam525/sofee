import fs from "fs";
import path from "path";
import pLimit from "p-limit";
import { fetchHtml } from "./fetchHtml";
import { parseSchoolDigger } from "./parseSchoolDigger";
import { toSchoolRecord } from "../normalize/toSchoolRecord";

export async function runScrapeFromUrls(
  urls: string[], 
  outPath = "public/data/schools_normalized.json", 
  minDelayMs = 3000
): Promise<number> {
  const LIMIT = pLimit(1);
  const records: any[] = [];
  
  for (const url of urls) {
    try {
      const html = await LIMIT(() => fetchHtml(url, minDelayMs));
      const parsed = parseSchoolDigger(html, url);
      const rec = toSchoolRecord(parsed);
      records.push(rec);
    } catch (error) {
      console.error(`[v0] Failed to scrape ${url}:`, error);
    }
  }
  
  fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
  fs.writeFileSync(path.resolve(outPath), JSON.stringify(records, null, 2));
  
  return records.length;
}
