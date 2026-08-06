# Sen · 3D 个人简历

**简体中文** · [English](README.en.md)

一个基于 React Three Fiber + TypeScript 的滚动式 3D 个人简历示例。页面由一段固定的 3D 背景（人物模型 + 相机动画）和前端可滚动的 HTML 内容组成，便于展示履历与作品集。

**在线演示**：[https://joe-mama-wu.github.io/Joe-3D-Resume/](https://joe-mama-wu.github.io/Joe-3D-Resume/)

**快速概览**：前端代码在 [web/](web)，主要入口为 [web/src/App.tsx](web/src/App.tsx)。开发、构建与部署都在 `web/` 目录下进行。

**权限与素材说明**：代码遵循 MIT 许可（见 [LICENSE](LICENSE）），但人物模型、简历内容、图片与 logo 属于作者个人内容，不在 MIT 范围，fork 后请替换为你自己的素材（详情见 [NOTICE](NOTICE)）。

## 快速开始

在项目根目录运行：

```bash
cd web
npm ci
npm run dev    # 本地开发： http://localhost:5173
```

构建发布版：

```bash
cd web
npm run build  # 输出到 web/dist/
npm run preview
```

查看 package 和脚本： [web/package.json](web/package.json)

## 目录与修改点速查

- 前端代码： [web/](web)
- 场景与渲染： [web/src/scene/Scene.tsx](web/src/scene/Scene.tsx)
- 履历内容： [web/src/ui/Resume.tsx](web/src/ui/Resume.tsx)
- 作品列表： [web/src/data/works.ts](web/src/data/works.ts)
- 单个作品详情： [web/src/content/works/*.md](web/src/content/works)

一般改动只需修改上述数据文件或替换 `web/public/models/me.glb`。

## 部署到 GitHub Pages（自动化）

我已添加一个 GitHub Actions 工作流（.github/workflows/deploy.yml），用于在推送到 `main` 分支时自动构建并将 `web/dist` 发布到 `gh-pages` 分支。部署流程：

- 将改动推送到 `main`（或你在 workflow 中配置的分支），Actions 会在构建成功后把 `web/dist` 推到 `gh-pages`。
- 在 GitHub 仓库中打开 Settings → Pages，选择 `gh-pages` 分支作为发布源（根目录），保存后等待页面生效（通常几分钟）。

手动构建并检测：

```bash
cd web
npm run build
npx serve web/dist   # 或用任何静态服务器预览 dist
```

如果你更喜欢用其它方式（Netlify、Vercel、对象存储），`web/dist` 是标准静态站点目录，直接上传即可。

## 我为你做了什么

- 改写并精简了 `README.md` 以便新用户快速上手。
- 添加了 GitHub Actions 工作流以实现自动发布到 GitHub Pages（文件位置：`.github/workflows/deploy.yml`）。

## 下一步建议

- 确认仓库默认分支为 `main`（或在 workflow 中把触发分支改为你的默认分支）。
- 将仓库推送到 GitHub，检查 Actions 是否触发并成功完成构建与部署。
- 在仓库 Settings → Pages 中选择 `gh-pages` 分支作为发布源。

如果你需要，我可以：生成并提交 workflow（我已经添加），或帮你调整 workflow 的触发分支。

---

## 技术栈

React 18 · TypeScript · @react-three/fiber · three · Vite
