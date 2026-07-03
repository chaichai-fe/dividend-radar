const BANK_DATA_DATE = "2026-06-17";
const BANKS = [
  // 国有大行
  { code: "601398", name: "工商银行", market: "SH", category: "国有大行", dps: 0.3086, pb: 0.72, priceSeed: 6.5 },
  { code: "601939", name: "建设银行", market: "SH", category: "国有大行", dps: 0.4, pb: 0.75, priceSeed: 8.6 },
  { code: "601288", name: "农业银行", market: "SH", category: "国有大行", dps: 0.2319, pb: 0.78, priceSeed: 5.3 },
  { code: "601988", name: "中国银行", market: "SH", category: "国有大行", dps: 0.2364, pb: 0.7, priceSeed: 5.3 },
  { code: "601328", name: "交通银行", market: "SH", category: "国有大行", dps: 0.375, pb: 0.62, priceSeed: 7.6 },
  { code: "601658", name: "邮储银行", market: "SH", category: "国有大行", dps: 0.2616, pb: 0.68, priceSeed: 5.6 },
  // 股份制银行
  { code: "600036", name: "招商银行", market: "SH", category: "股份行", dps: 2, pb: 1.05, priceSeed: 44 },
  { code: "601166", name: "兴业银行", market: "SH", category: "股份行", dps: 1.04, pb: 0.58, priceSeed: 21 },
  { code: "600000", name: "浦发银行", market: "SH", category: "股份行", dps: 0.32, pb: 0.55, priceSeed: 11 },
  { code: "601998", name: "中信银行", market: "SH", category: "股份行", dps: 0.3562, pb: 0.62, priceSeed: 7.6 },
  { code: "600016", name: "民生银行", market: "SH", category: "股份行", dps: 0.13, pb: 0.38, priceSeed: 4.4 },
  { code: "601818", name: "光大银行", market: "SH", category: "股份行", dps: 0.1904, pb: 0.48, priceSeed: 3.9 },
  { code: "000001", name: "平安银行", market: "SZ", category: "股份行", dps: 0.646, pb: 0.55, priceSeed: 11.8 },
  { code: "600015", name: "华夏银行", market: "SH", category: "股份行", dps: 0.405, pb: 0.42, priceSeed: 7.8 },
  { code: "601916", name: "浙商银行", market: "SH", category: "股份行", dps: 0.16, pb: 0.52, priceSeed: 3.1 },
  // 城商行
  { code: "600919", name: "江苏银行", market: "SH", category: "城商行", dps: 0.507, pb: 0.85, priceSeed: 9.5 },
  { code: "601169", name: "北京银行", market: "SH", category: "城商行", dps: 0.32, pb: 0.55, priceSeed: 5.3 },
  { code: "601229", name: "上海银行", market: "SH", category: "城商行", dps: 0.48, pb: 0.58, priceSeed: 9.6 },
  { code: "601009", name: "南京银行", market: "SH", category: "城商行", dps: 0.5262, pb: 0.82, priceSeed: 11.2 },
  { code: "002142", name: "宁波银行", market: "SZ", category: "城商行", dps: 0.9, pb: 0.9, priceSeed: 27 },
  { code: "600926", name: "杭州银行", market: "SH", category: "城商行", dps: 0.6, pb: 0.9, priceSeed: 15.5 },
  { code: "601838", name: "成都银行", market: "SH", category: "城商行", dps: 0.897, pb: 0.95, priceSeed: 17.5 },
  { code: "601577", name: "长沙银行", market: "SH", category: "城商行", dps: 0.53, pb: 0.6, priceSeed: 9.6 },
  { code: "601997", name: "贵阳银行", market: "SH", category: "城商行", dps: 0.47, pb: 0.42, priceSeed: 6 },
  { code: "601963", name: "重庆银行", market: "SH", category: "城商行", dps: 0.348, pb: 0.6, priceSeed: 9.2 },
  { code: "600928", name: "西安银行", market: "SH", category: "城商行", dps: 0.15, pb: 0.62, priceSeed: 4.1 },
  { code: "601187", name: "厦门银行", market: "SH", category: "城商行", dps: 0.27, pb: 0.72, priceSeed: 5.6 },
  { code: "601665", name: "齐鲁银行", market: "SH", category: "城商行", dps: 0.25, pb: 0.78, priceSeed: 5.6 },
  // 农商行
  { code: "601077", name: "渝农商行", market: "SH", category: "农商行", dps: 0.244, pb: 0.58, priceSeed: 6.3 },
  { code: "601825", name: "沪农商行", market: "SH", category: "农商行", dps: 0.522, pb: 0.72, priceSeed: 9.2 },
  { code: "601128", name: "常熟银行", market: "SH", category: "农商行", dps: 0.25, pb: 0.82, priceSeed: 7.6 },
  { code: "601528", name: "瑞丰银行", market: "SH", category: "农商行", dps: 0.18, pb: 0.72, priceSeed: 5.6 },
  { code: "002958", name: "青农商行", market: "SZ", category: "农商行", dps: 0.12, pb: 0.55, priceSeed: 3.7 },
  { code: "600908", name: "无锡银行", market: "SH", category: "农商行", dps: 0.23, pb: 0.62, priceSeed: 6.1 },
  { code: "002839", name: "张家港行", market: "SZ", category: "农商行", dps: 0.2, pb: 0.7, priceSeed: 5.2 }
];
function rateBankYield(dividendYield) {
  if (dividendYield >= 6) {
    return { tier: "ultra", label: "极高股息", tone: "buy-strong", isHigh: true };
  }
  if (dividendYield >= 5) {
    return { tier: "high", label: "高股息", tone: "buy", isHigh: true };
  }
  if (dividendYield >= 4) {
    return { tier: "medium-high", label: "中高股息", tone: "hold", isHigh: false };
  }
  if (dividendYield >= 3) {
    return { tier: "normal", label: "一般", tone: "watch", isHigh: false };
  }
  return { tier: "low", label: "偏低", tone: "avoid", isHigh: false };
}
export {
  BANKS as B,
  BANK_DATA_DATE as a,
  rateBankYield as r
};
