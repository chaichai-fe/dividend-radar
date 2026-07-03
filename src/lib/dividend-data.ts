/**
 * 红利 ETF 分红日历数据集（静态维护）。
 *
 * 字段为各 ETF 近期的现金分红安排：股权登记日、除息日、红利发放日、每份分红。
 * 与本项目其它基本面数据一致，均为参考值，随基金公告更新；
 * 除息日晚于 DIVIDEND_DATA_DATE 的记录为“预计/预告”（estimated=true），以实际公告为准。
 *
 * ⚠️ 本数据仅供学习与研究，不构成任何投资建议。分红实际到账以基金公告为准。
 */

export const DIVIDEND_DATA_DATE = '2026-06-30'

export interface DividendEvent {
  /** ETF 场内代码，对应 ETFS.code */
  code: string
  /** 股权登记日 */
  recordDate: string
  /** 除息日 */
  exDate: string
  /** 红利发放日(到账) */
  payDate: string
  /** 每份分红(元) */
  perShare: number
  /** 是否为预计/预告(尚未正式除息) */
  estimated?: boolean
}

export const DIVIDENDS: Array<DividendEvent> = [
  // 510880 红利ETF（年度）
  { code: '510880', recordDate: '2025-01-16', exDate: '2025-01-17', payDate: '2025-01-23', perShare: 0.085 },
  { code: '510880', recordDate: '2026-01-15', exDate: '2026-01-16', payDate: '2026-01-22', perShare: 0.09 },

  // 515080 中证红利ETF招商（季度）
  { code: '515080', recordDate: '2025-12-22', exDate: '2025-12-23', payDate: '2025-12-29', perShare: 0.022 },
  { code: '515080', recordDate: '2026-03-23', exDate: '2026-03-24', payDate: '2026-03-30', perShare: 0.021 },
  { code: '515080', recordDate: '2026-06-23', exDate: '2026-06-24', payDate: '2026-06-30', perShare: 0.02 },
  { code: '515080', recordDate: '2026-09-22', exDate: '2026-09-23', payDate: '2026-09-29', perShare: 0.02, estimated: true },

  // 515180 红利ETF易方达（年度）
  { code: '515180', recordDate: '2025-12-18', exDate: '2025-12-19', payDate: '2025-12-25', perShare: 0.05 },

  // 515890 红利ETF博时（季度）
  { code: '515890', recordDate: '2026-03-18', exDate: '2026-03-19', payDate: '2026-03-25', perShare: 0.016 },
  { code: '515890', recordDate: '2026-06-18', exDate: '2026-06-19', payDate: '2026-06-25', perShare: 0.015 },
  { code: '515890', recordDate: '2026-09-18', exDate: '2026-09-21', payDate: '2026-09-25', perShare: 0.015, estimated: true },

  // 159581 红利ETF基金万家（月度）
  { code: '159581', recordDate: '2026-05-26', exDate: '2026-05-27', payDate: '2026-06-02', perShare: 0.006 },
  { code: '159581', recordDate: '2026-06-25', exDate: '2026-06-26', payDate: '2026-07-02', perShare: 0.006 },
  { code: '159581', recordDate: '2026-07-27', exDate: '2026-07-28', payDate: '2026-08-03', perShare: 0.006, estimated: true },

  // 512890 红利低波ETF华泰柏瑞（季度）
  { code: '512890', recordDate: '2026-03-16', exDate: '2026-03-17', payDate: '2026-03-23', perShare: 0.014 },
  { code: '512890', recordDate: '2026-06-16', exDate: '2026-06-17', payDate: '2026-06-23', perShare: 0.014 },
  { code: '512890', recordDate: '2026-09-16', exDate: '2026-09-17', payDate: '2026-09-23', perShare: 0.014, estimated: true },

  // 563020 红利低波动ETF易方达（季度）
  { code: '563020', recordDate: '2026-06-12', exDate: '2026-06-15', payDate: '2026-06-19', perShare: 0.013 },
  { code: '563020', recordDate: '2026-09-14', exDate: '2026-09-15', payDate: '2026-09-21', perShare: 0.013, estimated: true },

  // 159525 红利低波ETF富国（季度）
  { code: '159525', recordDate: '2026-06-19', exDate: '2026-06-22', payDate: '2026-06-28', perShare: 0.012 },
  { code: '159525', recordDate: '2026-09-21', exDate: '2026-09-22', payDate: '2026-09-28', perShare: 0.012, estimated: true },

  // 515100 红利低波100ETF景顺长城（季度）
  { code: '515100', recordDate: '2026-03-20', exDate: '2026-03-23', payDate: '2026-03-27', perShare: 0.013 },
  { code: '515100', recordDate: '2026-06-22', exDate: '2026-06-23', payDate: '2026-06-29', perShare: 0.013 },
  { code: '515100', recordDate: '2026-09-21', exDate: '2026-09-22', payDate: '2026-09-28', perShare: 0.013, estimated: true },

  // 515300 红利低波ETF嘉实（季度）
  { code: '515300', recordDate: '2026-06-16', exDate: '2026-06-17', payDate: '2026-06-23', perShare: 0.015 },
  { code: '515300', recordDate: '2026-09-16', exDate: '2026-09-17', payDate: '2026-09-23', perShare: 0.015, estimated: true },

  // 512530 沪深300红利ETF建信（年度）
  { code: '512530', recordDate: '2026-01-20', exDate: '2026-01-21', payDate: '2026-01-27', perShare: 0.048 },

  // 561580 央企红利ETF华泰柏瑞（季度）
  { code: '561580', recordDate: '2026-06-10', exDate: '2026-06-11', payDate: '2026-06-17', perShare: 0.013 },
  { code: '561580', recordDate: '2026-09-10', exDate: '2026-09-11', payDate: '2026-09-17', perShare: 0.013, estimated: true },

  // 561060 国企红利ETF华安（季度）
  { code: '561060', recordDate: '2026-06-11', exDate: '2026-06-12', payDate: '2026-06-18', perShare: 0.012 },
  { code: '561060', recordDate: '2026-09-11', exDate: '2026-09-14', payDate: '2026-09-18', perShare: 0.012, estimated: true },

  // 560700 央企回报ETF国新（半年度）
  { code: '560700', recordDate: '2025-12-15', exDate: '2025-12-16', payDate: '2025-12-22', perShare: 0.03 },
  { code: '560700', recordDate: '2026-06-15', exDate: '2026-06-16', payDate: '2026-06-22', perShare: 0.028 },

  // 510720 红利国企ETF国泰（月度）
  { code: '510720', recordDate: '2026-05-15', exDate: '2026-05-18', payDate: '2026-05-22', perShare: 0.008 },
  { code: '510720', recordDate: '2026-06-15', exDate: '2026-06-16', payDate: '2026-06-22', perShare: 0.008 },
  { code: '510720', recordDate: '2026-07-15', exDate: '2026-07-16', payDate: '2026-07-22', perShare: 0.008, estimated: true },

  // 515450 红利低波50ETF南方（季度）
  { code: '515450', recordDate: '2026-06-18', exDate: '2026-06-19', payDate: '2026-06-25', perShare: 0.013 },
  { code: '515450', recordDate: '2026-09-17', exDate: '2026-09-18', payDate: '2026-09-24', perShare: 0.013, estimated: true },

  // 159905 深红利ETF工银瑞信（年度）
  { code: '159905', recordDate: '2025-12-10', exDate: '2025-12-11', payDate: '2025-12-17', perShare: 0.04 },

  // 563180 高股息ETF银华（季度）
  { code: '563180', recordDate: '2026-06-24', exDate: '2026-06-25', payDate: '2026-07-01', perShare: 0.014 },
  { code: '563180', recordDate: '2026-09-23', exDate: '2026-09-24', payDate: '2026-09-30', perShare: 0.014, estimated: true },
]
