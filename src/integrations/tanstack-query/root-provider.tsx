import { QueryClient } from '@tanstack/react-query'

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // 只允许手动刷新：关闭所有自动重取触发条件，数据永不自动过期。
        // 页面切换/窗口聚焦/断网重连都不会重新请求，只有点击“刷新”按钮
        // (query.refetch) 或增删持仓后的手动失效(invalidateQueries)才会更新。
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        retry: 1,
      },
    },
  })

  return {
    queryClient,
  }
}
export default function TanstackQueryProvider() {}
