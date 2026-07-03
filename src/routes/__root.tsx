import { useEffect } from 'react'
import {
  HeadContent,
  Link,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Gauge, Landmark, LayoutDashboard, Wallet } from 'lucide-react'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import { Toaster } from '../components/ui/sonner'
import { ThemeToggle } from '../components/theme-toggle'
import { themeInitScript } from '../lib/theme'
import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content:
          'width=device-width, initial-scale=1, viewport-fit=cover',
      },
      { title: '红利雷达 · A股红利ETF估值与组合' },
      {
        name: 'description',
        content:
          '汇总 A 股红利 ETF 的净值与股息率，做低估/高估估值评级与加仓建议，并管理你的红利组合、测算组合股息率与年被动收入。',
      },
      { name: 'theme-color', content: '#0f172a' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'black-translucent',
      },
      { name: 'apple-mobile-web-app-title', content: '红利雷达' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'icon', type: 'image/png', href: '/favicon-32.png' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    ],
  }),
  shellComponent: RootDocument,
})

const navItems = [
  { to: '/', label: '概览', icon: LayoutDashboard, exact: true },
  { to: '/etfs', label: '红利ETF估值', icon: Gauge, exact: false },
  { to: '/banks', label: '高股息银行', icon: Landmark, exact: false },
  { to: '/portfolio', label: '我的组合', icon: Wallet, exact: false },
] as const

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* 关键样式内联，先于外链 CSS 生效：背景色 + 首屏 loading 遮罩，
            避免 PWA 冷启动/加载时的白屏与空屏 */}
        <style dangerouslySetInnerHTML={{ __html: criticalCss }} />
        <HeadContent />
      </head>
      <body>
        {/* 首屏 loading 遮罩：随 HTML 立即渲染，应用挂载后淡出（见 AppReady） */}
        <div id="app-loader" aria-hidden="true">
          <div className="dr-ring" />
          <div className="dr-word">红利雷达</div>
          <div className="dr-sub">正在加载行情…</div>
        </div>
        <AppReady />
        <div className="min-h-screen">
          <header className="site-header sticky top-0 z-30 border-b border-border backdrop-blur">
            <div className="page-wrap flex h-16 items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <Link
                  to="/"
                  className="display-title flex items-center gap-2 text-lg font-bold text-foreground"
                >
                  <Gauge className="size-5 text-[var(--lagoon-deep)]" />
                  红利雷达
                </Link>
                <nav className="hidden items-center gap-5 md:flex">
                  {navItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      activeOptions={{ exact: item.exact }}
                      className="nav-link text-sm font-medium"
                      activeProps={{
                        className: 'nav-link is-active text-sm font-medium',
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
              <ThemeToggle />
            </div>
            <nav className="page-wrap flex items-center gap-5 pb-3 md:hidden">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.exact }}
                  className="nav-link text-sm font-medium"
                  activeProps={{
                    className: 'nav-link is-active text-sm font-medium',
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>

          <main className="page-wrap py-8">{children}</main>

          <footer className="site-footer mt-8">
            <div className="page-wrap py-6 text-xs text-muted-foreground">
              数据来源于公开网络（东方财富 / 腾讯行情 /
              红利查等），股息率与估值区间为参考值，
              净值为实时抓取。本站仅供学习研究，不构成任何投资建议。
            </div>
          </footer>
        </div>

        <ServiceWorkerRegistrar />
        <Toaster richColors position="top-center" />
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

/** 首屏 loading 遮罩样式 + 关键背景色，内联在 <head>，先于外链 CSS 生效。 */
const criticalCss = `
html{background-color:#f5f6f8}
html.dark{background-color:#0b0e12}
#app-loader{position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background-color:#f5f6f8;transition:opacity .35s ease,visibility .35s ease;animation:dr-loader-failsafe 0s linear 12s forwards}
html.dark #app-loader{background-color:#0b0e12}
#app-loader .dr-ring{width:40px;height:40px;border-radius:9999px;border:3px solid rgba(51,65,85,.16);border-top-color:#334155;animation:dr-spin .7s linear infinite}
html.dark #app-loader .dr-ring{border-color:rgba(226,232,240,.16);border-top-color:#e2e8f0}
#app-loader .dr-word{font-family:system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;font-size:16px;font-weight:700;letter-spacing:.14em;color:#1f2937}
html.dark #app-loader .dr-word{color:#e5e7eb}
#app-loader .dr-sub{font-family:system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;font-size:12px;letter-spacing:.04em;color:#64748b}
html.app-ready #app-loader{opacity:0;visibility:hidden;pointer-events:none}
@keyframes dr-spin{to{transform:rotate(360deg)}}
@keyframes dr-loader-failsafe{to{opacity:0;visibility:hidden}}
@media(prefers-reduced-motion:reduce){#app-loader .dr-ring{animation-duration:1.6s}}
`

/** 应用挂载后给 <html> 加 app-ready 类，触发首屏遮罩淡出。 */
function AppReady() {
  useEffect(() => {
    const el = document.documentElement
    const id = requestAnimationFrame(() => el.classList.add('app-ready'))
    return () => cancelAnimationFrame(id)
  }, [])
  return null
}

/** 客户端注册 Service Worker，启用 PWA 离线能力。 */
function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    if (import.meta.env.DEV) return
    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
    if (document.readyState === 'complete') register()
    else window.addEventListener('load', register, { once: true })
  }, [])
  return null
}
