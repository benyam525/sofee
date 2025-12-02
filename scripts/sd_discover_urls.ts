import fs from "fs";
import path from "path";
import pLimit from "p-limit";
import { DFW_ZIPCITY } from "../lib/scrape/dfwZips";
import { discoverUrlsForZip } from "../lib/scrape/discoverSchoolDiggerUrls";

const LIMIT = pLimit(1); // be polite
const MIN_DELAY_MS = 3000;

async function main() {
  const all = new Set<string>();
  for (const z of DFW_ZIPCITY) {
    const urls = await LIMIT(() => discoverUrlsForZip(z, MIN_DELAY_MS));
    console.log(`[${z.zip} ${z.city}] found ${urls.length} profiles`);
    urls.forEach(u => all.add(u));
  }

  const outPath = path.resolve("data/sd_seed_urls.json");
  fs.writeFileSync(outPath, JSON.stringify(Array.from(all).sort(), null, 2));
  console.log(`Wrote ${all.size} unique profile URLs → ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
