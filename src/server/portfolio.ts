import { createServerFn } from '@tanstack/react-start'
import { asc, eq, sql } from 'drizzle-orm'
import { getDb } from '#/db'
import { holdings } from '#/db/schema'

export interface Holding {
  code: string
  amount: number
}

export const listHoldings = createServerFn({ method: 'GET' }).handler(
  async () => {
    const db = getDb()
    const rows = await db
      .select({ code: holdings.code, amount: holdings.amount })
      .from(holdings)
      .orderBy(asc(holdings.createdAt))
    return rows
  },
)

/** 加入组合：已存在则累加金额，否则新建。 */
export const addHolding = createServerFn({ method: 'POST' })
  .validator((data: Holding) => data)
  .handler(async ({ data }) => {
    const db = getDb()
    await db
      .insert(holdings)
      .values({ code: data.code, amount: data.amount })
      .onConflictDoUpdate({
        target: holdings.code,
        set: {
          amount: sql`${holdings.amount} + ${data.amount}`,
          updatedAt: new Date(),
        },
      })
    return { ok: true }
  })

/** 直接设置某只持仓的投入金额（表格内编辑）。 */
export const setHoldingAmount = createServerFn({ method: 'POST' })
  .validator((data: Holding) => data)
  .handler(async ({ data }) => {
    const db = getDb()
    await db
      .insert(holdings)
      .values({ code: data.code, amount: data.amount })
      .onConflictDoUpdate({
        target: holdings.code,
        set: { amount: data.amount, updatedAt: new Date() },
      })
    return { ok: true }
  })

export const removeHolding = createServerFn({ method: 'POST' })
  .validator((data: { code: string }) => data)
  .handler(async ({ data }) => {
    const db = getDb()
    await db.delete(holdings).where(eq(holdings.code, data.code))
    return { ok: true }
  })
