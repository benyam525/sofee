import fs from "fs";
import path from "path";
import pLimit from "p-limit";
import { fetchHtml } from "../lib/scrape/fetchHtml";
import { parseSchoolDigger } from "../lib/scrape/parseSchoolDigger";
import { toSchoolRecord } from "../lib/normalize/toSchoolRecord";

const LIMIT = pLimit(1); // polite; increase to 2–3 with caution
const MIN_DELAY_MS = 3000;

async function main() {
  const urls: string[] = JSON.parse(fs.readFileSync(path.resolve("data/sd_seed_urls.json"), "utf8"));
  const outPath = path.resolve("public/data/schools_normalized.json");

  const records = [];
  for (const url of urls) {
    const html = await LIMIT(() => fetchHtml(url, MIN_DELAY_MS));
    const parsed = parseSchoolDigger(html, url);
    const rec = toSchoolRecord(parsed);
    records.push(rec);
    console.log("Scraped:", rec.name, rec.zip, rec.level, rec.staarMathProficiency, rec.staarReadingProficiency);
  }

  fs.writeFileSync(outPath, JSON.stringify(records, null, 2));
  console.log(`Wrote ${records.length} records -> ${outPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
