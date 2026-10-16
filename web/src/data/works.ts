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
//   layout    'grid' = 缩略图网格（默认缩略图 public/works/<slug>/thumb.jpg，可用 item.thumb 覆盖；
//             item.preview 为悬停播放的静音视频）；缺省为文字清单
//   awards[]  奖项 chip（可选）
//   footer    底部技术/备注一行（可选）

export interface WorkListItem {
  name: string
  meta?: string
  tags?: string[]
  link?: string
  slug?: string
  thumb?: string
  preview?: string
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
  layout?: 'list' | 'grid'
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
  copyLinkLabel: string
  copiedLabel: string
  countLabel: (n: number) => string
  sections: WorkSection[]
}

// public/works/ 下资源的完整路径（拼 BASE_URL，子目录部署可用）
const work = (path: string) => `${import.meta.env.BASE_URL}works/${path}`

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
  copyLinkLabel: 'Copy link',
  copiedLabel: 'Link copied',
  countLabel: (n) => `${n} works`,
  sections: [
    {
      id: 'robotics',
      no: '01',
      title: 'Robotics',
      tagline: 'Dexterous hands & industrial arms',
      layout: 'grid',
      items: [
        {
          name: 'ORCA Dexterous Hand',
          meta: 'VLA / RL Prototype',
          slug: 'orca-robotic-hand',
          thumb: work('orca-robotic-hand/cover.jpg'),
          preview: work('orca-robotic-hand/cube-picking.mp4'),
        },
        {
          name: 'FANUC ROBOGUIDE Cell',
          meta: 'Industrial Robotics',
          slug: 'fanuc-roboguide',
          preview: work('fanuc-roboguide/demo.mp4'),
        },
      ],
      footer: 'MuJoCo · Franka Panda · Teleoperation · 3D printing · FANUC ROBOGUIDE',
    },
    {
      id: 'vision',
      no: '02',
      title: 'Computer Vision',
      tagline: 'Detection, tracking & lane finding',
      layout: 'grid',
      items: [
        {
          name: 'DeepSORT Multi-Object Tracking',
          meta: 'Multi-Object Tracking',
          slug: 'deepsort-mot',
          preview: work('deepsort-mot/demo.mp4'),
        },
        {
          name: 'ByteTrack Multi-Object Tracking',
          meta: 'Multi-Object Tracking',
          slug: 'bytetrack-mot',
          preview: work('bytetrack-mot/demo.mp4'),
        },
        {
          name: 'SiamFC Single-Object Tracking',
          meta: 'Single-Object Tracking',
          slug: 'siamfc-sot',
          preview: work('siamfc-sot/demo.mp4'),
        },
        {
          name: 'YOLO Traffic Light Detection',
          meta: 'Detection',
          slug: 'yolo-traffic-light',
          preview: work('yolo-traffic-light/demo.mp4'),
        },
        {
          name: 'Lane Keep Assist',
          meta: 'ADAS',
          slug: 'lane-keep-assist',
          preview: work('lane-keep-assist/demo.mp4'),
        },
      ],
      footer: 'OpenCV · YOLO · DeepSORT · ByteTrack · SiamFC · Hough transform',
    },
    {
      id: 'perception',
      no: '03',
      title: 'Perception & SLAM',
      tagline: 'Depth, LiDAR & mapping',
      layout: 'grid',
      items: [
        { name: 'Stereo Depth & Point Cloud', meta: 'Stereo Vision', slug: 'stereo-camera' },
        { name: 'LiDAR Perception', meta: 'Sensor Bring-up', slug: 'lidar-perception' },
        { name: 'Gazebo SLAM Mapping', meta: 'Simulation', slug: 'gazebo-slam' },
      ],
      footer: 'ROS · RViz · Gazebo · slam_gmapping · Docker',
    },
    {
      id: 'mechanical',
      no: '04',
      layout: 'grid',
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
      no: '05',
      layout: 'grid',
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
      no: '06',
      layout: 'grid',
      title: 'Applications',
      tagline: 'Top Shelf Distillers',
      items: [{ name: 'TSDSale', meta: 'Internal Sales App', slug: 'tsdsale' }],
    },
    {
      id: 'web',
      no: '07',
      layout: 'grid',
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

// 按 slug 找作品（详情页独立链接 #/work/<slug> 用）
export function findWorkBySlug(sections: WorkSection[], slug: string): WorkListItem | null {
  for (const s of sections) {
    const hit = s.items?.find((it) => it.slug === slug)
    if (hit) return hit
  }
  return null
}

// 缩略图网格用：item.thumb 优先，否则约定 public/works/<slug>/thumb.jpg
export function itemThumb(item: WorkListItem): string | undefined {
  return item.thumb || (item.slug ? work(`${item.slug}/thumb.jpg`) : undefined)
}
