import { c as createServerRpc } from "./createServerRpc-FXVUoZlp.js";
import { a5 as createServerFn } from "./worker-entry-sq6vnRaQ.js";
import { B as BANKS, a as BANK_DATA_DATE } from "./bank-data-DO0SpFZT.js";
import { r as readEdgeCache, w as writeEdgeCache, f as fetchLiveQuotes } from "./quotes-CdZQja0w.js";
import "node:events";
import "node:stream";
import "node:async_hooks";
import "node:stream/web";
const EM_HEADERS = {
  Referer: "https://data.eastmoney.com/",
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
};
function reduceDividends(rows) {
  const byCodeYear = /* @__PURE__ */ new Map();
  const latestAnnualYear = /* @__PURE__ */ new Map();
  for (const row of rows) {
    const code = row.SECURITY_CODE;
    const reportDate = row.REPORT_DATE;
    const per10 = row.PRETAX_BONUS_RMB;
    if (!code || !reportDate || per10 == null || !Number.isFinite(per10) || per10 <= 0)
      continue;
    const year = Number(reportDate.slice(0, 4));
    const isYearEnd = reportDate.slice(5, 10) === "12-31";
    if (!Number.isFinite(year)) continue;
    const perShare = per10 / 10;
    const yearMap = byCodeYear.get(code) ?? /* @__PURE__ */ new Map();
    yearMap.set(year, (yearMap.get(year) ?? 0) + perShare);
    byCodeYear.set(code, yearMap);
    if (isYearEnd) {
      latestAnnualYear.set(code, Math.max(latestAnnualYear.get(code) ?? 0, year));
    }
  }
  const result = /* @__PURE__ */ new Map();
  for (const [code, year] of latestAnnualYear) {
    const dps = byCodeYear.get(code)?.get(year);
    if (dps != null && dps > 0) {
      result.set(code, { dps, fiscalYear: year });
    }
  }
  return result;
}
async function fetchDividends(codes, cacheName, ttl = 60 * 60 * 12) {
  if (codes.length === 0) return /* @__PURE__ */ new Map();
  const cacheKey = new Request(`https://dividends.internal/${cacheName}`);
  const cached = await readEdgeCache(cacheKey);
  if (cached != null) {
    try {
      return reduceDividends(JSON.parse(cached));
    } catch {
    }
  }
  const inClause = codes.map((c) => `"${c}"`).join(",");
  const params = new URLSearchParams({
    reportName: "RPT_SHAREBONUS_DET",
    columns: "SECURITY_CODE,REPORT_DATE,PRETAX_BONUS_RMB,ASSIGN_PROGRESS",
    filter: `(SECURITY_CODE in (${inClause}))`,
    pageNumber: "1",
    pageSize: "1000",
    sortColumns: "REPORT_DATE",
    sortTypes: "-1"
  });
  try {
    const res = await fetch(
      `https://datacenter-web.eastmoney.com/api/data/v1/get?${params}`,
      { headers: EM_HEADERS, signal: AbortSignal.timeout(6e3) }
    );
    if (!res.ok) return /* @__PURE__ */ new Map();
    const json = await res.json();
    const data = json.result?.data;
    if (!json.success || !Array.isArray(data)) return /* @__PURE__ */ new Map();
    await writeEdgeCache(cacheKey, JSON.stringify(data), ttl);
    return reduceDividends(data);
  } catch {
    return /* @__PURE__ */ new Map();
  }
}
const listBanks_createServerFn_handler = createServerRpc({
  id: "966f1d465458ac628a0f5ed28f2fe1e01126d5b764b3463f8d5c662a181227ea",
  name: "listBanks",
  filename: "src/server/banks.ts"
}, (opts) => listBanks.__executeServer(opts));
const listBanks = createServerFn({
  method: "GET"
}).handler(listBanks_createServerFn_handler, async () => {
  const symbols = BANKS.map((b) => (b.market === "SH" ? "sh" : "sz") + b.code).join(",");
  const codes = BANKS.map((b) => b.code);
  const [live, dividends] = await Promise.all([fetchLiveQuotes(symbols, "banks"), fetchDividends(codes, "banks")]);
  const rows = BANKS.map((bank) => {
    const quote = live.get(bank.code);
    const price = quote ? quote.price : bank.priceSeed;
    const div = dividends.get(bank.code);
    const dps = div ? div.dps : bank.dps;
    const dividendYield = price > 0 ? dps / price * 100 : 0;
    return {
      code: bank.code,
      name: bank.name,
      market: bank.market,
      category: bank.category,
      price,
      changePct: quote ? quote.changePct : 0,
      live: Boolean(quote),
      dps,
      dpsLive: Boolean(div),
      dpsYear: div ? div.fiscalYear : null,
      dividendYield,
      pb: bank.pb,
      dataDate: BANK_DATA_DATE
    };
  });
  return {
    rows,
    fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
    liveCount: rows.filter((r) => r.live).length,
    dpsLiveCount: rows.filter((r) => r.dpsLive).length
  };
});
export {
  listBanks_createServerFn_handler
};
