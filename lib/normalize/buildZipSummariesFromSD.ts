import fs from "fs";
import path from "path";
import { SchoolRecord } from "../../types/schools";

const DFW_ZIPS = ["75035","75034","75013","75070","75072","75024","75025","75093","75078","75009","76092","76034","75007","75010","75019","75052"];

function mean(arr:number[]): number|null {
  const v = arr.filter(x=>Number.isFinite(x));
  if(!v.length) return null;
  return v.reduce((a,b)=>a+b,0)/v.length;
}

export function buildZipSummaries(
  inPath="public/data/schools_normalized.json",
  outPath="public/data/zip_school_summaries.json",
  year: number = new Date().getFullYear()
){
  const schools: SchoolRecord[] = JSON.parse(fs.readFileSync(path.resolve(inPath),"utf8"));
  const byZip: Record<string, SchoolRecord[]> = Object.fromEntries(DFW_ZIPS.map(z=>[z, []]));

  for (const s of schools) {
    if (s.zip && byZip[s.zip]) byZip[s.zip].push(s);
  }

  const summaries = [];
  for (const zip of DFW_ZIPS) {
    const list = byZip[zip].filter(s => (s.year||year) === year);
    const ES = list.filter(s=>s.level==="ES").length;
    const MS = list.filter(s=>s.level==="MS").length;
    const HS = list.filter(s=>s.level==="HS").length;

    const math = mean(list.map(s=> (s.staarMathProficiency??NaN) ));
    const read = mean(list.map(s=> (s.staarReadingProficiency??NaN) ));

    // Use SchoolDigger stars/rank to approximate %A for now
    const pctA = (() => {
      const denom = list.length;
      if (!denom) return null;
      const aLike = list.filter(s => (s.sdRank?.stateRank && s.sdRank?.stateTotal) ? (s.sdRank.stateRank / s.sdRank.stateTotal) <= 0.2 : (s.sdRank?.ratingStars ?? 0) >= 4.0).length;
      return Math.round((aLike/denom)*100);
    })();

    // No 5y history from HTML → set null
    const volatility = { math: null, reading: null };
    const trend = { math: null, reading: null };

    const topPerformers = list
      .slice()
      .sort((a,b) => ((b.staarMathProficiency??0)+(b.staarReadingProficiency??0)) - ((a.staarMathProficiency??0)+(a.staarReadingProficiency??0)))
      .slice(0,3)
      .map(s => s.campusId);

    summaries.push({
      zip, year,
      counts: { total: list.length, ES, MS, HS },
      avgProficiency: {
        math: math==null?null:Math.round(math*100)/100,
        reading: read==null?null:Math.round(read*100)/100
      },
      pctRatedA: pctA,
      volatility, trend,
      topPerformers,
      updatedAt: new Date().toISOString().slice(0,7),
      sources: ["SchoolDigger HTML"]
    });
  }

  fs.writeFileSync(path.resolve(outPath), JSON.stringify(summaries, null, 2));
  return summaries.length;
}
