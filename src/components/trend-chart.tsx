import { useState } from 'react'

export interface TrendPoint {
  label: string
  value: number
}

interface TrendChartProps {
  data: Array<TrendPoint>
  /** 折线/填充颜色 */
  color?: string
  /** 值格式化，用于坐标轴与提示 */
  format?: (v: number) => string
}

const W = 820
const H = 260
const PAD = { l: 64, r: 20, t: 20, b: 36 }
const innerW = W - PAD.l - PAD.r
const innerH = H - PAD.t - PAD.b

export function TrendChart({
  data,
  color = 'var(--lagoon-deep)',
  format = (v) => v.toLocaleString(),
}: TrendChartProps) {
  const [hover, setHover] = useState<number | null>(null)

  const values = data.map((d) => d.value)
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  // 留出上下余量，避免线贴边；单点时给一个对称区间
  const span = rawMax - rawMin
  const min = span === 0 ? rawMin - Math.abs(rawMin || 1) * 0.1 : rawMin - span * 0.12
  const max = span === 0 ? rawMax + Math.abs(rawMax || 1) * 0.1 : rawMax + span * 0.12
  const range = max - min || 1

  const x = (i: number) =>
    data.length === 1 ? PAD.l + innerW / 2 : PAD.l + (i / (data.length - 1)) * innerW
  const y = (v: number) => PAD.t + (1 - (v - min) / range) * innerH

  const linePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(d.value).toFixed(1)}`)
    .join(' ')
  const areaPath =
    data.length > 1
      ? `${linePath} L ${x(data.length - 1).toFixed(1)} ${PAD.t + innerH} L ${x(0).toFixed(1)} ${PAD.t + innerH} Z`
      : ''

  const gridLines = 4
  const yTicks = Array.from({ length: gridLines + 1 }, (_, i) => {
    const v = min + (range * i) / gridLines
    return { v, y: y(v) }
  })

  // x 轴标签最多展示约 6 个
  const step = Math.max(1, Math.ceil(data.length / 6))
  const xLabels = data
    .map((d, i) => ({ d, i }))
    .filter(({ i }) => i % step === 0 || i === data.length - 1)

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    const svgX = ratio * W
    if (data.length === 1) {
      setHover(0)
      return
    }
    const idx = Math.round(((svgX - PAD.l) / innerW) * (data.length - 1))
    setHover(Math.min(data.length - 1, Math.max(0, idx)))
  }

  const gradientId = 'trend-grad'

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 'auto' }}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={PAD.l}
              y1={t.y}
              x2={W - PAD.r}
              y2={t.y}
              stroke="var(--border)"
              strokeWidth={1}
              strokeDasharray={i === 0 ? '0' : '3 4'}
            />
            <text
              x={PAD.l - 10}
              y={t.y + 4}
              textAnchor="end"
              className="fill-muted-foreground"
              fontSize={12}
            >
              {format(t.v)}
            </text>
          </g>
        ))}

        {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {data.map((d, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(d.value)}
            r={hover === i ? 5 : data.length > 30 ? 0 : 3}
            fill="var(--background)"
            stroke={color}
            strokeWidth={2}
          />
        ))}

        {hover !== null && (
          <line
            x1={x(hover)}
            y1={PAD.t}
            x2={x(hover)}
            y2={PAD.t + innerH}
            stroke={color}
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.6}
          />
        )}

        {xLabels.map(({ d, i }) => (
          <text
            key={i}
            x={x(i)}
            y={H - 12}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={12}
          >
            {d.label}
          </text>
        ))}
      </svg>

      {hover !== null && data[hover] && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-1.5 text-xs shadow-md"
          style={{
            left: `${(x(hover) / W) * 100}%`,
            top: 0,
          }}
        >
          <div className="font-medium text-foreground">
            {format(data[hover].value)}
          </div>
          <div className="text-muted-foreground">{data[hover].label}</div>
        </div>
      )}
    </div>
  )
}
