import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 距离某个 YYYY-MM-DD 日期至今的天数(向下取整，未来日期返回 0)。 */
export function daysSince(date: string): number {
  const then = new Date(`${date}T00:00:00`).getTime()
  if (!Number.isFinite(then)) return 0
  const diff = Date.now() - then
  return diff > 0 ? Math.floor(diff / 86_400_000) : 0
}
