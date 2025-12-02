import axios from "axios";

const DEFAULT_UA = "RelocateDFW/1.0 (+contact@example.com)";
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function fetchHtml(url: string, minDelayMs = 2500, userAgent = DEFAULT_UA): Promise<string> {
  await delay(minDelayMs); // rate-limit, be nice
  const res = await axios.get(url, {
    headers: { "User-Agent": userAgent, "Accept": "text/html,application/xhtml+xml" },
    timeout: 20000,
    validateStatus: s => s >= 200 && s < 400
  });
  return String(res.data || "");
}
