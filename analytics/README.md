# 网站访问记录（Cloudflare Worker + D1）

记录谁访问了作品集网站：**IP、城市、所属网络 / 机构、设备、从哪里点进来，以及依次看了哪些板块和作品**。数据存在你自己 Cloudflare 账号下的免费 D1 数据库里，通过一个带密码的网页查看。

```
网页（GitHub Pages） ──sendBeacon──▶ Worker /hit ──▶ D1 数据库
                                     Worker /    ◀── 你（输入密码查看）
```

- 免费额度：每天 10 万次请求，个人网站完全够用
- 记录保留 180 天，每天自动清理（`wrangler.toml` 里的 `RETENTION_DAYS`）
- 网页端代码在 `web/src/analytics.ts`；未配置地址时完全不发送

## 部署（一次性，约 10 分钟）

需要先注册一个免费的 [Cloudflare](https://dash.cloudflare.com/sign-up) 账号。以下命令都在 `analytics/` 目录里运行。

```bash
cd analytics
npm install

# 1. 登录 Cloudflare（会打开浏览器授权）
npx wrangler login

# 2. 创建数据库，把输出里的 database_id 填进 wrangler.toml
npx wrangler d1 create portfolio-visits

# 3. 建表
npm run db:init

# 4. 设置查看页密码（输入时不显示）
npx wrangler secret put ADMIN_PASSWORD

# 5. 部署，记下输出的地址，例如 https://portfolio-analytics.<你的子域>.workers.dev
npm run deploy
```

首次部署时 wrangler 可能会让你给账号起一个 `workers.dev` 子域名，按提示完成即可。

然后让网站开始发送记录：

1. 把第 5 步的地址填进 `web/.env.production`：
   ```
   VITE_ANALYTICS_URL=https://portfolio-analytics.<你的子域>.workers.dev
   ```
2. commit + push，GitHub Actions 重新部署网站后就开始记录。

## 查看

浏览器打开 Worker 地址（第 5 步的地址），用户名随便填，密码是第 4 步设置的。

- 顶部切换 24h / 7d / 30d / 180d，`Show bots` 显示爬虫访问，`CSV` 导出原始记录
- 点 IP 会在 ipinfo.io 打开该 IP 的详细信息

## 排除你自己的访问

在你自己的每台设备 / 浏览器上打开一次：

```
https://joe-mama-wu.github.io/Joe-3D-Resume/?notrack=1
```

之后这个浏览器的访问都不会记录（存在 localStorage 里）；`?notrack=0` 恢复。本地开发（localhost）默认也不会发往线上 Worker。

## 需要知道的

- **IP 能看出的信息有限**：多数人用家庭宽带 / 手机流量，只会显示 Rogers、Bell 这类运营商；只有对方在公司 / 学校网络里打开，才会显示机构名。VPN、iCloud 私人中继显示的是代理的 IP。
- **只统计执行了 JavaScript 的访问**，大部分爬虫不会出现；剩下的按 User-Agent 标为 bot，默认隐藏。
- **隐私**：IP 属于个人信息。开启后网站作品区末尾会显示一句说明（`Works.tsx` 里的 `wk-privacy`）；如果改了保留天数，记得同步改那句话。
- 修改代码后重新部署：`npm run deploy`。

## 本地调试

```bash
cp .dev.vars.example .dev.vars      # 本地密码 dev，允许 http://localhost:5173
npm run db:init:local
npm run dev                         # Worker 跑在 http://localhost:8787

# 另一个终端：让本地网站发往本地 Worker
cd ../web
VITE_ANALYTICS_URL=http://localhost:8787 npm run dev
```
