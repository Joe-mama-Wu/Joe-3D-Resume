# About Sen · 3D Personal Résumé

[简体中文](README.md) · **English**

A scroll-driven personal 3D résumé built on **React Three Fiber**.

<h3 align="center">
  🔗 <a href="https://dayinji.github.io/sen-3d-resume/">Open the Live Demo →</a>
</h3>

> 💡 **Don't want to write code or fiddle with a toolchain?** Try [intro3d.com](https://intro3d.com): a no-code DIY platform for 3D personal homepages, beginner-friendly, that handles building and deployment in one place. It lacks this project's eye-follows-cursor interaction but is otherwise fairly complete. Want a similar 3D résumé fast? It's the quicker route; want full control and deep customization? Use this repo's source.

## Open-source terms (read this first)

- The **code** is under the **MIT** license, see [`LICENSE`](LICENSE) — you're welcome to study, reuse, and build on it.
- The **personal content and assets** (name / character model / résumé / works copy / brand logos / social links) are **not covered by MIT** and remain the author's copyright. Replace them with your own after forking; see [`NOTICE`](NOTICE).

## Repo layout

```
web/       front-end app (React Three Fiber + TypeScript, see below)
blender/   3D scene source sen.blend (character + camera animation + focus anchors)
tutor/     fork-it tutorials (deploy, stickers, …)
CLAUDE.md AGENTS.md          conventions for AI coding assistants
README.md README.en.md       docs (简体中文 / English)
LICENSE NOTICE               license & content notice
```

The whole front-end app lives under [`web/`](web). **Every code / asset path below is relative to `web/`** (e.g. `src/App.tsx` means `web/src/App.tsx`), and npm commands run inside `web/`.

## Run

```bash
cd web
npm install
npm run dev        # dev at http://localhost:5173
npm run build      # type-check + bundle, output to dist/
npm run preview    # preview the build output
npm run typecheck  # type-check only (tsc -b)
npm run lint       # ESLint
```

## Architecture overview

A pure front-end SPA, no backend and no router: `index.html` → `src/main.tsx` → `src/App.tsx` (one fixed `<Canvas>` 3D background + a scrollable HTML overlay).

- **3D background**: `App.tsx` currently renders `src/scene/Scene.tsx` (the `me.glb` character + scroll-driven camera / eye-follow).
- **Scroll content**: `Hero` (About, inside `App.tsx`) → `src/ui/Resume.tsx` (résumé timeline) → `src/ui/Works.tsx` (horizontal works gallery).
- **Overlays**: `LoadingScreen` (loading mask), `NoiseOverlay` (film grain), scroll-darken / frosted right rail / hero decorative frame, etc.
- **Global state**: `src/store.ts` (zustand, lightweight).

## Data-driven: where to change content

Content and presentation are separated; changing content mostly means editing data files:

| What you want to change | Where |
| --- | --- |
| Résumé (education / experience / clients / social links) | `src/ui/Resume.tsx` |
| Works sections and work list | `src/data/works.ts` |
| A single work's detail body | `src/content/works/<slug>.md` (frontmatter + markdown; format in `src/data/workDocs.ts`, example in `src/content/works/example.md`) |
| Hero About copy | `COPY` in `src/App.tsx` |

Work details use minimal markdown: one `.md` per work, linked via the `slug` on each item in `works.ts`; a work without a `slug` falls back to the placeholder detail. Put media (images / videos) under `public/works/` and reference them with `/works/...` absolute paths.

## Directory structure

```
web/                     front-end app (paths below are inside web/)
  src/
    App.tsx              Canvas + scroll-content assembly, hero About, loading/overlays
    main.tsx             entry
    store.ts             global interaction state (zustand)
    data/
      works.ts           works sections / work list (the works data source)
      workDocs.ts        build-time inlining of content/works/*.md + frontmatter parsing
    content/works/       work-detail markdown; includes example.md template. Drop in <slug>.md (slug matches works.ts) to render a full detail, otherwise a shared placeholder shows
    scene/
      Scene.tsx          3D scene: me.glb character + glb camera animation + scroll-driven / eye-follow
      Env.tsx            env.hdr environment lighting (IBL)
    ui/
      Resume.tsx         résumé timeline (holds personal data)
      Works.tsx          horizontal works gallery + detail modal
      LoadingScreen.tsx / NoiseOverlay.tsx / SocialIcons.tsx / ZooopLogo.tsx
  public/
    models/  fonts/  images/  textures/   static assets
  scripts/compress-media.sh                media compression script (ffmpeg, in place)
blender/sen.blend        3D scene source (export web/public/models/me.glb after editing)
tutor/                   fork-it tutorials (deploy, stickers, …)
```

## Assets & media (important)

- **Work details are placeholders by default.** The open-source version ships without the author's work details or media: the works gallery keeps each section / work **title**, and opening a detail shows a shared placeholder (change `detailPlaceholder` in `works.ts`). To fill one in, write frontmatter + markdown in `src/content/works/<slug>.md` (slug matches the item's `slug` in `works.ts`), put media under `public/works/` referenced via `/works/...`, and it renders as a full detail.
- **`public/works/` is not tracked by git by default** (large and personal, see `.gitignore`) — only the 4 section covers `public/works/covers/*.jpg` are kept; place other media yourself or serve via a CDN.
- Assets in `public/models/`, `public/images/`, `public/textures/`, `public/fonts/` are tracked. Among them the character model, brand logos, and images are personal content (see `NOTICE`); fonts / HDR are third-party — check their licenses before reuse.
- `scripts/compress-media.sh` uses ffmpeg to compress images / videos under `public` in place (max width 1920, H.264 video ~2Mbps), overwriting only when it comes out smaller.

## Swapping the character model (glb conventions)

To use your own character, replace `public/models/me.glb` (its source is `blender/sen.blend` at the repo root — edit it in Blender and export a glb over it), or rewrite `src/scene/Scene.tsx` with your own scene. The code looks these up in the glb **by object name**; whatever is missing, that feature breaks:

- **Camera + camera-animation clip named `CameraAction`** — the scroll-driven camera path; its total frame count is read at runtime (24fps), not hardcoded.
- **`focus-start`** (or `focus-0`) — the hero's starting focus anchor (an empty); both names accepted.
- **The timeline focus anchors** (empties, one per résumé entry) — listed in order in **`src/data/focusPoints.ts`** (`FOCUS_POINTS`, the single source of truth shared by `Scene.tsx` and `Resume.tsx`). The count is **dynamic**: change this list + `Resume.tsx`'s entries together and the node count / frame ranges adapt. This repo ships `focus-1 / focus-2 / focus-3 / focus-4 / focus-5` (the hero anchor uses `focus-0`).
- **`focus-works`** — the works-section focus anchor (an empty); optional — if absent, the works section reuses the last timeline anchor.
- **A mesh whose name contains `eye`** — the eyes (eye-follows-cursor).
- **Camera frame convention** (when authoring `CameraAction`): frame `0` = hero (`focus-start`); frame `50·k` = the k-th timeline node; the **last frame** = works (`focus-works`). Nodes are 50 frames apart; the tail from the last node to the last frame is the works segment (any length).

## Build & deploy

```bash
npm run build    # → dist/
```

`vite.config.ts` sets `base: './'`, so output uses relative paths — `dist/` opens by double-click and can live in any subdirectory (e.g. deployed to `example.com/portfolio/`). At runtime public assets are joined with `import.meta.env.BASE_URL`. Deploying is just uploading `dist/` to any static host (Netlify / Vercel / GitHub Pages / object storage / your own server).

## Scene parameters

Every tunable in the scene (lights / camera / depth-of-field / Bloom / character position / background gradient, etc.) is a **plain constant** at the top of each component in `src/scene/Scene.tsx`. To change the default look, edit those constant values directly — no panel or extra config file needed.

## Tech stack

React 18 · TypeScript · @react-three/fiber · @react-three/drei · @react-three/postprocessing · three · framer-motion · zustand · Vite
