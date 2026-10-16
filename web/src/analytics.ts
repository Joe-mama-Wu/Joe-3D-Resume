// 访问记录（可选）：进入网站、打开板块 / 作品时，把事件发到自建的 Cloudflare Worker（见仓库根目录 analytics/）。
// 以下情况不发送：
//   - 未配置 VITE_ANALYTICS_URL（fork 后默认关闭）
//   - 本地开发页面发往线上 Worker（避免自己调试污染数据；本地 Worker 调试时照常发送）
//   - 本机访问过 ?notrack=1（写入 localStorage，?notrack=0 恢复），用来排除自己的访问

const ENDPOINT = import.meta.env.VITE_ANALYTICS_URL?.replace(/\/+$/, '')

export const analyticsEnabled = Boolean(ENDPOINT)

const isLocal = (host: string) => host === 'localhost' || host === '127.0.0.1'

function optedOut(): boolean {
  try {
    const flag = new URLSearchParams(window.location.search).get('notrack')
    if (flag === '1') window.localStorage.setItem('notrack', '1')
    if (flag === '0') window.localStorage.removeItem('notrack')
    return window.localStorage.getItem('notrack') === '1'
  } catch {
    return false
  }
}

// 同一个标签页内保持不变，用于把一次访问里的多次浏览串起来
function sessionId(): string {
  const fresh = () => Math.random().toString(36).slice(2) + Date.now().toString(36)
  try {
    let id = window.sessionStorage.getItem('sid')
    if (!id) {
      id = fresh()
      window.sessionStorage.setItem('sid', id)
    }
    return id
  } catch {
    return fresh()
  }
}

// '#/work/orca-robotic-hand' → '/work/orca-robotic-hand'；首页为 '/'
const currentPath = () => window.location.hash.replace(/^#/, '') || '/'

function send(path: string, session: string, referrer?: string) {
  const body = JSON.stringify({ path, session, referrer })
  // text/plain 属于「简单请求」，跨域不触发预检；sendBeacon 在页面关闭时也能发出
  const blob = new Blob([body], { type: 'text/plain' })
  if (!navigator.sendBeacon?.(`${ENDPOINT}/hit`, blob)) {
    fetch(`${ENDPOINT}/hit`, { method: 'POST', body, mode: 'no-cors', keepalive: true }).catch(() => {})
  }
}

export function startAnalytics() {
  if (!ENDPOINT) return
  if (isLocal(window.location.hostname) && !isLocal(new URL(ENDPOINT).hostname)) return
  if (optedOut()) return

  const session = sessionId()
  const seen = new Set([currentPath()])
  send(currentPath(), session, document.referrer || undefined)

  // 之后只记打开板块 / 作品，且同一页面每次访问只记一次
  // （关详情时 history.back() 会回到 #/project/…，不应算作再次浏览）
  window.addEventListener('hashchange', () => {
    const path = currentPath()
    if (seen.has(path) || !(path.startsWith('/work/') || path.startsWith('/project/'))) return
    seen.add(path)
    send(path, session)
  })
}
