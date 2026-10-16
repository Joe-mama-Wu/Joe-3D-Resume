-- 访问记录表：一行 = 一次页面事件（进入网站 / 打开某个板块或作品）
CREATE TABLE IF NOT EXISTS hits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,          -- 时间（Unix 毫秒）
  session TEXT NOT NULL,        -- 浏览器会话 id（同一次访问内不变，关掉标签页即换新）
  path TEXT NOT NULL,           -- '/'、'/project/<id>' 或 '/work/<slug>'
  referrer TEXT,                -- 从哪个站点点进来（仅首条事件带）
  ip TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  asn INTEGER,
  org TEXT,                     -- IP 所属网络 / 机构（Cloudflare 的 asOrganization）
  ua TEXT,                      -- 浏览器 User-Agent
  bot INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS hits_ts ON hits (ts);
CREATE INDEX IF NOT EXISTS hits_session ON hits (session);
