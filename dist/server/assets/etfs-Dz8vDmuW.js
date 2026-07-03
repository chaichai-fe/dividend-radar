import { c as createServerRpc } from "./createServerRpc-FXVUoZlp.js";
import { a5 as createServerFn } from "./worker-entry-sq6vnRaQ.js";
import { f as fetchLiveQuotes } from "./quotes-CdZQja0w.js";
import "node:events";
import "node:stream";
import "node:async_hooks";
import "node:stream/web";
const DATA_DATE = "2026-06-17";
const INDEXES = {
  SZH000015: {
    code: "000015",
    name: "上证红利",
    yieldNow: 5.07,
    yieldLow: 4,
    yieldHigh: 6,
    avgYield: 5,
    pe: 8.4,
    peLow: 6.2,
    peHigh: 11.5,
    pb: 0.82,
    pbLow: 0.62,
    pbHigh: 1.15,
    desc: "沪市单市场、单因子红利，偏传统高分红行业，防守性较强。"
  },
  ZZH000922: {
    code: "000922",
    name: "中证红利",
    yieldNow: 5.13,
    yieldLow: 4.2,
    yieldHigh: 6.2,
    avgYield: 5.4,
    pe: 8.25,
    peLow: 6,
    peHigh: 11,
    pb: 0.78,
    pbLow: 0.6,
    pbHigh: 1.08,
    desc: "全市场标准红利标杆，按股息率加权，成份股 100 只，分红稳定。"
  },
  H30269: {
    code: "H30269",
    name: "中证红利低波",
    yieldNow: 4.96,
    yieldLow: 3.8,
    yieldHigh: 5.6,
    avgYield: 4.9,
    pe: 7.58,
    peLow: 5.8,
    peHigh: 10.5,
    pb: 0.8,
    pbLow: 0.62,
    pbHigh: 1.1,
    desc: "红利叠加低波动因子，回撤更小，适合追求平滑体验的投资者。"
  },
  ZZH930955: {
    code: "930955",
    name: "红利低波100",
    yieldNow: 5.01,
    yieldLow: 3.8,
    yieldHigh: 5.6,
    avgYield: 4.9,
    pe: 8.49,
    peLow: 6.2,
    peHigh: 11.2,
    pb: 0.85,
    pbLow: 0.65,
    pbHigh: 1.15,
    desc: "100 只高股息低波动股票，兼顾分红与波动控制。"
  },
  ZZH930740: {
    code: "930740",
    name: "300红利低波",
    yieldNow: 4.7,
    yieldLow: 3.6,
    yieldHigh: 5.4,
    avgYield: 4.7,
    pe: 8.67,
    peLow: 6.3,
    peHigh: 11.5,
    pb: 0.88,
    pbLow: 0.66,
    pbHigh: 1.18,
    desc: "在沪深300范围内选高股息低波动股，龙头属性更强。"
  },
  ZZH000825: {
    code: "000825",
    name: "央企红利",
    yieldNow: 4.85,
    yieldLow: 3.8,
    yieldHigh: 5.6,
    avgYield: 4.7,
    pe: 8.86,
    peLow: 6,
    peHigh: 11.5,
    pb: 0.8,
    pbLow: 0.58,
    pbHigh: 1.12,
    desc: "央企属性 + 高分红，受益于国企改革与市值管理主题。"
  },
  ZZH932422: {
    code: "932422",
    name: "A500红利低波",
    yieldNow: 4.64,
    yieldLow: 3.6,
    yieldHigh: 5.4,
    avgYield: 4.6,
    pe: 9.35,
    peLow: 7,
    peHigh: 12.5,
    pb: 0.95,
    pbLow: 0.72,
    pbHigh: 1.3,
    desc: "中证A500范围内的红利低波策略，行业分布更均衡。"
  },
  ZZH932305: {
    code: "932305",
    name: "智选高股息",
    yieldNow: 5.45,
    yieldLow: 4.2,
    yieldHigh: 6.4,
    avgYield: 5.5,
    pe: 8.55,
    peLow: 6,
    peHigh: 11.5,
    pb: 0.82,
    pbLow: 0.6,
    pbHigh: 1.12,
    desc: "多因子筛选高股息，股息率在主流红利指数中偏高。"
  },
  ZZH000151: {
    code: "000151",
    name: "上证国企红利",
    yieldNow: 6.39,
    yieldLow: 4.8,
    yieldHigh: 7.2,
    avgYield: 6,
    pe: 7.2,
    peLow: 5.2,
    peHigh: 10,
    pb: 0.72,
    pbLow: 0.52,
    pbHigh: 1.02,
    desc: "沪市国有企业高分红，股息率在红利家族中领先。"
  },
  SZH399324: {
    code: "399324",
    name: "深证红利",
    yieldNow: 3,
    yieldLow: 1.8,
    yieldHigh: 3.8,
    avgYield: 2.8,
    pe: 12,
    peLow: 8,
    peHigh: 18,
    pb: 1.65,
    pbLow: 1.15,
    pbHigh: 2.4,
    desc: "深市红利，市值加权、偏成长与消费，股息率相对较低。"
  },
  ZZH000821: {
    code: "000821",
    name: "沪深300红利",
    yieldNow: 4.8,
    yieldLow: 3.8,
    yieldHigh: 5.6,
    avgYield: 4.7,
    pe: 8.8,
    peLow: 6.4,
    peHigh: 11.8,
    pb: 0.9,
    pbLow: 0.68,
    pbHigh: 1.22,
    desc: "沪深300成份中的高股息股票，蓝筹属性突出。"
  },
  ZZH932039: {
    code: "932039",
    name: "央企股东回报",
    yieldNow: 4.2,
    yieldLow: 3.4,
    yieldHigh: 5.2,
    avgYield: 4.2,
    pe: 9,
    peLow: 6.5,
    peHigh: 12,
    pb: 0.92,
    pbLow: 0.7,
    pbHigh: 1.25,
    desc: "强调分红 + 回购的央企股东回报主题。"
  },
  SPCLLHCP: {
    code: "SPCLLHCP",
    name: "标普A股红利低波50",
    yieldNow: 4.7,
    yieldLow: 3.7,
    yieldHigh: 5.5,
    avgYield: 4.7,
    pe: 8.6,
    peLow: 6.3,
    peHigh: 11.5,
    pb: 0.86,
    pbLow: 0.65,
    pbHigh: 1.16,
    desc: "标普大盘红利低波 50 只，大市值高分红低波动。"
  },
  ZZH000824: {
    code: "000824",
    name: "中证国企红利",
    yieldNow: 5,
    yieldLow: 4,
    yieldHigh: 6,
    avgYield: 5,
    pe: 8.3,
    peLow: 6,
    peHigh: 11,
    pb: 0.78,
    pbLow: 0.58,
    pbHigh: 1.08,
    desc: "全市场国有企业高分红组合。"
  }
};
const ETFS = [
  {
    code: "510880",
    name: "红利ETF",
    market: "SH",
    indexKey: "SZH000015",
    manager: "华泰柏瑞",
    scale: 178,
    fee: 0.6,
    navSeed: 2.972,
    dividendFreq: "年度"
  },
  {
    code: "515080",
    name: "中证红利ETF",
    market: "SH",
    indexKey: "ZZH000922",
    manager: "招商",
    scale: 92,
    fee: 0.3,
    navSeed: 1.436,
    dividendFreq: "季度"
  },
  {
    code: "515180",
    name: "红利ETF易方达",
    market: "SH",
    indexKey: "ZZH000922",
    manager: "易方达",
    scale: 60,
    fee: 0.2,
    navSeed: 1.28,
    dividendFreq: "年度"
  },
  {
    code: "515890",
    name: "红利ETF博时",
    market: "SH",
    indexKey: "ZZH000922",
    manager: "博时",
    scale: 12.7,
    fee: 0.2,
    navSeed: 1.15,
    dividendFreq: "季度"
  },
  {
    code: "159581",
    name: "红利ETF基金",
    market: "SZ",
    indexKey: "ZZH000922",
    manager: "万家",
    scale: 0.9,
    fee: 0.6,
    navSeed: 1.1,
    dividendFreq: "月度"
  },
  {
    code: "512890",
    name: "红利低波ETF",
    market: "SH",
    indexKey: "H30269",
    manager: "华泰柏瑞",
    scale: 83,
    fee: 0.6,
    navSeed: 1.089,
    dividendFreq: "季度"
  },
  {
    code: "563020",
    name: "红利低波动ETF",
    market: "SH",
    indexKey: "H30269",
    manager: "易方达",
    scale: 5.1,
    fee: 0.2,
    navSeed: 1.1,
    dividendFreq: "季度"
  },
  {
    code: "159525",
    name: "红利低波ETF富国",
    market: "SZ",
    indexKey: "H30269",
    manager: "富国",
    scale: 4.6,
    fee: 0.2,
    navSeed: 1.05,
    dividendFreq: "季度"
  },
  {
    code: "515100",
    name: "红利低波100ETF",
    market: "SH",
    indexKey: "ZZH930955",
    manager: "景顺长城",
    scale: 61,
    fee: 0.2,
    navSeed: 1.1,
    dividendFreq: "季度"
  },
  {
    code: "515300",
    name: "红利低波ETF基金",
    market: "SH",
    indexKey: "ZZH930740",
    manager: "嘉实",
    scale: 40,
    fee: 0.2,
    navSeed: 1.2,
    dividendFreq: "季度"
  },
  {
    code: "512530",
    name: "沪深300红利ETF",
    market: "SH",
    indexKey: "ZZH000821",
    manager: "建信",
    scale: 2.1,
    fee: 0.5,
    navSeed: 1.2,
    dividendFreq: "年度"
  },
  {
    code: "561580",
    name: "央企红利ETF",
    market: "SH",
    indexKey: "ZZH000825",
    manager: "华泰柏瑞",
    scale: 4.3,
    fee: 0.5,
    navSeed: 1.1,
    dividendFreq: "季度"
  },
  {
    code: "561060",
    name: "国企红利ETF",
    market: "SH",
    indexKey: "ZZH000824",
    manager: "华安",
    scale: 1,
    fee: 0.5,
    navSeed: 1.05,
    dividendFreq: "季度"
  },
  {
    code: "560700",
    name: "央企回报ETF",
    market: "SH",
    indexKey: "ZZH932039",
    manager: "国新",
    scale: 8,
    fee: 0.5,
    navSeed: 1.1,
    dividendFreq: "半年度"
  },
  {
    code: "510720",
    name: "红利国企ETF",
    market: "SH",
    indexKey: "ZZH000151",
    manager: "国泰",
    scale: 4.5,
    fee: 0.6,
    navSeed: 1.3,
    dividendFreq: "月度"
  },
  {
    code: "515450",
    name: "红利低波50ETF",
    market: "SH",
    indexKey: "SPCLLHCP",
    manager: "南方",
    scale: 23.5,
    fee: 0.6,
    navSeed: 1.1,
    dividendFreq: "季度"
  },
  {
    code: "159905",
    name: "深红利ETF",
    market: "SZ",
    indexKey: "SZH399324",
    manager: "工银瑞信",
    scale: 6,
    fee: 0.6,
    navSeed: 1.5,
    dividendFreq: "年度"
  },
  {
    code: "563180",
    name: "高股息ETF",
    market: "SH",
    indexKey: "ZZH932305",
    manager: "银华",
    scale: 1.3,
    fee: 0.5,
    navSeed: 1,
    dividendFreq: "季度"
  }
];
const listEtfs_createServerFn_handler = createServerRpc({
  id: "516fc0ed0122f17fde01f478272f253a8c2e071e048f3fda6c42f73ba37ef26e",
  name: "listEtfs",
  filename: "src/server/etfs.ts"
}, (opts) => listEtfs.__executeServer(opts));
const listEtfs = createServerFn({
  method: "GET"
}).handler(listEtfs_createServerFn_handler, async () => {
  const symbols = ETFS.map((e) => (e.market === "SH" ? "sh" : "sz") + e.code).join(",");
  const live = await fetchLiveQuotes(symbols, "etfs");
  const rows = ETFS.map((etf) => {
    const idx = INDEXES[etf.indexKey];
    const quote = live.get(etf.code);
    const price = quote ? quote.price : etf.navSeed;
    const impliedAnnualDist = idx.yieldNow / 100 * etf.navSeed;
    const dividendYield = price > 0 ? impliedAnnualDist / price * 100 : idx.yieldNow;
    return {
      code: etf.code,
      name: etf.name,
      market: etf.market,
      indexCode: idx.code,
      indexName: idx.name,
      indexDesc: idx.desc,
      manager: etf.manager,
      scale: etf.scale,
      fee: etf.fee,
      dividendFreq: etf.dividendFreq,
      nav: price,
      changePct: quote ? quote.changePct : 0,
      live: Boolean(quote),
      dividendYield,
      avgYield: idx.avgYield,
      pe: idx.pe,
      peLow: idx.peLow,
      peHigh: idx.peHigh,
      pb: idx.pb,
      pbLow: idx.pbLow,
      pbHigh: idx.pbHigh,
      yieldLow: idx.yieldLow,
      yieldHigh: idx.yieldHigh,
      dataDate: DATA_DATE
    };
  });
  return {
    rows,
    fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
    liveCount: rows.filter((r) => r.live).length
  };
});
export {
  listEtfs_createServerFn_handler
};
