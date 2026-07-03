import { r as reactExports, W as jsxRuntimeExports } from "./worker-entry-sq6vnRaQ.js";
import { u as useQuery, v as valuateMulti } from "./rating-C6hI9CkT.js";
import { c as createLucideIcon, S as Subscribable, s as shallowEqualObjects, h as hashKey, g as getDefaultState, n as notifyManager, u as useQueryClient, a as noop, b as shouldThrowError, B as Button, d as cn, W as Wallet, t as toast, e as addHolding, r as removeHolding, f as setHoldingAmount, l as listEtfs, i as listBanks, j as listHoldings } from "./router-aMmKAEBC.js";
import { R as RatingBadge } from "./rating-badge-DhvFeGvQ.js";
import { R as RefreshCw, S as Search, I as Input } from "./input-DZVCOcAI.js";
import "node:events";
import "node:stream";
import "node:async_hooks";
import "node:stream/web";
const __iconNode$4 = [
  ["path", { d: "M16 14v2.2l1.6 1", key: "fo4ql5" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["path", { d: "M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5", key: "1osxxc" }],
  ["path", { d: "M3 10h5", key: "r794hk" }],
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["circle", { cx: "16", cy: "16", r: "6", key: "qoo3c4" }]
];
const CalendarClock = createLucideIcon("calendar-clock", __iconNode$4);
const __iconNode$3 = [
  [
    "path",
    {
      d: "M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z",
      key: "1piglc"
    }
  ],
  ["path", { d: "M16 10h.01", key: "1m94wz" }],
  ["path", { d: "M2 8v1a2 2 0 0 0 2 2h1", key: "1env43" }]
];
const PiggyBank = createLucideIcon("piggy-bank", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
];
const Plus = createLucideIcon("plus", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M10 11v6", key: "nco0om" }],
  ["path", { d: "M14 11v6", key: "outv1u" }],
  ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }]
];
const Trash2 = createLucideIcon("trash-2", __iconNode$1);
const __iconNode = [
  ["path", { d: "M16 7h6v6", key: "box55l" }],
  ["path", { d: "m22 7-8.5 8.5-5-5L2 17", key: "1t1m79" }]
];
const TrendingUp = createLucideIcon("trending-up", __iconNode);
var MutationObserver = class extends Subscribable {
  #client;
  #currentResult = void 0;
  #currentMutation;
  #mutateOptions;
  constructor(client, options) {
    super();
    this.#client = client;
    this.setOptions(options);
    this.bindMethods();
    this.#updateResult();
  }
  bindMethods() {
    this.mutate = this.mutate.bind(this);
    this.reset = this.reset.bind(this);
  }
  setOptions(options) {
    const prevOptions = this.options;
    this.options = this.#client.defaultMutationOptions(options);
    if (!shallowEqualObjects(this.options, prevOptions)) {
      this.#client.getMutationCache().notify({
        type: "observerOptionsUpdated",
        mutation: this.#currentMutation,
        observer: this
      });
    }
    if (prevOptions?.mutationKey && this.options.mutationKey && hashKey(prevOptions.mutationKey) !== hashKey(this.options.mutationKey)) {
      this.reset();
    } else if (this.#currentMutation?.state.status === "pending") {
      this.#currentMutation.setOptions(this.options);
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      this.#currentMutation?.removeObserver(this);
    }
  }
  onMutationUpdate(action) {
    this.#updateResult();
    this.#notify(action);
  }
  getCurrentResult() {
    return this.#currentResult;
  }
  reset() {
    this.#currentMutation?.removeObserver(this);
    this.#currentMutation = void 0;
    this.#updateResult();
    this.#notify();
  }
  mutate(variables, options) {
    this.#mutateOptions = options;
    this.#currentMutation?.removeObserver(this);
    this.#currentMutation = this.#client.getMutationCache().build(this.#client, this.options);
    this.#currentMutation.addObserver(this);
    return this.#currentMutation.execute(variables);
  }
  #updateResult() {
    const state = this.#currentMutation?.state ?? getDefaultState();
    this.#currentResult = {
      ...state,
      isPending: state.status === "pending",
      isSuccess: state.status === "success",
      isError: state.status === "error",
      isIdle: state.status === "idle",
      mutate: this.mutate,
      reset: this.reset
    };
  }
  #notify(action) {
    notifyManager.batch(() => {
      if (this.#mutateOptions && this.hasListeners()) {
        const variables = this.#currentResult.variables;
        const onMutateResult = this.#currentResult.context;
        const context = {
          client: this.#client,
          meta: this.options.meta,
          mutationKey: this.options.mutationKey
        };
        if (action?.type === "success") {
          try {
            this.#mutateOptions.onSuccess?.(
              action.data,
              variables,
              onMutateResult,
              context
            );
          } catch (e) {
            void Promise.reject(e);
          }
          try {
            this.#mutateOptions.onSettled?.(
              action.data,
              null,
              variables,
              onMutateResult,
              context
            );
          } catch (e) {
            void Promise.reject(e);
          }
        } else if (action?.type === "error") {
          try {
            this.#mutateOptions.onError?.(
              action.error,
              variables,
              onMutateResult,
              context
            );
          } catch (e) {
            void Promise.reject(e);
          }
          try {
            this.#mutateOptions.onSettled?.(
              void 0,
              action.error,
              variables,
              onMutateResult,
              context
            );
          } catch (e) {
            void Promise.reject(e);
          }
        }
      }
      this.listeners.forEach((listener) => {
        listener(this.#currentResult);
      });
    });
  }
};
function useMutation(options, queryClient) {
  const client = useQueryClient();
  const [observer] = reactExports.useState(
    () => new MutationObserver(
      client,
      options
    )
  );
  reactExports.useEffect(() => {
    observer.setOptions(options);
  }, [observer, options]);
  const result = reactExports.useSyncExternalStore(
    reactExports.useCallback(
      (onStoreChange) => observer.subscribe(notifyManager.batchCalls(onStoreChange)),
      [observer]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  const mutate = reactExports.useCallback(
    (variables, mutateOptions) => {
      observer.mutate(variables, mutateOptions).catch(noop);
    },
    [observer]
  );
  if (result.error && shouldThrowError(observer.options.throwOnError, [result.error])) {
    throw result.error;
  }
  return { ...result, mutate, mutateAsync: result.mutate };
}
const DIVIDEND_DATA_DATE = "2026-06-30";
const DIVIDENDS = [
  // 510880 红利ETF（年度）
  { code: "510880", recordDate: "2025-01-16", exDate: "2025-01-17", payDate: "2025-01-23", perShare: 0.085 },
  { code: "510880", recordDate: "2026-01-15", exDate: "2026-01-16", payDate: "2026-01-22", perShare: 0.09 },
  // 515080 中证红利ETF招商（季度）
  { code: "515080", recordDate: "2025-12-22", exDate: "2025-12-23", payDate: "2025-12-29", perShare: 0.022 },
  { code: "515080", recordDate: "2026-03-23", exDate: "2026-03-24", payDate: "2026-03-30", perShare: 0.021 },
  { code: "515080", recordDate: "2026-06-23", exDate: "2026-06-24", payDate: "2026-06-30", perShare: 0.02 },
  { code: "515080", recordDate: "2026-09-22", exDate: "2026-09-23", payDate: "2026-09-29", perShare: 0.02, estimated: true },
  // 515180 红利ETF易方达（年度）
  { code: "515180", recordDate: "2025-12-18", exDate: "2025-12-19", payDate: "2025-12-25", perShare: 0.05 },
  // 515890 红利ETF博时（季度）
  { code: "515890", recordDate: "2026-03-18", exDate: "2026-03-19", payDate: "2026-03-25", perShare: 0.016 },
  { code: "515890", recordDate: "2026-06-18", exDate: "2026-06-19", payDate: "2026-06-25", perShare: 0.015 },
  { code: "515890", recordDate: "2026-09-18", exDate: "2026-09-21", payDate: "2026-09-25", perShare: 0.015, estimated: true },
  // 159581 红利ETF基金万家（月度）
  { code: "159581", recordDate: "2026-05-26", exDate: "2026-05-27", payDate: "2026-06-02", perShare: 6e-3 },
  { code: "159581", recordDate: "2026-06-25", exDate: "2026-06-26", payDate: "2026-07-02", perShare: 6e-3 },
  { code: "159581", recordDate: "2026-07-27", exDate: "2026-07-28", payDate: "2026-08-03", perShare: 6e-3, estimated: true },
  // 512890 红利低波ETF华泰柏瑞（季度）
  { code: "512890", recordDate: "2026-03-16", exDate: "2026-03-17", payDate: "2026-03-23", perShare: 0.014 },
  { code: "512890", recordDate: "2026-06-16", exDate: "2026-06-17", payDate: "2026-06-23", perShare: 0.014 },
  { code: "512890", recordDate: "2026-09-16", exDate: "2026-09-17", payDate: "2026-09-23", perShare: 0.014, estimated: true },
  // 563020 红利低波动ETF易方达（季度）
  { code: "563020", recordDate: "2026-06-12", exDate: "2026-06-15", payDate: "2026-06-19", perShare: 0.013 },
  { code: "563020", recordDate: "2026-09-14", exDate: "2026-09-15", payDate: "2026-09-21", perShare: 0.013, estimated: true },
  // 159525 红利低波ETF富国（季度）
  { code: "159525", recordDate: "2026-06-19", exDate: "2026-06-22", payDate: "2026-06-28", perShare: 0.012 },
  { code: "159525", recordDate: "2026-09-21", exDate: "2026-09-22", payDate: "2026-09-28", perShare: 0.012, estimated: true },
  // 515100 红利低波100ETF景顺长城（季度）
  { code: "515100", recordDate: "2026-03-20", exDate: "2026-03-23", payDate: "2026-03-27", perShare: 0.013 },
  { code: "515100", recordDate: "2026-06-22", exDate: "2026-06-23", payDate: "2026-06-29", perShare: 0.013 },
  { code: "515100", recordDate: "2026-09-21", exDate: "2026-09-22", payDate: "2026-09-28", perShare: 0.013, estimated: true },
  // 515300 红利低波ETF嘉实（季度）
  { code: "515300", recordDate: "2026-06-16", exDate: "2026-06-17", payDate: "2026-06-23", perShare: 0.015 },
  { code: "515300", recordDate: "2026-09-16", exDate: "2026-09-17", payDate: "2026-09-23", perShare: 0.015, estimated: true },
  // 512530 沪深300红利ETF建信（年度）
  { code: "512530", recordDate: "2026-01-20", exDate: "2026-01-21", payDate: "2026-01-27", perShare: 0.048 },
  // 561580 央企红利ETF华泰柏瑞（季度）
  { code: "561580", recordDate: "2026-06-10", exDate: "2026-06-11", payDate: "2026-06-17", perShare: 0.013 },
  { code: "561580", recordDate: "2026-09-10", exDate: "2026-09-11", payDate: "2026-09-17", perShare: 0.013, estimated: true },
  // 561060 国企红利ETF华安（季度）
  { code: "561060", recordDate: "2026-06-11", exDate: "2026-06-12", payDate: "2026-06-18", perShare: 0.012 },
  { code: "561060", recordDate: "2026-09-11", exDate: "2026-09-14", payDate: "2026-09-18", perShare: 0.012, estimated: true },
  // 560700 央企回报ETF国新（半年度）
  { code: "560700", recordDate: "2025-12-15", exDate: "2025-12-16", payDate: "2025-12-22", perShare: 0.03 },
  { code: "560700", recordDate: "2026-06-15", exDate: "2026-06-16", payDate: "2026-06-22", perShare: 0.028 },
  // 510720 红利国企ETF国泰（月度）
  { code: "510720", recordDate: "2026-05-15", exDate: "2026-05-18", payDate: "2026-05-22", perShare: 8e-3 },
  { code: "510720", recordDate: "2026-06-15", exDate: "2026-06-16", payDate: "2026-06-22", perShare: 8e-3 },
  { code: "510720", recordDate: "2026-07-15", exDate: "2026-07-16", payDate: "2026-07-22", perShare: 8e-3, estimated: true },
  // 515450 红利低波50ETF南方（季度）
  { code: "515450", recordDate: "2026-06-18", exDate: "2026-06-19", payDate: "2026-06-25", perShare: 0.013 },
  { code: "515450", recordDate: "2026-09-17", exDate: "2026-09-18", payDate: "2026-09-24", perShare: 0.013, estimated: true },
  // 159905 深红利ETF工银瑞信（年度）
  { code: "159905", recordDate: "2025-12-10", exDate: "2025-12-11", payDate: "2025-12-17", perShare: 0.04 },
  // 563180 高股息ETF银华（季度）
  { code: "563180", recordDate: "2026-06-24", exDate: "2026-06-25", payDate: "2026-07-01", perShare: 0.014 },
  { code: "563180", recordDate: "2026-09-23", exDate: "2026-09-24", payDate: "2026-09-30", perShare: 0.014, estimated: true }
];
const W = 820;
const H = 260;
const PAD = { l: 64, r: 20, t: 20, b: 36 };
const innerW = W - PAD.l - PAD.r;
const innerH = H - PAD.t - PAD.b;
function TrendChart({
  data,
  color = "var(--lagoon-deep)",
  format = (v) => v.toLocaleString()
}) {
  const [hover, setHover] = reactExports.useState(null);
  const values = data.map((d) => d.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const span = rawMax - rawMin;
  const min = span === 0 ? rawMin - Math.abs(rawMin || 1) * 0.1 : rawMin - span * 0.12;
  const max = span === 0 ? rawMax + Math.abs(rawMax || 1) * 0.1 : rawMax + span * 0.12;
  const range = max - min || 1;
  const x = (i) => data.length === 1 ? PAD.l + innerW / 2 : PAD.l + i / (data.length - 1) * innerW;
  const y = (v) => PAD.t + (1 - (v - min) / range) * innerH;
  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d.value).toFixed(1)}`).join(" ");
  const areaPath = data.length > 1 ? `${linePath} L ${x(data.length - 1).toFixed(1)} ${PAD.t + innerH} L ${x(0).toFixed(1)} ${PAD.t + innerH} Z` : "";
  const gridLines = 4;
  const yTicks = Array.from({ length: gridLines + 1 }, (_, i) => {
    const v = min + range * i / gridLines;
    return { v, y: y(v) };
  });
  const step = Math.max(1, Math.ceil(data.length / 6));
  const xLabels = data.map((d, i) => ({ d, i })).filter(({ i }) => i % step === 0 || i === data.length - 1);
  function onMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const svgX = ratio * W;
    if (data.length === 1) {
      setHover(0);
      return;
    }
    const idx = Math.round((svgX - PAD.l) / innerW * (data.length - 1));
    setHover(Math.min(data.length - 1, Math.max(0, idx)));
  }
  const gradientId = "trend-grad";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "svg",
      {
        viewBox: `0 0 ${W} ${H}`,
        className: "w-full",
        style: { height: "auto" },
        onMouseMove: onMove,
        onMouseLeave: () => setHover(null),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: gradientId, x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: color, stopOpacity: "0.22" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: color, stopOpacity: "0" })
          ] }) }),
          yTicks.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "line",
              {
                x1: PAD.l,
                y1: t.y,
                x2: W - PAD.r,
                y2: t.y,
                stroke: "var(--border)",
                strokeWidth: 1,
                strokeDasharray: i === 0 ? "0" : "3 4"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "text",
              {
                x: PAD.l - 10,
                y: t.y + 4,
                textAnchor: "end",
                className: "fill-muted-foreground",
                fontSize: 12,
                children: format(t.v)
              }
            )
          ] }, i)),
          areaPath && /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: areaPath, fill: `url(#${gradientId})` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "path",
            {
              d: linePath,
              fill: "none",
              stroke: color,
              strokeWidth: 2.5,
              strokeLinejoin: "round",
              strokeLinecap: "round"
            }
          ),
          data.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "circle",
            {
              cx: x(i),
              cy: y(d.value),
              r: hover === i ? 5 : data.length > 30 ? 0 : 3,
              fill: "var(--background)",
              stroke: color,
              strokeWidth: 2
            },
            i
          )),
          hover !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "line",
            {
              x1: x(hover),
              y1: PAD.t,
              x2: x(hover),
              y2: PAD.t + innerH,
              stroke: color,
              strokeWidth: 1,
              strokeDasharray: "3 3",
              opacity: 0.6
            }
          ),
          xLabels.map(({ d, i }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "text",
            {
              x: x(i),
              y: H - 12,
              textAnchor: "middle",
              className: "fill-muted-foreground",
              fontSize: 12,
              children: d.label
            },
            i
          ))
        ]
      }
    ),
    hover !== null && data[hover] && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "pointer-events-none absolute -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-1.5 text-xs shadow-md",
        style: {
          left: `${x(hover) / W * 100}%`,
          top: 0
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-foreground", children: format(data[hover].value) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: data[hover].label })
        ]
      }
    )
  ] });
}
function todayStr() {
  const d = /* @__PURE__ */ new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
function daysBetween(from, to) {
  const a = (/* @__PURE__ */ new Date(`${from}T00:00:00`)).getTime();
  const b = (/* @__PURE__ */ new Date(`${to}T00:00:00`)).getTime();
  return Math.round((b - a) / 864e5);
}
const DEFAULT_SHARES = 1e3;
function PortfolioPage() {
  const queryClient = useQueryClient();
  const etfQuery = useQuery({
    queryKey: ["etfs"],
    queryFn: () => listEtfs()
  });
  const banksQuery = useQuery({
    queryKey: ["banks"],
    queryFn: () => listBanks()
  });
  const holdingsQuery = useQuery({
    queryKey: ["holdings"],
    queryFn: () => listHoldings()
  });
  const etfs = etfQuery.data?.rows ?? [];
  const banks = banksQuery.data?.rows ?? [];
  const holdings = holdingsQuery.data ?? [];
  const instrumentMap = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    etfs.forEach((e) => m.set(e.code, {
      code: e.code,
      name: e.name,
      kind: "etf",
      subtitle: e.indexName,
      price: e.nav,
      dividendYield: e.dividendYield,
      freq: e.dividendFreq,
      searchText: `${e.name}${e.code}${e.indexName}${e.manager}`.toLowerCase(),
      valuation: valuateMulti(e)
    }));
    banks.forEach((b) => m.set(b.code, {
      code: b.code,
      name: b.name,
      kind: "bank",
      subtitle: b.category,
      price: b.price,
      dividendYield: b.dividendYield,
      freq: "年度",
      searchText: `${b.name}${b.code}${b.category}`.toLowerCase(),
      valuation: null
    }));
    return m;
  }, [etfs, banks]);
  const allInstruments = reactExports.useMemo(() => [...instrumentMap.values()], [instrumentMap]);
  const [keyword, setKeyword] = reactExports.useState("");
  const [draft, setDraft] = reactExports.useState({});
  reactExports.useEffect(() => {
    setDraft(Object.fromEntries(holdings.map((h) => [h.code, String(h.amount)])));
  }, [holdings]);
  function invalidate() {
    return queryClient.invalidateQueries({
      queryKey: ["holdings"]
    });
  }
  const [refreshing, setRefreshing] = reactExports.useState(false);
  async function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await Promise.all([queryClient.invalidateQueries({
        queryKey: ["etfs"]
      }), queryClient.invalidateQueries({
        queryKey: ["banks"]
      }), queryClient.invalidateQueries({
        queryKey: ["holdings"]
      })]);
      toast.success("已刷新最新行情");
    } catch {
      toast.error("刷新失败，请重试");
    } finally {
      setRefreshing(false);
    }
  }
  const addMutation = useMutation({
    mutationFn: (code) => addHolding({
      data: {
        code,
        amount: DEFAULT_SHARES
      }
    }),
    onSuccess: (_r, code) => {
      invalidate();
      toast.success(`已添加 ${instrumentMap.get(code)?.name ?? code}`);
      setKeyword("");
    },
    onError: () => toast.error("添加失败，请重试")
  });
  const amountMutation = useMutation({
    mutationFn: (v) => setHoldingAmount({
      data: v
    }),
    onSuccess: () => invalidate(),
    onError: () => toast.error("保存失败，请重试")
  });
  const removeMutation = useMutation({
    mutationFn: (code) => removeHolding({
      data: {
        code
      }
    }),
    onSuccess: () => invalidate(),
    onError: () => toast.error("移除失败，请重试")
  });
  function add(code) {
    if (holdings.some((h) => h.code === code)) {
      toast.info("该 ETF 已在组合中");
      return;
    }
    addMutation.mutate(code);
  }
  function commitAmount(code) {
    const value = Number(draft[code]);
    const current = holdings.find((h) => h.code === code)?.amount;
    if (!Number.isFinite(value) || value < 0) return;
    if (current === value) return;
    amountMutation.mutate({
      code,
      amount: value
    });
  }
  const rows = reactExports.useMemo(() => {
    return holdings.map((h) => {
      const inst = instrumentMap.get(h.code);
      if (!inst) return null;
      const marketValue = h.amount * inst.price;
      const annualIncome = marketValue * (inst.dividendYield / 100);
      return {
        holding: h,
        inst,
        marketValue,
        annualIncome
      };
    }).filter((r) => r !== null);
  }, [holdings, instrumentMap]);
  const totalAmount = rows.reduce((s, r) => s + r.marketValue, 0);
  const totalIncome = rows.reduce((s, r) => s + r.annualIncome, 0);
  const portfolioYield = totalAmount > 0 ? totalIncome / totalAmount * 100 : 0;
  const today = todayStr();
  const dividendEvents = reactExports.useMemo(() => {
    const held = new Map(holdings.map((h) => [h.code, h.amount]));
    return DIVIDENDS.filter((ev) => held.has(ev.code)).map((ev) => {
      const inst = instrumentMap.get(ev.code);
      const shares = held.get(ev.code) ?? 0;
      return {
        ev,
        name: inst?.name ?? ev.code,
        freq: inst?.freq ?? "—",
        singleYield: inst && inst.price > 0 ? ev.perShare / inst.price * 100 : 0,
        payout: shares * ev.perShare,
        daysToEx: daysBetween(today, ev.exDate)
      };
    });
  }, [holdings, instrumentMap, today]);
  const upcomingDividends = reactExports.useMemo(() => dividendEvents.filter((r) => r.ev.exDate >= today).sort((a, b) => a.ev.exDate.localeCompare(b.ev.exDate)), [dividendEvents, today]);
  const pastDividends = reactExports.useMemo(() => dividendEvents.filter((r) => r.ev.exDate < today).sort((a, b) => b.ev.exDate.localeCompare(a.ev.exDate)).slice(0, 6), [dividendEvents, today]);
  const upcomingPayout = upcomingDividends.reduce((s, r) => s + r.payout, 0);
  const [initial, setInitial] = reactExports.useState("0");
  const [monthly, setMonthly] = reactExports.useState("6000");
  const [years, setYears] = reactExports.useState("10");
  const [growth, setGrowth] = reactExports.useState("3");
  const [swing, setSwing] = reactExports.useState("3");
  const [reinvest, setReinvest] = reactExports.useState(true);
  const [taxRate, setTaxRate] = reactExports.useState(0);
  const [inflationOn, setInflationOn] = reactExports.useState(false);
  const [inflation, setInflation] = reactExports.useState("2");
  const [divYieldDraft, setDivYieldDraft] = reactExports.useState("");
  const autoYield = portfolioYield > 0 ? portfolioYield : 5;
  const effectiveYield = divYieldDraft.trim() !== "" ? Math.max(0, Number(divYieldDraft) || 0) : autoYield;
  const projection = reactExports.useMemo(() => {
    const init = Math.max(0, Number(initial) || 0);
    const m = Math.max(0, Number(monthly) || 0);
    const yrs = Math.max(1, Math.min(50, Math.round(Number(years) || 0)));
    const y = effectiveYield / 100;
    const taxFactor = 1 - taxRate / 100;
    const inflRate = inflationOn ? (Number(inflation) || 0) / 100 : 0;
    const gNeutral = (Number(growth) || 0) / 100;
    const spr = Math.max(0, Number(swing) || 0) / 100;
    function sim(g) {
      let assets = init;
      let cumNet = 0;
      const points = [];
      for (let mo = 1; mo <= yrs * 12; mo++) {
        assets += m;
        const gross = assets * y / 12;
        const net = gross * taxFactor;
        cumNet += net / Math.pow(1 + inflRate, mo / 12);
        assets *= 1 + g / 12;
        if (reinvest) assets += net;
        if (mo % 12 === 0) {
          const yr = mo / 12;
          points.push({
            label: `${yr}`,
            value: assets / Math.pow(1 + inflRate, yr)
          });
        }
      }
      const endDeflator = Math.pow(1 + inflRate, yrs);
      return {
        finalAssets: assets / endDeflator,
        finalAnnualDividend: assets * y * taxFactor / endDeflator,
        cumulativeDividends: cumNet,
        points
      };
    }
    const neutral = sim(gNeutral);
    const optimistic = sim(gNeutral + spr);
    const pessimistic = sim(gNeutral - spr);
    const invested = init + m * 12 * yrs;
    return {
      invested,
      neutral,
      optimistic,
      pessimistic,
      gain: neutral.finalAssets - invested,
      yrs,
      real: inflRate > 0
    };
  }, [initial, monthly, years, growth, swing, effectiveYield, reinvest, taxRate, inflationOn, inflation]);
  const searchResults = reactExports.useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return [];
    return allInstruments.filter((i) => !holdings.some((h) => h.code === i.code)).filter((i) => i.searchText.includes(kw)).slice(0, 8);
  }, [keyword, allInstruments, holdings]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rise-in space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "island-kicker", children: "Portfolio" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "display-title mt-1 text-3xl font-bold text-foreground", children: "我的持仓组合" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "搜索并添加 ETF，填写持有份数，自动按现价测算组合市值、加权股息率与预计年被动收入。数据保存在 Cloudflare D1 数据库。" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: refresh, disabled: refreshing, className: "shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: cn("size-4", refreshing && "animate-spin") }),
        "刷新"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: Wallet, label: "组合市值", value: `¥${Math.round(totalAmount).toLocaleString()}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: PiggyBank, label: "组合加权股息率", value: `${portfolioYield.toFixed(2)}%`, accent: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: PiggyBank, label: "预计年被动收入", value: `¥${totalIncome.toLocaleString(void 0, {
        maximumFractionDigits: 0
      })}`, accent: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: PiggyBank, label: "预计月均被动收入", value: `¥${(totalIncome / 12).toLocaleString(void 0, {
        maximumFractionDigits: 0
      })}` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "island-shell rounded-2xl p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground", children: "添加 ETF" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: keyword, onChange: (e) => setKeyword(e.target.value), placeholder: "输入名称 / 代码，如 中证红利、510880、招商银行", className: "pl-9" })
      ] }),
      searchResults.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 divide-y divide-border rounded-xl border border-border", children: searchResults.map((inst) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 px-4 py-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate text-sm font-medium text-foreground", children: [
            inst.name,
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-xs text-muted-foreground", children: [
              inst.code,
              " · ",
              inst.subtitle
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 flex items-center gap-2 text-xs text-muted-foreground", children: [
            "股息率 ",
            inst.dividendYield.toFixed(2),
            "%",
            inst.valuation ? /* @__PURE__ */ jsxRuntimeExports.jsx(RatingBadge, { valuation: inst.valuation }) : /* @__PURE__ */ jsxRuntimeExports.jsx(KindTag, { kind: inst.kind })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => add(inst.code), disabled: addMutation.isPending, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
          "添加"
        ] })
      ] }, inst.code)) })
    ] }),
    holdingsQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "island-shell rounded-2xl py-16 text-center text-sm text-muted-foreground", children: "加载组合中…" }) : rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "island-shell flex flex-col items-center justify-center gap-2 rounded-2xl py-16 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "size-8 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "组合还是空的，先在上方搜索并添加 ETF 吧。" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "island-shell overflow-hidden rounded-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border text-left text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-medium", children: "ETF" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-medium", children: "现价" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-medium", children: "股息率" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-medium", children: "评级" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-medium", children: "持有数量(份/股)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-medium", children: "市值(元)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-medium", children: "占比" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-medium", children: "预计年分红" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right font-medium", children: "操作" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map(({
        holding,
        inst,
        marketValue,
        annualIncome
      }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/60 hover:bg-accent/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-semibold text-foreground", children: [
            inst.name,
            /* @__PURE__ */ jsxRuntimeExports.jsx(KindTag, { kind: inst.kind })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            inst.code,
            " · ",
            inst.subtitle
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 tabular-nums text-muted-foreground", children: inst.price.toFixed(inst.kind === "etf" ? 3 : 2) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-semibold tabular-nums text-foreground", children: [
          inst.dividendYield.toFixed(2),
          "%"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: inst.valuation ? /* @__PURE__ */ jsxRuntimeExports.jsx(RatingBadge, { valuation: inst.valuation }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: draft[inst.code] ?? String(holding.amount), min: 0, step: 100, onChange: (e) => setDraft((d) => ({
          ...d,
          [inst.code]: e.target.value
        })), onBlur: () => commitAmount(inst.code), className: "h-8 w-28 tabular-nums" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 tabular-nums text-foreground", children: [
          "¥",
          marketValue.toLocaleString(void 0, {
            maximumFractionDigits: 0
          })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 tabular-nums text-muted-foreground", children: [
          totalAmount > 0 ? (marketValue / totalAmount * 100).toFixed(1) : "0.0",
          "%"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-medium tabular-nums text-emerald-600 dark:text-emerald-400", children: [
          "¥",
          annualIncome.toLocaleString(void 0, {
            maximumFractionDigits: 0
          })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => removeMutation.mutate(inst.code), title: "移除", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4 text-rose-500" }) }) })
      ] }, inst.code)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/40 font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-foreground", children: "合计" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 tabular-nums text-foreground", children: [
          portfolioYield.toFixed(2),
          "%"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 tabular-nums text-foreground", children: [
          "¥",
          totalAmount.toLocaleString(void 0, {
            maximumFractionDigits: 0
          })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: "100%" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 tabular-nums text-emerald-600 dark:text-emerald-400", children: [
          "¥",
          totalIncome.toLocaleString(void 0, {
            maximumFractionDigits: 0
          })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3" })
      ] }) })
    ] }) }) }),
    rows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "island-shell rounded-2xl p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "size-4 text-[var(--lagoon-deep)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-foreground", children: "持仓分红日历" })
        ] }),
        upcomingPayout > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
          "未来预计到手（税前）",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 font-semibold text-emerald-600 dark:text-emerald-400", children: [
            "¥",
            Math.round(upcomingPayout).toLocaleString()
          ] })
        ] })
      ] }),
      dividendEvents.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-8 text-center text-sm text-muted-foreground", children: "当前持仓暂无分红安排数据。分红数据每季度前后更新。" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-4", children: [
        upcomingDividends.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-muted-foreground", children: "即将分红" }),
          upcomingDividends.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(DividendLine, { name: r.name, code: r.ev.code, freq: r.freq, exDate: r.ev.exDate, recordDate: r.ev.recordDate, perShare: r.ev.perShare, singleYield: r.singleYield, payout: r.payout, daysToEx: r.daysToEx, estimated: r.ev.estimated }, `${r.ev.code}-${r.ev.exDate}`))
        ] }),
        pastDividends.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-muted-foreground", children: "近期已分红" }),
          pastDividends.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(DividendLine, { name: r.name, code: r.ev.code, freq: r.freq, exDate: r.ev.exDate, recordDate: r.ev.recordDate, perShare: r.ev.perShare, singleYield: r.singleYield, payout: r.payout, past: true }, `${r.ev.code}-${r.ev.exDate}`))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 text-[11px] leading-relaxed text-muted-foreground", children: [
        "红利税按持有期计征：≤1 个月 20%，1 个月–1 年 10%，超过 1 年免征；“到手”为税前金额。数据日期",
        " ",
        DIVIDEND_DATA_DATE,
        "，除息日晚于该日期者为预告（标“预”），以基金公告为准。"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "island-shell rounded-2xl p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-4 text-[var(--lagoon-deep)]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-foreground", children: "资产预测 · 定投测算" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "假设每月定投固定金额、按设定的年化涨幅与股息率复利增长，估算若干年后的总资产与被动收入。仅为理论测算，不代表未来收益。" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectionField, { label: "初始资金(元)", value: initial, onChange: setInitial, step: 1e4, hint: "起始一次性投入的本金" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectionField, { label: "月定投金额(元)", value: monthly, onChange: setMonthly, step: 500 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectionField, { label: "投资年限(年)", value: years, onChange: setYears, step: 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectionField, { label: "预期年化涨幅(%)", value: growth, onChange: setGrowth, step: 1, hint: "中性情景的价格年化增长假设" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectionField, { label: "情景波动(±%)", value: swing, onChange: setSwing, step: 1, hint: "乐观/悲观相对中性的涨幅偏移" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectionField, { label: "股息率(%)", value: divYieldDraft, onChange: setDivYieldDraft, step: 0.5, placeholder: autoYield.toFixed(2), hint: "留空默认取组合加权股息率" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-x-6 gap-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex w-fit cursor-pointer items-center gap-2 text-sm text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: reinvest, onChange: (e) => setReinvest(e.target.checked), className: "size-4 accent-[var(--lagoon-deep)]" }),
          "分红再投入(复利滚存)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "分红计税" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: [[0, "免税"], [10, "10%"], [20, "20%"]].map(([rate, lbl]) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTaxRate(rate), className: cn("rounded-full border px-3 py-1 text-xs font-medium transition", taxRate === rate ? "border-transparent bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"), children: lbl }, rate)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex w-fit cursor-pointer items-center gap-2 text-sm text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: inflationOn, onChange: (e) => setInflationOn(e.target.checked), className: "size-4 accent-[var(--lagoon-deep)]" }),
          "按通胀折算购买力"
        ] }),
        inflationOn && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-sm text-muted-foreground", children: [
          "通胀率",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: inflation, min: 0, step: 0.5, onChange: (e) => setInflation(e.target.value), className: "h-8 w-20 tabular-nums" }),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: Wallet, label: `累计投入本金(${projection.yrs}年)`, value: `¥${Math.round(projection.invested).toLocaleString()}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: TrendingUp, label: `第 ${projection.yrs} 年末总资产${projection.real ? " · 今日购买力" : ""}`, value: `¥${Math.round(projection.neutral.finalAssets).toLocaleString()}`, accent: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: PiggyBank, label: `第 ${projection.yrs} 年度分红${taxRate > 0 ? "(税后)" : ""}`, value: `¥${Math.round(projection.neutral.finalAnnualDividend).toLocaleString()}`, accent: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: PiggyBank, label: `累计分红到手${taxRate > 0 ? "(税后)" : ""}`, value: `¥${Math.round(projection.neutral.cumulativeDividends).toLocaleString()}` })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground", children: [
        "期末总资产区间（",
        projection.yrs,
        " 年后",
        projection.real ? " · 今日购买力" : "",
        "）：",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 font-semibold text-rose-500", children: [
          "悲观 ¥",
          Math.round(projection.pessimistic.finalAssets).toLocaleString()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1", children: "·" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-foreground", children: [
          "中性 ¥",
          Math.round(projection.neutral.finalAssets).toLocaleString()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1", children: "·" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-emerald-500", children: [
          "乐观 ¥",
          Math.round(projection.optimistic.finalAssets).toLocaleString()
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendChart, { data: projection.neutral.points, color: "var(--lagoon-deep)", format: (v) => `¥${Math.round(v).toLocaleString()}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-center text-xs text-muted-foreground", children: [
          "曲线为中性情景（横轴年数）。中性期末 ¥",
          Math.round(projection.neutral.finalAssets).toLocaleString(),
          "，含投入本金 ¥",
          Math.round(projection.invested).toLocaleString(),
          !projection.real && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            "、增值收益 ¥",
            Math.round(projection.gain).toLocaleString()
          ] }),
          "。",
          projection.real && "（已按通胀折算为今日购买力）",
          taxRate > 0 && `分红按 ${taxRate}% 计税。`
        ] })
      ] })
    ] })
  ] });
}
function ProjectionField({
  label,
  value,
  onChange,
  step,
  placeholder,
  hint
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value, min: 0, step, placeholder, onChange: (e) => onChange(e.target.value), className: "tabular-nums" }),
    hint && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: hint })
  ] });
}
function DividendLine({
  name,
  code,
  freq,
  exDate,
  recordDate,
  perShare,
  singleYield,
  payout,
  daysToEx,
  estimated,
  past
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-2.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate text-sm font-medium text-foreground", children: [
        name,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-xs font-normal text-muted-foreground", children: [
          code,
          " · ",
          freq
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 text-xs text-muted-foreground", children: [
        "登记 ",
        recordDate.slice(5),
        " · 除息 ",
        exDate.slice(5),
        estimated && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 rounded bg-amber-500/15 px-1 text-[10px] font-medium text-amber-600 dark:text-amber-400", children: "预" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold tabular-nums text-foreground", children: [
          perShare.toFixed(3),
          " 元/份"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs tabular-nums text-muted-foreground", children: [
          "单次 ≈ ",
          singleYield.toFixed(2),
          "%",
          payout > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-emerald-600 dark:text-emerald-400", children: [
            "· ",
            past ? "到手" : "预计",
            " ¥",
            Math.round(payout).toLocaleString()
          ] })
        ] })
      ] }),
      !past && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("w-16 shrink-0 rounded-full border px-2 py-0.5 text-center text-xs font-semibold", (daysToEx ?? 99) <= 7 ? "border-rose-500/30 bg-rose-500/15 text-rose-600 dark:text-rose-400" : "border-border text-muted-foreground"), children: daysToEx === 0 ? "今日" : `${daysToEx}天` })
    ] })
  ] });
}
function KindTag({
  kind
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium", kind === "etf" ? "bg-sky-500/15 text-sky-600 dark:text-sky-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"), children: kind === "etf" ? "ETF" : "银行" });
}
function SummaryCard({
  icon: Icon,
  label,
  value,
  accent
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feature-card rounded-2xl border border-border p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-4" }),
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("mt-2 text-2xl font-bold tabular-nums", accent ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"), children: value })
  ] });
}
export {
  PortfolioPage as component
};
