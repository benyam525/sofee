import * as cheerio from "cheerio";

const pct = (s?: string | null) => {
  if (!s) return null;
  const m = s.replace(/,/g, "").match(/(\d{1,3})(?:\.\d+)?\s*%/);
  return m ? Math.max(0, Math.min(100, parseFloat(m[1]))) : null;
};

const num = (s?: string | null) => {
  if (!s) return null;
  const m = s.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
};

const clean = (s?: string | null) => (s || "").replace(/\s+/g, " ").trim() || null;

export type ParsedSD = {
  campus: {
    name: string | null;
    district: string | null;
    address: string | null;
    city: string | null;
    zip: string | null;
    grades: string | null;
    level: "ES" | "MS" | "HS" | "K8" | "Other";
    type?: { public?: boolean; charter?: boolean; magnet?: boolean; title1?: boolean };
  };
  ranking: {
    stateRank: number | null;
    stateTotal: number | null;
    ratingStars?: number | null;
    rankDelta?: number | null;
  };
  testing: {
    year: number | null;
    subjects: Array<{ name: string; proficiencyPct: number | null; districtPct?: number | null; statePct?: number | null }>;
    gradeBreakouts?: Array<{ grade: string; [k: string]: number | null }>;
  };
  population: {
    enrollment: number | null;
    studentTeacherRatio: number | null;
    demographics?: Record<string, number | null>;
    econDisadvantagedPct?: number | null;
  };
  source: { site: "SchoolDigger"; url: string; dataYear?: string | null; lastScrapedAt: string };
};

function inferLevel(grades: string | null): "ES" | "MS" | "HS" | "K8" | "Other" {
  const g = (grades || "").toUpperCase();
  if (/K-?8|PK-?8|K–8|PK–8/.test(g)) return "K8";
  if (/PK|K|1|2|3|4|5/.test(g) && !/9|10|11|12/.test(g)) return "ES";
  if (/(6|7|8)\b/.test(g) && !/9|10|11|12/.test(g)) return "MS";
  if (/(9|10|11|12)\b/.test(g)) return "HS";
  return "Other";
}

export function parseSchoolDigger(html: string, url: string): ParsedSD {
  const $ = cheerio.load(html);

  // Identity
  const name = clean($("h1").first().text());
  // Try to capture district in a "School District" line or metadata card
  const district = clean($("*:contains('District')").filter((_i, el) => /District/i.test($(el).text())).first().next().text())
    || (clean($("a[href*='/district/']").first().text()));
  // Address block: grab first block with a 5-digit ZIP
  const bodyText = $("body").text();
  const zip = (bodyText.match(/\b(\d{5})(?:-\d{4})?\b/) || [])[1] || null;
  // Heuristic address lines near "Address"
  const addressLabel = $("*").filter((_i, el) => /Address/i.test($(el).text())).first();
  const addr = clean(addressLabel.next().text()) || null;

  // City: try to grab the token before ZIP
  let city: string | null = null;
  const cityMatch = bodyText.match(/([A-Za-z.\-\s]+),\s*TX\s*\d{5}/);
  if (cityMatch) city = clean(cityMatch[1]);

  // Grades / Type
  const gradesLabel = $("*").filter((_i, el) => /Grades/i.test($(el).text())).first();
  const grades = clean(gradesLabel.next().text()) || null;
  const level = inferLevel(grades);

  const typeFlagsText = $("body").text();
  const type = {
    public: /Public School/i.test(typeFlagsText) || undefined,
    charter: /Charter/i.test(typeFlagsText) || undefined,
    magnet: /Magnet/i.test(typeFlagsText) || undefined,
    title1: /Title\s*I/i.test(typeFlagsText) || undefined
  };

  // Ranking (e.g., "Rank: #441 of 4,651 Texas Elementary Schools")
  const rankText = $("*").filter((_i, el) => /Rank/i.test($(el).text()) && /of/.test($(el).text())).first().text();
  const rM = rankText.match(/#?\s*(\d{1,5}).*?of\s*(\d{1,5})/i);
  const stateRank = rM ? parseInt(rM[1], 10) : null;
  const stateTotal = rM ? parseInt(rM[2], 10) : null;

  // Stars (if rendered as "4.5" or "★★★★★" style)
  const starsText = $("*").filter((_i, el) => /Rating/i.test($(el).text()) || /stars/i.test($(el).text())).first().text();
  const ratingStars = num(starsText);

  // Year (look for "2024 Test Scores" header etc.)
  const yearMatch = bodyText.match(/(20\d{2})\s*(Test|Scores|STAAR)/i);
  const dataYear = yearMatch ? yearMatch[1] : null;

  // Test table: look for subject rows
  const subjects: ParsedSD["testing"]["subjects"] = [];
  $("table").each((_i, tbl) => {
    const tblText = $(tbl).text();
    if (!/Test|STAAR|Scores|Profic/i.test(tblText)) return;

    $(tbl).find("tr").each((_j, tr) => {
      const tds = $(tr).find("td").map((_k, td) => clean($(td).text()) || "").get();
      if (tds.length < 2) return;
      const subject = tds[0];
      if (!/(Math|Reading|ELA|Science|Writing)/i.test(subject)) return;

      const s = {
        name: subject.replace(/\s+/g, " "),
        proficiencyPct: pct(tds.find(x => /\d+%/.test(x))),
        districtPct: pct(tds.find(x => /District/i.test(x) && /\d+%/.test(x))),
        statePct: pct(tds.find(x => /Texas|State/i.test(x) && /\d+%/.test(x))),
      };
      subjects.push(s);
    });
  });

  // Enrollment / ratio
  const enr = num(($("*:contains('Students')").filter((_i, el) => /Students/i.test($(el).text())).first().next().text()) || undefined)
    || num((bodyText.match(/Students?:\s*([\d,]+)/i) || [])[1] || "");
  const ratio = num((bodyText.match(/Student\/Teacher\s*Ratio:\s*([\d.]+)/i) || [])[1] || "");

  // Demographics (if percentages are listed; capture common labels)
  const demographics: Record<string, number | null> = {};
  const demoPairs = [
    "Hispanic", "White", "Asian", "Black", "African American", "Two or more", "Native", "Pacific"
  ];
  demoPairs.forEach(label => {
    const re = new RegExp(`${label}[^\\d%]*?(\\d{1,3})%`, "i");
    const m = bodyText.match(re);
    if (m) demographics[label] = parseFloat(m[1]);
  });
  const econ = num((bodyText.match(/Economically\s*Disadvantaged[^\\d%]*?(\d{1,3})%/i) || [])[1] || "");

  return {
    campus: { name, district, address: addr, city, zip, grades, level, type },
    ranking: { stateRank, stateTotal, ratingStars: ratingStars ?? null, rankDelta: null },
    testing: { year: dataYear ? parseInt(dataYear, 10) : null, subjects, gradeBreakouts: [] },
    population: { enrollment: enr ?? null, studentTeacherRatio: ratio ?? null, demographics, econDisadvantagedPct: econ ?? null },
    source: { site: "SchoolDigger", url, dataYear, lastScrapedAt: new Date().toISOString() }
  };
}
