// 作品集数据（双语）。5 大板块 → 点击展开作品详情。
// 纯数据驱动：增删板块 / 作品只改本文件，Works.jsx 仅负责渲染。
//
// 板块字段：
//   id        唯一标识（用于 framer layoutId 共享元素动画）
//   no        编号 '01'…'05'
//   title     板块标题
//   tagline   索引行右侧一句话
//   items[]   扁平作品列表：{ name, meta?, tags?, link? }
//             点击 item 弹出全屏详情，可补充可选媒体/文案字段：
//             { image?, video?, year?, desc? }（缺省时媒体用占位、简介回退 meta/标签）
//   groups[]  分组作品（与 items 二选一）：{ heading, items: string[] }
//   awards[]  奖项 chip（可选）
//   footer    底部技术/备注一行（可选）

export interface WorkListItem {
  name: string
  meta?: string
  tags?: string[]
  link?: string
  slug?: string
}

export interface WorkGroup {
  heading: string
  items: string[]
}

export interface WorkSection {
  id: string
  no: string
  title: string
  tagline: string
  items?: WorkListItem[]
  groups?: WorkGroup[]
  awards?: string[]
  footer?: string
}

export interface WorksLang {
  title: string
  closeLabel: string
  openLabel: string
  hint: string
  awardsLabel: string
  visitLabel: string
  detailPlaceholder: string
  phImageLabel: string
  phButtonLabel: string
  countLabel: (n: number) => string
  sections: WorkSection[]
}

const worksCopy: WorksLang = {
  title: 'Works',
  closeLabel: 'Back',
  openLabel: 'Explore',
  hint: 'Keep scrolling',
  awardsLabel: 'Awards',
  visitLabel: 'Visit site',
  detailPlaceholder: 'Your work description',
  phImageLabel: 'Image / Video',
  phButtonLabel: 'Link button',
  countLabel: (n) => `${n} works`,
  sections: [
    {
      id: 'mechanical',
      no: '01',
      title: 'Mechanical Design',
      tagline: 'UAV landing gear system',
      items: [
        { name: 'Front Landing Gear', meta: 'CAD Assembly', slug: 'uav-front-landing' },
        { name: 'Oleo Strut', meta: 'CAD Assembly', slug: 'uav-oleo-strut' },
        { name: 'Gear Box Assembly', meta: 'CAD Assembly', slug: 'uav-gearbox' },
        { name: 'Additional Renders', meta: 'Renders', slug: 'uav-renders' },
      ],
      footer: 'SOLIDWORKS · eDrawings · CNC machining · 3D printing',
    },
    {
      id: 'architectural',
      no: '02',
      title: 'Architectural Design',
      tagline: '3D rendering & CAD',
      items: [
        { name: 'Kitchen 3D Rendering', meta: 'Rendering', slug: 'kitchen-rendering' },
        { name: 'Living Room 3D Rendering', meta: 'Rendering', slug: 'living-room-rendering' },
        { name: 'Dining Hall 3D Rendering', meta: 'Rendering', slug: 'dining-hall-rendering' },
        { name: 'SketchUp Showcase', meta: 'Modeling', slug: 'sketchup-showcase' },
        { name: 'SketchUp Interior Design', meta: 'Modeling', slug: 'sketchup-interior' },
        { name: 'AutoCAD Showcase', meta: 'Drafting', slug: 'autocad-showcase' },
      ],
      footer: 'SketchUp · AutoCAD · 3D rendering',
    },
    {
      id: 'applications',
      no: '03',
      title: 'Applications',
      tagline: 'Top Shelf Distillers',
      items: [{ name: 'TSDSale', meta: 'Internal Sales App', slug: 'tsdsale' }],
    },
    {
      id: 'web',
      no: '04',
      title: 'Web Development',
      tagline: 'Top Shelf Distillers',
      items: [
        {
          name: 'Navigation',
          meta: 'Web Development',
          link: 'https://topshelfdistillers.com/',
          slug: 'web-navigation',
        },
        {
          name: 'Checkout',
          meta: 'Web Development',
          link: 'https://topshelfdistillers.com/cart',
          slug: 'web-checkout',
        },
      ],
      footer: 'ERP integration · SQL · UI collaboration',
    },
  ],
}
export const WORKS: Record<'zh' | 'en', WorksLang> = { zh: worksCopy, en: worksCopy }

// 板块配图（横向画廊每张卡片左侧的整高封面）。放到 public/works/covers/ 下。
// 缺图时左栏用大编号渐变占位，放入图片后自动点亮。
export const SECTION_COVERS: Record<string, string> = {
  mechanical: `${import.meta.env.BASE_URL}works/covers/mechanical.jpg`,
  architectural: `${import.meta.env.BASE_URL}works/covers/architectural.jpg`,
  applications: `${import.meta.env.BASE_URL}works/covers/applications.png`,
  web: `${import.meta.env.BASE_URL}works/covers/web.png`,
}

// 统计一个板块的作品数（items 或 groups 求和），用于索引行 hover 显示
export function sectionCount(section: WorkSection): number {
  if (section.items) return section.items.length
  if (section.groups) return section.groups.reduce((n, g) => n + g.items.length, 0)
  return 0
}
