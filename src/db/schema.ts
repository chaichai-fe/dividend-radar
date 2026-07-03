import { sql } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

/**
 * 组合持仓：单用户个人工具，无需登录，以 ETF 代码为主键。
 * amount 为投入金额(元)，支持小数。
 */
export const holdings = sqliteTable('holdings', {
  code: text('code').primaryKey(),
  amount: real('amount').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
})

/**
 * 组合历史快照：以自然日(day: YYYY-MM-DD)为主键，每天一条，重复记录则覆盖。
 * 记录当日组合的总投入、加权股息率、预计年被动收入与持仓数量，用于绘制走势。
 */
export const snapshots = sqliteTable('snapshots', {
  day: text('day').primaryKey(),
  takenAt: integer('taken_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  totalAmount: real('total_amount').default(0).notNull(),
  portfolioYield: real('portfolio_yield').default(0).notNull(),
  annualIncome: real('annual_income').default(0).notNull(),
  holdingsCount: integer('holdings_count').default(0).notNull(),
})

export const schema = { holdings, snapshots } as const
