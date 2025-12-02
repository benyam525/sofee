import fs from "fs";
import path from "path";
import { SchoolRecord, ZipSchoolSummary } from "@/types/schools";

// Your app's 16 ZIPs:
const DFW_ZIPS = ["75035","75034","75013","75070","75072","75024","75025","75093","75078","75009","76092","76034","75007","75010","75019","75052"];

function mean(nums: number[]): number | null {
  const v = nums.filter(n => Number.isFinite(n));
  if (!v.length) return null;
  return v.reduce((a,b)=>a+b,0)/v.length;
}

function std(nums: number[]): number | null {
  const v = nums.filter(n => Number.isFinite(n));
  if (v.length < 2) return null;
  const m = mean(v)!;
  const s2 = v.reduce((acc, x) => acc + (x-m)*(x-m), 0)/(v.length-1);
  return Math.sqrt(s2);
}

export function buildZipSummaries(
  schoolsPath="data/schools_normalized.json",
  outPath="data/zip_school_summaries.json",
  year=2024
) {
  const schools: SchoolRecord[] = JSON.parse(fs.readFileSync(path.resolve(schoolsPath),"utf8"));

  const byZip: Record<string, SchoolRecord[]> = {};
  for (const z of DFW_ZIPS) byZip[z] = [];
  for (const s of schools) {
    if (s.zip && byZip[s.zip]) byZip[s.zip].push(s);
  }

  const summaries: ZipSchoolSummary[] = [];
  for (const zip of DFW_ZIPS) {
    const list = byZip[zip].filter(s => s.year === year);
    const ES = list.filter(s => s.level==="ES").length;
    const MS = list.filter(s => s.level==="MS").length;
    const HS = list.filter(s => s.level==="HS").length;

    const math = mean(list.map(s => s.staarMathProficiency ?? NaN));
    const reading = mean(list.map(s => s.staarReadingProficiency ?? NaN));

    const pctA = (() => {
      const denom = list.length || 0;
      if (!denom) return null;
      const num = list.filter(s => s.accountabilityRating==="A").length;
      return (num/denom)*100;
    })();

    // Volatility & trend from history (if present)
    const fiveYMath: number[] = [];
    const fiveYRead: number[] = [];
    for (const s of list) {
      (s.history ?? []).forEach(h => {
        if (h.staarMathProficiency != null) fiveYMath.push(h.staarMathProficiency);
        if (h.staarReadingProficiency != null) fiveYRead.push(h.staarReadingProficiency);
      });
    }
    const volatility = { math: std(fiveYMath), reading: std(fiveYRead) };

    // Very simple trend: last minus first
    const trend = {
      math: fiveYMath.length >= 2 ? (fiveYMath[fiveYMath.length-1] - fiveYMath[0]) : null,
      reading: fiveYRead.length >= 2 ? (fiveYRead[fiveYRead.length-1] - fiveYRead[0]) : null
    };

    const topPerformers = list
      .sort((a,b) => ( (b.staarMathProficiency ?? 0)+(b.staarReadingProficiency ?? 0) ) - ( (a.staarMathProficiency ?? 0)+(a.staarReadingProficiency ?? 0) ))
      .slice(0,3)
      .map(s => s.campusId);

    summaries.push({
      zip,
      year,
      counts: { total: list.length, ES, MS, HS },
      avgProficiency: { math: math==null?null:Math.round(math*100)/100, reading: reading==null?null:Math.round(reading*100)/100 },
      pctRatedA: pctA==null?null:Math.round(pctA),
      volatility: { math: volatility.math==null?null:Math.round(volatility.math*100)/100, reading: volatility.reading==null?null:Math.round(volatility.reading*100)/100 },
      trend: { math: trend.math==null?null:Math.round(trend.math*100)/100, reading: trend.reading==null?null:Math.round(trend.reading*100)/100 },
      topPerformers,
      updatedAt: new Date().toISOString().slice(0,7)
    });
  }

  fs.writeFileSync(path.resolve(outPath), JSON.stringify(summaries, null, 2));
  return summaries.length;
}
