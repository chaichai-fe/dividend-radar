# 红利雷达 · Dividend Radar

A 股红利类 ETF 的估值与组合管理 Web App。复用 job-manager 的技术栈：
TanStack Start + React 19 + Vite + Cloudflare Workers + Tailwind v4 + shadcn/ui。

## 功能

1. **统一红利 ETF 行情**：汇总 A 股主流红利 / 红利低波 / 央企红利等 ETF，
   展示实时净值（现价、当日涨跌幅）与跟踪指数股息率。
2. **估值评级**：以“当前股息率在该指数多年区间中的分位”衡量低估程度，
   给出 低估 / 合理 / 高估 五档评级与是否值得加仓的建议。
3. **资产管理**：搜索并添加红利 ETF 到组合，自动测算
   组合加权股息率、预计年 / 月被动收入与各标的占比（数据存 Cloudflare D1）。
4. **历史走势**：按日记录组合快照（总投入 / 加权股息率 / 年被动收入），
   零依赖 SVG 走势图展示变化，组合非空时每天首访自动记录。

## 数据说明

- **净值 / 涨跌幅**：由服务端实时抓取腾讯行情接口（`qt.gtimg.cn`），抓取失败时回退到静态种子值。
- **股息率 / 市盈率 / 估值区间**：为指数层面的参考值（来源：东方财富、红利查、私募排排网、各基金公司官网），
  变化缓慢，维护在 `src/lib/etf-data.ts`，可按需更新。
- ⚠️ 本项目仅供学习研究，不构成任何投资建议。

## 开发

```bash
bun install
bun run dev          # http://localhost:3100
```

## 目录结构

- `src/lib/etf-data.ts` —— 红利 ETF 与跟踪指数静态数据集
- `src/lib/rating.ts` —— 估值评级方法论
- `src/lib/portfolio.ts` —— 组合本地存储
- `src/server/etfs.ts` —— 实时净值抓取的 server function
- `src/routes/` —— 概览 / 估值榜 / 我的组合三个页面

## 部署（可选）

已保留 Cloudflare 配置，可直接部署到 Workers：

```bash
bun run deploy
```
