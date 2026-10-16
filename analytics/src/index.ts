// 网站访问记录 Worker
//   POST /hit   网页发来的访问事件（sendBeacon，text/plain JSON）→ 补上 IP / 地理 / 网络机构后写入 D1
//   GET  /      带密码（HTTP Basic Auth）的查看页：按访问会话汇总；?days=7 &bots=1 &format=csv
//   cron        每天删除超过 RETENTION_DAYS 的记录

export interface Env {
  DB: D1Database
  ADMIN_PASSWORD?: string
  ALLOWED_ORIGINS: string
  TIMEZONE?: string
  RETENTION_DAYS?: string
}

const DAY = 86_400_000
const BOT_UA =
  /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|embedly|curl|wget|python|httpclient|go-http|java\//i

export default {
  async fetch(req, env) {
    const url = new URL(req.url)
    if (url.pathname === '/hit') {
      return req.method === 'POST' ? recordHit(req, env) : new Response(null, { status: 405 })
    }
    if (url.pathname === '/' && req.method === 'GET') return viewer(req, env, url)
    return new Response('Not found', { status: 404 })
  },

  async scheduled(_event, env) {
    const days = Number(env.RETENTION_DAYS) || 180
    await env.DB.prepare('DELETE FROM hits WHERE ts < ?1').bind(Date.now() - days * DAY).run()
  },
} satisfies ExportedHandler<Env>

// ---------- 记录 ----------

const clip = (v: unknown, max: number): string | null =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null

async function recordHit(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') ?? ''
  const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
  if (!allowed.includes(origin)) return new Response(null, { status: 403 })

  const text = await req.text()
  if (text.length > 2000) return new Response(null, { status: 413 })
  let body: Record<string, unknown>
  try {
    body = JSON.parse(text)
  } catch {
    return new Response(null, { status: 400 })
  }

  const path = clip(body.path, 200) ?? '/'
  if (!/^\/[\w\-/]*$/.test(path)) return new Response(null, { status: 400 })
  // 站内跳转不算来源
  let referrer = clip(body.referrer, 300)
  if (referrer && referrer.startsWith(origin)) referrer = null

  const cf = (req.cf ?? {}) as Partial<IncomingRequestCfProperties>
  const ua = (req.headers.get('User-Agent') ?? '').slice(0, 400)
  await env.DB.prepare(
    `INSERT INTO hits (ts, session, path, referrer, ip, country, region, city, asn, org, ua, bot)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`,
  )
    .bind(
      Date.now(),
      clip(body.session, 64) ?? 'unknown',
      path,
      referrer,
      req.headers.get('CF-Connecting-IP'),
      cf.country ?? null,
      cf.region ?? null,
      cf.city ?? null,
      cf.asn ?? null,
      cf.asOrganization ?? null,
      ua,
      BOT_UA.test(ua) ? 1 : 0,
    )
    .run()
  return new Response(null, { status: 204 })
}

// ---------- 查看页 ----------

async function authorized(req: Request, password: string): Promise<boolean> {
  const header = req.headers.get('Authorization') ?? ''
  if (!header.startsWith('Basic ')) return false
  let given = ''
  try {
    given = atob(header.slice(6)).split(':').slice(1).join(':')
  } catch {
    return false
  }
  // 先各自哈希成等长再做恒定时间比较
  const enc = new TextEncoder()
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(given)),
    crypto.subtle.digest('SHA-256', enc.encode(password)),
  ])
  return crypto.subtle.timingSafeEqual(a, b)
}

interface SessionRow {
  session: string
  first: number
  last: number
  ip: string | null
  country: string | null
  region: string | null
  city: string | null
  org: string | null
  ua: string | null
  referrer: string | null
  bot: number
  paths: string | null
}

interface HitRow {
  ts: number
  session: string
  path: string
  referrer: string | null
  ip: string | null
  country: string | null
  region: string | null
  city: string | null
  asn: number | null
  org: string | null
  ua: string | null
  bot: number
}

async function viewer(req: Request, env: Env, url: URL): Promise<Response> {
  if (!env.ADMIN_PASSWORD) {
    return new Response('ADMIN_PASSWORD is not set. Run: npx wrangler secret put ADMIN_PASSWORD', { status: 500 })
  }
  if (!(await authorized(req, env.ADMIN_PASSWORD))) {
    return new Response('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Portfolio visits", charset="UTF-8"' },
    })
  }

  const retention = Number(env.RETENTION_DAYS) || 180
  const days = Math.min(retention, Math.max(1, Number(url.searchParams.get('days')) || 7))
  const bots = url.searchParams.get('bots') === '1' ? 1 : 0
  const since = Date.now() - days * DAY
  const where = 'ts >= ?1 AND (?2 = 1 OR bot = 0)'

  if (url.searchParams.get('format') === 'csv') {
    const { results } = await env.DB.prepare(`SELECT * FROM hits WHERE ${where} ORDER BY ts DESC`)
      .bind(since, bots)
      .all<HitRow>()
    return csv(results, days)
  }

  const [summary, sessions, orgs, works] = await env.DB.batch([
    env.DB.prepare(
      `SELECT COUNT(DISTINCT session) AS visitors, COUNT(DISTINCT ip) AS ips,
              SUM(path LIKE '/work/%') AS works FROM hits WHERE ${where}`,
    ).bind(since, bots),
    env.DB.prepare(
      `SELECT session, MIN(ts) AS first, MAX(ts) AS last, MAX(ip) AS ip, MAX(country) AS country,
              MAX(region) AS region, MAX(city) AS city, MAX(org) AS org, MAX(ua) AS ua,
              MAX(referrer) AS referrer, MAX(bot) AS bot, GROUP_CONCAT(path, char(10)) AS paths
       FROM (SELECT * FROM hits WHERE ${where} ORDER BY ts)
       GROUP BY session ORDER BY first DESC LIMIT 500`,
    ).bind(since, bots),
    env.DB.prepare(
      `SELECT COALESCE(org, 'Unknown') AS label, COUNT(DISTINCT session) AS n FROM hits
       WHERE ${where} GROUP BY 1 ORDER BY n DESC LIMIT 8`,
    ).bind(since, bots),
    env.DB.prepare(
      `SELECT substr(path, 7) AS label, COUNT(DISTINCT session) AS n FROM hits
       WHERE ${where} AND path LIKE '/work/%' GROUP BY path ORDER BY n DESC LIMIT 8`,
    ).bind(since, bots),
  ])

  const s = (summary.results[0] ?? {}) as { visitors?: number; ips?: number; works?: number }
  const html = page({
    days,
    bots,
    retention,
    tz: env.TIMEZONE || 'UTC',
    visitors: s.visitors ?? 0,
    ips: s.ips ?? 0,
    workViews: s.works ?? 0,
    sessions: sessions.results as unknown as SessionRow[],
    orgs: orgs.results as { label: string; n: number }[],
    works: works.results as { label: string; n: number }[],
  })
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
    },
  })
}

function csv(rows: HitRow[], days: number): Response {
  const cols: (keyof HitRow)[] = ['ts', 'session', 'path', 'referrer', 'ip', 'country', 'region', 'city', 'asn', 'org', 'ua', 'bot']
  const cell = (v: unknown) => {
    const t = v == null ? '' : String(v)
    return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t
  }
  const lines = [cols.join(',')].concat(
    rows.map((r) => cols.map((c) => cell(c === 'ts' ? new Date(r.ts).toISOString() : r[c])).join(',')),
  )
  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="visits-last-${days}d.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}

// ---------- 渲染 ----------

const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

function device(ua: string | null): string {
  if (!ua) return '—'
  const os = /iPhone|iPad/.test(ua)
    ? /iPad/.test(ua) ? 'iPad' : 'iPhone'
    : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'Other'
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : ''
  return browser ? `${browser} · ${os}` : os
}

function pathChip(p: string): string {
  if (p === '/') return '<span class="chip home">home</span>'
  if (p.startsWith('/project/')) return `<span class="chip proj">${esc(p.slice(9))}</span>`
  if (p.startsWith('/work/')) return `<span class="chip work">${esc(p.slice(6))}</span>`
  return `<span class="chip">${esc(p)}</span>`
}

function host(ref: string | null): string {
  if (!ref) return '<span class="dim">direct</span>'
  try {
    return esc(new URL(ref).hostname.replace(/^www\./, ''))
  } catch {
    return esc(ref.slice(0, 40))
  }
}

function duration(ms: number): string {
  if (ms < 60_000) return ms < 5_000 ? '' : `${Math.round(ms / 1000)}s`
  return `${Math.round(ms / 60_000)} min`
}

function page(d: {
  days: number
  bots: number
  retention: number
  tz: string
  visitors: number
  ips: number
  workViews: number
  sessions: SessionRow[]
  orgs: { label: string; n: number }[]
  works: { label: string; n: number }[]
}): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: d.tz,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const q = (days: number, bots = d.bots) => `?days=${days}${bots ? '&bots=1' : ''}`
  const ranges = [1, 7, 30, d.retention]
    .map((n) => `<a href="${q(n)}" class="${n === d.days ? 'on' : ''}">${n === 1 ? '24h' : `${n}d`}</a>`)
    .join('')
  const list = (rows: { label: string; n: number }[], empty: string) =>
    rows.length
      ? rows.map((r) => `<li><span>${esc(r.label)}</span><b>${r.n}</b></li>`).join('')
      : `<li class="dim">${empty}</li>`

  const rows = d.sessions
    .map((s) => {
      // 连续重复的路径只留一次
      const paths = (s.paths ?? '').split('\n').filter((p, i, a) => p && p !== a[i - 1])
      const place = [s.city, s.region, s.country].filter(Boolean).join(', ')
      const dur = duration(s.last - s.first)
      return `<tr${s.bot ? ' class="bot"' : ''}>
        <td class="nowrap">${esc(fmt.format(s.first))}${dur ? `<div class="dim">${dur}</div>` : ''}</td>
        <td class="nowrap mono">${s.ip ? `<a href="https://ipinfo.io/${encodeURIComponent(s.ip)}" target="_blank" rel="noopener noreferrer">${esc(s.ip)}</a>` : '—'}</td>
        <td>${esc(place || '—')}</td>
        <td>${esc(s.org ?? '—')}</td>
        <td class="nowrap">${esc(device(s.ua))}${s.bot ? ' <span class="chip">bot</span>' : ''}</td>
        <td>${host(s.referrer)}</td>
        <td class="paths">${paths.map(pathChip).join('<span class="arrow">→</span>')}</td>
      </tr>`
    })
    .join('')

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Portfolio visits</title>
<style>
:root { --bg:#16191c; --panel:#1d2124; --ink:#f4f1ea; --muted:rgba(244,241,234,.55); --line:rgba(244,241,234,.12); --accent:#ffd9b3; }
* { box-sizing:border-box; margin:0; }
body { background:var(--bg); color:var(--ink); font:14px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif; padding:32px clamp(16px,4vw,48px) 64px; }
a { color:var(--accent); text-decoration:none; } a:hover { text-decoration:underline; }
header { display:flex; flex-wrap:wrap; align-items:baseline; justify-content:space-between; gap:16px; margin-bottom:24px; }
h1 { font-size:24px; font-weight:600; }
.controls { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.controls a { padding:5px 12px; border:1px solid var(--line); border-radius:999px; color:var(--muted); font-size:12.5px; }
.controls a.on { color:var(--bg); background:var(--accent); border-color:var(--accent); }
.controls a:hover { text-decoration:none; border-color:var(--accent); }
.stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:12px; margin-bottom:12px; }
.stat, .panel { background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:16px 18px; }
.stat b { display:block; font-size:28px; font-weight:600; color:var(--accent); }
.stat span, h2 { font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); font-weight:500; }
.lists { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:12px; margin-bottom:28px; }
.panel ul { list-style:none; padding:0; margin-top:10px; }
.panel li { display:flex; justify-content:space-between; gap:12px; padding:6px 0; border-top:1px solid var(--line); }
.panel li:first-child { border-top:none; }
.table { overflow-x:auto; border:1px solid var(--line); border-radius:12px; background:var(--panel); }
table { border-collapse:collapse; width:100%; min-width:960px; }
th, td { text-align:left; padding:10px 14px; border-top:1px solid var(--line); vertical-align:top; }
th { border-top:none; font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); font-weight:500; }
tr.bot { opacity:.5; }
.nowrap { white-space:nowrap; } .mono { font-family:ui-monospace,Menlo,Consolas,monospace; font-size:12.5px; }
.dim { color:var(--muted); font-size:12px; }
.paths { line-height:2; }
.chip { display:inline-block; padding:1px 9px; border-radius:999px; border:1px solid var(--line); font-size:12px; color:var(--muted); white-space:nowrap; }
.chip.work { color:var(--accent); border-color:rgba(255,217,179,.45); }
.chip.proj { color:var(--ink); }
.arrow { color:var(--muted); margin:0 5px; font-size:11px; }
.empty { padding:40px; text-align:center; color:var(--muted); }
footer { margin-top:16px; color:var(--muted); font-size:12px; }
</style></head>
<body>
<header>
  <h1>Portfolio visits</h1>
  <nav class="controls">${ranges}
    <a href="${q(d.days, d.bots ? 0 : 1)}">${d.bots ? 'Hide bots' : 'Show bots'}</a>
    <a href="${q(d.days)}&amp;format=csv">CSV</a>
  </nav>
</header>
<section class="stats">
  <div class="stat"><b>${d.visitors}</b><span>Visits</span></div>
  <div class="stat"><b>${d.ips}</b><span>Unique IPs</span></div>
  <div class="stat"><b>${d.workViews}</b><span>Project pages opened</span></div>
</section>
<section class="lists">
  <div class="panel"><h2>Top networks / organizations</h2><ul>${list(d.orgs, 'No visits yet')}</ul></div>
  <div class="panel"><h2>Most viewed projects</h2><ul>${list(d.works, 'No project pages opened yet')}</ul></div>
</section>
<div class="table">${
    rows
      ? `<table><thead><tr><th>Time (${esc(d.tz)})</th><th>IP</th><th>Location</th><th>Network / org</th><th>Device</th><th>Came from</th><th>Viewed</th></tr></thead><tbody>${rows}</tbody></table>`
      : '<div class="empty">No visits in this period.</div>'
  }</div>
<footer>One row per visit (browser session). Click an IP for details on ipinfo.io. Records are deleted after ${d.retention} days.</footer>
</body></html>`
}
