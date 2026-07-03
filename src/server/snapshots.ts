import { createServerFn } from '@tanstack/react-start'
import { asc, eq } from 'drizzle-orm'
import { getDb } from '#/db'
import { snapshots } from '#/db/schema'

export interface SnapshotInput {
  /** 自然日 YYYY-MM-DD（客户端本地时区） */
  day: string
  totalAmount: number
  portfolioYield: number
  annualIncome: number
  holdingsCount: number
}

export const listSnapshots = createServerFn({ method: 'GET' }).handler(
  async () => {
    const db = getDb()
    return db
      .select({
        day: snapshots.day,
        totalAmount: snapshots.totalAmount,
        portfolioYield: snapshots.portfolioYield,
        annualIncome: snapshots.annualIncome,
        holdingsCount: snapshots.holdingsCount,
      })
      .from(snapshots)
      .orderBy(asc(snapshots.day))
  },
)

/** 记录/覆盖当日快照。 */
export const upsertSnapshot = createServerFn({ method: 'POST' })
  .validator((data: SnapshotInput) => data)
  .handler(async ({ data }) => {
    const db = getDb()
    await db
      .insert(snapshots)
      .values({
        day: data.day,
        totalAmount: data.totalAmount,
        portfolioYield: data.portfolioYield,
        annualIncome: data.annualIncome,
        holdingsCount: data.holdingsCount,
        takenAt: new Date(),
      })
      .onConflictDoUpdate({
        target: snapshots.day,
        set: {
          totalAmount: data.totalAmount,
          portfolioYield: data.portfolioYield,
          annualIncome: data.annualIncome,
          holdingsCount: data.holdingsCount,
          takenAt: new Date(),
        },
      })
    return { ok: true }
  })

export const deleteSnapshot = createServerFn({ method: 'POST' })
  .validator((data: { day: string }) => data)
  .handler(async ({ data }) => {
    const db = getDb()
    await db.delete(snapshots).where(eq(snapshots.day, data.day))
    return { ok: true }
  })
