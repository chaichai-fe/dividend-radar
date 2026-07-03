import { r as reactExports, W as jsxRuntimeExports } from "./worker-entry-sq6vnRaQ.js";
import { c as createLucideIcon, L as Link, W as Wallet, G as Gauge, q as Landmark, d as cn, l as listEtfs, i as listBanks, j as listHoldings } from "./router-aMmKAEBC.js";
import { u as useQuery, v as valuateMulti, B as BOND_YIELD_10Y } from "./rating-C6hI9CkT.js";
import { r as rateBankYield } from "./bank-data-DO0SpFZT.js";
import { R as RatingBadge } from "./rating-badge-DhvFeGvQ.js";
import { S as Skeleton } from "./skeleton-DZY2f4UP.js";
import "node:events";
import "node:stream";
import "node:async_hooks";
import "node:stream/web";
const __iconNode = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
];
const ArrowRight = createLucideIcon("arrow-right", __iconNode);
const bankToneClass = {
  "buy-strong": "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  buy: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
  hold: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
  watch: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  avoid: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
};
function DashboardPage() {
  const query = useQuery({
    queryKey: ["etfs"],
    queryFn: () => listEtfs()
  });
  const rows = query.data?.rows ?? [];
  const banksQuery = useQuery({
    queryKey: ["banks"],
    queryFn: () => listBanks()
  });
  const bankRows = banksQuery.data?.rows ?? [];
  const picks = reactExports.useMemo(() => {
    return rows.map((etf) => ({
      etf,
      valuation: valuateMulti(etf)
    })).filter((r) => r.valuation.worthBuying).sort((a, b) => b.valuation.percentile - a.valuation.percentile).slice(0, 4);
  }, [rows]);
  const topBanks = reactExports.useMemo(() => {
    return [...bankRows].sort((a, b) => b.dividendYield - a.dividendYield).slice(0, 6);
  }, [bankRows]);
  const bankHighCount = bankRows.filter((b) => rateBankYield(b.dividendYield).isHigh).length;
  const holdingsQuery = useQuery({
    queryKey: ["holdings"],
    queryFn: () => listHoldings()
  });
  const holdings = holdingsQuery.data ?? [];
  const portfolio = reactExports.useMemo(() => {
    const etfMap = new Map(rows.map((e) => [e.code, e]));
    let totalValue = 0;
    let totalIncome = 0;
    for (const h of holdings) {
      const etf = etfMap.get(h.code);
      if (!etf) continue;
      const marketValue = h.amount * etf.nav;
      totalValue += marketValue;
      totalIncome += marketValue * (etf.dividendYield / 100);
    }
    const yieldPct = totalValue > 0 ? totalIncome / totalValue * 100 : 0;
    return {
      totalValue,
      totalIncome,
      yieldPct,
      count: holdings.length
    };
  }, [holdings, rows]);
  const portfolioReady = holdingsQuery.isSuccess && query.isSuccess && portfolio.totalValue > 0;
  const avgYield = rows.length > 0 ? rows.reduce((s, e) => s + e.dividendYield, 0) / rows.length : 0;
  const bankAvgYield = bankRows.length > 0 ? bankRows.reduce((s, b) => s + b.dividendYield, 0) / bankRows.length : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rise-in space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "island-kicker", children: "Dividend Radar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "display-title mt-1 text-3xl font-bold text-foreground sm:text-4xl", children: "A 股红利 ETF 投资雷达" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-2xl text-muted-foreground", children: "一站式汇总 A 股红利类 ETF 与高股息银行的净值、股息率，基于股息率历史分位做低估 / 高估评级与加仓建议，并帮你管理组合、测算年被动收入。" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/portfolio", className: "group relative block overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/12 via-emerald-500/5 to-transparent p-6 shadow-[0_2px_20px_rgba(16,185,129,0.12)] ring-1 ring-emerald-500/15 transition hover:ring-emerald-500/30 sm:p-7", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-emerald-500/10 blur-2xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "size-5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "island-kicker text-emerald-600 dark:text-emerald-400", children: "My Portfolio" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-foreground", children: "我的组合 · 年被动收入" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: portfolioReady ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            "组合股息率",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-foreground", children: [
              portfolio.yieldPct.toFixed(2),
              "%"
            ] }),
            " ",
            "· 市值 ¥",
            Math.round(portfolio.totalValue).toLocaleString(),
            " ·",
            " ",
            portfolio.count,
            " 只持仓"
          ] }) : "搜索添加 ETF，测算组合股息率与年被动收入" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400", children: [
            "管理组合",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4 transition group-hover:translate-x-1" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 sm:text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-muted-foreground", children: "预计年被动收入" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-4xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400 sm:text-5xl", children: portfolioReady ? `¥${Math.round(portfolio.totalIncome).toLocaleString()}` : holdingsQuery.isLoading ? "—" : "待添加" }),
          portfolioReady && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs text-muted-foreground", children: [
            "月均 ≈ ¥",
            Math.round(portfolio.totalIncome / 12).toLocaleString()
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/etfs", className: "feature-card group rounded-2xl border border-border p-6 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Gauge, { className: "size-6 text-[var(--lagoon-deep)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl font-bold tabular-nums text-foreground", children: query.isLoading ? "—" : rows.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-lg font-semibold text-foreground", children: "红利 ETF 估值榜" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "净值、股息率、低估/高估评级与加仓建议" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--lagoon-deep)]", children: [
          "查看估值",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4 transition group-hover:translate-x-1" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/banks", className: "feature-card group rounded-2xl border border-border p-6 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Landmark, { className: "size-6 text-[var(--lagoon-deep)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl font-bold tabular-nums text-emerald-500", children: banksQuery.isLoading ? "—" : bankHighCount })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-lg font-semibold text-foreground", children: "高股息银行" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: banksQuery.isLoading ? "按实时股价测算银行股息率" : `${bankRows.length} 家银行，${bankHighCount} 家股息率 ≥ 5%` }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--lagoon-deep)]", children: [
          "查看银行",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4 transition group-hover:translate-x-1" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feature-card rounded-2xl border border-border p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Gauge, { className: "size-6 text-[var(--lagoon-deep)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl font-bold tabular-nums text-foreground", children: query.isLoading ? "—" : `${avgYield.toFixed(2)}%` })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-lg font-semibold text-foreground", children: "红利 ETF 平均股息率" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
          "对比十年国债 ",
          BOND_YIELD_10Y,
          "%，股债利差约 +",
          (avgYield - BOND_YIELD_10Y).toFixed(2),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feature-card rounded-2xl border border-border p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Landmark, { className: "size-6 text-[var(--lagoon-deep)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl font-bold tabular-nums text-foreground", children: banksQuery.isLoading ? "—" : `${bankAvgYield.toFixed(2)}%` })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-lg font-semibold text-foreground", children: "银行平均股息率" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
          "对比十年国债 ",
          BOND_YIELD_10Y,
          "%，股债利差约 +",
          (bankAvgYield - BOND_YIELD_10Y).toFixed(2),
          "%"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "display-title text-xl font-bold text-foreground", children: "当前值得关注 · 低估加仓榜" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/etfs", className: "text-sm font-medium text-[var(--lagoon-deep)]", children: "查看全部 →" })
      ] }),
      query.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: Array.from({
        length: 4
      }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-28 rounded-2xl" }, i)) }) : picks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "island-shell rounded-2xl p-6 text-sm text-muted-foreground", children: "当前主流红利指数估值中性偏高，暂无“值得加仓”标的，建议保持定投、耐心等待更好买点。" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: picks.map(({
        etf,
        valuation
      }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/etfs", className: "feature-card group rounded-2xl border border-border p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-base font-semibold text-foreground", children: [
              etf.name,
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs font-normal text-muted-foreground", children: etf.code })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 text-xs text-muted-foreground", children: [
              etf.indexName,
              " · ",
              etf.manager
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RatingBadge, { valuation })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-end justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "股息率" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold tabular-nums text-foreground", children: [
              etf.dividendYield.toFixed(2),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-[60%] text-right text-xs text-muted-foreground", children: valuation.advice })
        ] })
      ] }, etf.code)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "display-title text-xl font-bold text-foreground", children: "高股息银行 · 股息率榜" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/banks", className: "text-sm font-medium text-[var(--lagoon-deep)]", children: "查看全部 →" })
      ] }),
      banksQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: Array.from({
        length: 6
      }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 rounded-2xl" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: topBanks.map((bank) => {
        const rating = rateBankYield(bank.dividendYield);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/banks", className: "feature-card group rounded-2xl border border-border p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-base font-semibold text-foreground", children: [
                bank.name,
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs font-normal text-muted-foreground", children: bank.code })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 text-xs text-muted-foreground", children: [
                bank.category,
                " · PB ",
                bank.pb.toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", bankToneClass[rating.tone]), children: rating.label })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-end justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "股息率" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold tabular-nums text-foreground", children: [
                bank.dividendYield.toFixed(2),
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                "现价 ",
                bank.price.toFixed(2)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { title: bank.dpsYear ? `每股分红取 ${bank.dpsYear} 年度方案(含预案)，共 ${bank.dps.toFixed(3)} 元` : "每股分红为参考值", children: [
                "每股分红 ",
                bank.dps.toFixed(2),
                bank.dpsYear ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-[10px] text-muted-foreground/70", children: [
                  String(bank.dpsYear).slice(2),
                  "年"
                ] }) : null
              ] })
            ] })
          ] })
        ] }, bank.code);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "评级方法：ETF 以“股息率 + PB + PE 三因子在各自多年区间中的分位”加权衡量低估程度（权重 50/30/20）；银行按“每股分红 ÷ 实时股价”动态测算股息率。越便宜越低估、越值得关注。 本工具仅供学习研究，不构成投资建议。" })
  ] });
}
export {
  DashboardPage as component
};
