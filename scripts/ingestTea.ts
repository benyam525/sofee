import { ingestTeaCSV } from "../lib/ingestTea";

console.log("[v0] Starting TEA CSV ingestion...");

const count = ingestTeaCSV("data/schools_raw_tea.csv", "data/schools_normalized.json");

console.log(`[v0] Successfully ingested ${count} school records`);
console.log("[v0] Output written to: data/schools_normalized.json");
