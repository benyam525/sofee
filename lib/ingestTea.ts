import fs from "fs";
import path from "path";
import { SchoolRecord } from "@/types/schools";

type Row = Record<string,string|number|undefined>; // incoming CSV row

// Map raw row → SchoolRecord
function rowToSchool(r: Row): SchoolRecord | null {
  // Adjust selectors to your TEA CSV headers
  const campusId = String(r["Campus ID"] ?? r["campus_id"] ?? "").trim();
  const districtId = String(r["District ID"] ?? r["district_id"] ?? "").trim();
  const name = String(r["Campus Name"] ?? r["campus_name"] ?? "").trim();
  if (!campusId || !name) return null;

  const zip = (String(r["ZIP"] ?? r["Zip"] ?? "") || "").trim() || null;
  const city = (String(r["City"] ?? "") || "").trim() || null;
  const address = (String(r["Address"] ?? "") || "").trim() || null;
  const levelRaw = String(r["Level"] ?? r["Campus Level"] ?? "").toUpperCase();
  const level = levelRaw.includes("ELEMENTARY") || levelRaw==="ES" ? "ES"
             : levelRaw.includes("MIDDLE") || levelRaw==="MS" ? "MS"
             : levelRaw.includes("HIGH")   || levelRaw==="HS" ? "HS"
             : levelRaw.includes("K-8")    || levelRaw==="K8" ? "K8"
             : "Other";

  const year = Number(r["Year"] ?? r["year"] ?? 2024);

  const p = (v: any) => {
    const n = Number(v);
    if (Number.isFinite(n)) {
      // CSV may contain percent 0–100; normalize to 0–1 if needed
      return n > 1.0 ? Math.max(0, Math.min(1, n/100)) : Math.max(0, Math.min(1, n));
    }
    return null;
  };

  const staarMathProficiency    = p(r["STAAR Math % at/above"] ?? r["math_prof"]);
  const staarReadingProficiency = p(r["STAAR Reading % at/above"] ?? r["reading_prof"]);
  const growthMath              = p(r["Math Growth"] ?? r["growth_math"]);
  const growthReading           = p(r["Reading Growth"] ?? r["growth_reading"]);

  const accountabilityRating = (String(r["Rating"] ?? r["Accountability"] ?? "") || "").toUpperCase() as any || null;
  const studentCount = Number(r["Enrollment"] ?? r["Student Count"] ?? NaN);
  const studentTeacherRatio = Number(r["Student/Teacher Ratio"] ?? NaN);

  const rec: SchoolRecord = {
    campusId, districtId, name, address, city, zip,
    level, gradeSpan: String(r["Grades"] ?? r["Grade Span"] ?? "") || null,
    studentCount: Number.isFinite(studentCount) ? studentCount : null,
    studentTeacherRatio: Number.isFinite(studentTeacherRatio) ? studentTeacherRatio : null,
    year,
    staarMathProficiency,
    staarReadingProficiency,
    growthMath,
    growthReading,
    accountabilityRating: ["A","B","C","D","F"].includes(accountabilityRating) ? accountabilityRating : null,
    history: [], // filled later if you load prior-year CSVs
    sources: ["TEA TAPR"],
    updatedAt: new Date().toISOString().slice(0,7)
  };

  return rec;
}

export function ingestTeaCSV(inPath="data/schools_raw_tea.csv", outPath="data/schools_normalized.json") {
  const raw = fs.readFileSync(path.resolve(inPath), "utf8");
  // Lightweight CSV parser
  const rows: Row[] = raw
    .split(/\r?\n/).filter(Boolean)
    .map((line, idx) => {
      if (idx===0) {
        (global as any).__headers = line.split(",").map(h=>h.trim());
        return null as any;
      }
      const headers = (global as any).__headers as string[];
      const cols = line.split(","); // assume clean CSV from TEA export
      const r: Row = {};
      headers.forEach((h, i) => r[h] = cols[i]);
      return r;
    })
    .filter(Boolean) as Row[];

  const records: SchoolRecord[] = [];
  for (const r of rows) {
    const s = rowToSchool(r);
    if (s) records.push(s);
  }
  fs.writeFileSync(path.resolve(outPath), JSON.stringify(records, null, 2));
  return records.length;
}
