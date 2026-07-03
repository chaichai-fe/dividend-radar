import { r as reactExports, W as jsxRuntimeExports } from "./worker-entry-sq6vnRaQ.js";
import { u as useQuery, e as equityBondSpread } from "./rating-C6hI9CkT.js";
import { B as Button, d as cn, t as toast, i as listBanks } from "./router-aMmKAEBC.js";
import { r as rateBankYield } from "./bank-data-DO0SpFZT.js";
import { R as RefreshCw, S as Search, I as Input } from "./input-DZVCOcAI.js";
import { S as Skeleton } from "./skeleton-DZY2f4UP.js";
import { A as ArrowUpDown } from "./arrow-up-down-Bon5fZ3p.js";
import "node:events";
import "node:stream";
import "node:async_hooks";
import "node:stream/web";
const filters = [{
  key: "all",
  label: "全部"
}, {
  key: "high",
  label: "高股息(≥5%)"
}, {
  key: "国有大行",
  label: "国有大行"
}, {
  key: "股份行",
  label: "股份行"
}, {
  key: "城商行",
  label: "城商行"
}, {
  key: "农商行",
  label: "农商行"
}];
const toneClass = {
  "buy-strong": "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  buy: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
  hold: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
  watch: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  avoid: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
};
function BanksPage() {
  const query = useQuery({
    queryKey: ["banks"],
    queryFn: () => listBanks()
  });
  const [keyword, setKeyword] = reactExports.useState("");
  const [filter, setFilter] = reactExports.useState("all");
  const [sort, setSort] = reactExports.useState("yield");
  const rows = query.data?.rows ?? [];
  const enriched = reactExports.useMemo(() => {
    return rows.map((bank) => ({
      bank,
      rating: rateBankYield(bank.dividendYield),
      spread: equityBondSpread(bank.dividendYield)
    }));
  }, [rows]);
  const visible = reactExports.useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    let list = enriched.filter(({
      bank,
      rating
    }) => {
      if (kw) {
        const hay = `${bank.name}${bank.code}${bank.category}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      if (filter === "all") return true;
      if (filter === "high") return rating.isHigh;
      return bank.category === filter;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "pb":
          return a.bank.pb - b.bank.pb;
        case "change":
          return b.bank.changePct - a.bank.changePct;
        case "dps":
          return b.bank.dps - a.bank.dps;
        default:
          return b.bank.dividendYield - a.bank.dividendYield;
      }
    });
    return list;
  }, [enriched, keyword, filter, sort]);
  const highCount = enriched.filter((e) => e.rating.isHigh).length;
  const avgYield = enriched.length > 0 ? enriched.reduce((s, e) => s + e.bank.dividendYield, 0) / enriched.length : 0;
  const topYield = enriched.length > 0 ? Math.max(...enriched.map((e) => e.bank.dividendYield)) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rise-in space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "island-kicker", children: "Bank Dividend" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "display-title mt-1 text-3xl font-bold text-foreground", children: "高股息银行统计" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 max-w-2xl text-sm text-muted-foreground", children: [
          "汇总 A 股 ",
          rows.length,
          " 家上市银行，按“每股分红 ÷ 实时股价”动态测算股息率， 并对照十年国债做股债利差，筛选出真正的高股息标的。"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right text-xs text-muted-foreground", children: query.data ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            "实时股价 ",
            query.data.liveCount,
            "/",
            rows.length
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            "分红数据 ",
            rows[0]?.dataDate ?? "—"
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "加载中…" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
          query.refetch();
          toast.info("正在刷新实时股价…");
        }, disabled: query.isFetching, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: cn("size-4", query.isFetching && "animate-spin") }),
          "刷新"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "收录银行", value: `${rows.length}`, unit: "家" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "高股息(≥5%)", value: `${highCount}`, unit: "家", accent: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "平均股息率", value: avgYield.toFixed(2), unit: "%" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "最高股息率", value: topYield.toFixed(2), unit: "%" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-w-[220px] flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: keyword, onChange: (e) => setKeyword(e.target.value), placeholder: "搜索名称 / 代码 / 类型", className: "pl-9" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: filters.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFilter(f.key), className: cn("rounded-full border px-3 py-1.5 text-xs font-medium transition", filter === f.key ? "border-transparent bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"), children: f.label }, f.key)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "island-shell overflow-hidden rounded-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border text-left text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-medium", children: "银行 / 类型" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTh, { label: "现价", active: sort === "change", onClick: () => setSort("change") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTh, { label: "每股分红", active: sort === "dps", onClick: () => setSort("dps") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTh, { label: "股息率", active: sort === "yield", onClick: () => setSort("yield") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-medium", children: "股债利差" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTh, { label: "PB", active: sort === "pb", onClick: () => setSort("pb") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-medium", children: "评级" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        query.isLoading && Array.from({
          length: 10
        }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", colSpan: 7, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-full" }) }) }, i)),
        visible.map(({
          bank,
          rating,
          spread
        }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/60 transition hover:bg-accent/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-foreground", children: bank.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              bank.code,
              " · ",
              bank.category
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium tabular-nums text-foreground", children: bank.price.toFixed(2) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("text-xs tabular-nums", bank.changePct > 0 ? "text-rose-500" : bank.changePct < 0 ? "text-emerald-500" : "text-muted-foreground"), children: [
              bank.changePct > 0 ? "+" : "",
              bank.changePct.toFixed(2),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 tabular-nums text-muted-foreground", title: bank.dpsYear ? `${bank.dpsYear} 年度方案(前瞻口径，含已公告预案)` : "参考值(实时接口未命中)", children: [
            bank.dps.toFixed(4),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-[10px] text-muted-foreground/70", children: bank.dpsYear ? `${bank.dpsYear}` : "参考" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-base font-semibold tabular-nums text-foreground", title: `股息率 = 每股分红 ${bank.dps.toFixed(3)} ÷ 现价 ${bank.price.toFixed(2)}${bank.dpsYear ? `（按 ${bank.dpsYear} 年度分红方案，含预案）` : ""}`, children: [
            bank.dividendYield.toFixed(2),
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 tabular-nums text-muted-foreground", children: [
            spread > 0 ? "+" : "",
            spread,
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 tabular-nums text-muted-foreground", children: bank.pb.toFixed(2) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", toneClass[rating.tone]), children: rating.label }) })
        ] }, bank.code)),
        !query.isLoading && visible.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-10 text-center text-muted-foreground", colSpan: 7, children: "没有匹配的银行" }) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "股息率按“每股分红 ÷ 实时股价”动态计算，股价越低股息率越高。每股分红采用",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: "前瞻口径" }),
      "：取最新已公告年度分红合计（含预案/董事会或股东大会通过），第一时间反映分红上调或下调， 故可能高于部分平台采用的“近 12 个月已实施”口径。分红数据来自东方财富，PB 为参考值。本工具仅供学习研究，不构成投资建议。"
    ] })
  ] });
}
function StatCard({
  label,
  value,
  unit,
  accent
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feature-card rounded-2xl border border-border p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-3xl font-bold tabular-nums text-foreground", children: [
      value,
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("ml-1 text-base font-medium", accent ? "text-emerald-500" : "text-muted-foreground"), children: unit })
    ] })
  ] });
}
function SortableTh({
  label,
  active,
  onClick
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick, className: cn("inline-flex items-center gap-1 transition hover:text-foreground", active && "text-foreground"), children: [
    label,
    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpDown, { className: "size-3" })
  ] }) });
}
export {
  BanksPage as component
};
