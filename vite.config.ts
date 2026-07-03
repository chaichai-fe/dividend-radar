import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

const config = defineConfig({
  server: {
    watch: {
      // 忽略 .wrangler(miniflare 本地状态/缓存)与构建产物，
      // 否则 caches.default 写缓存会改动 .wrangler 下的 sqlite 文件，
      // 触发 Vite 反复 page reload → 反复重新请求接口的死循环。
      ignored: ['**/.wrangler/**', '**/dist/**'],
    },
  },
  plugins: [
    devtools(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tailwindcss(),
    tanstackStart(),
    viteReact({
      babel: {
        plugins: [['babel-plugin-react-compiler', { target: '19' }]],
      },
    }),
  ],
})

export default config
