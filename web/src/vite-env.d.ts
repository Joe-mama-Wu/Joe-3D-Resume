/// <reference types="vite/client" />

interface ImportMetaEnv {
  // 访问记录 Worker 的地址（见仓库根目录 analytics/）；留空则不记录
  readonly VITE_ANALYTICS_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
