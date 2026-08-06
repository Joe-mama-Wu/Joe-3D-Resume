import { motion } from 'framer-motion'
import { ZooopLogo } from './ZooopLogo'
import { SOCIAL_ICONS } from './SocialIcons'
import { FOCUS_POINTS } from '../data/focusPoints'

const SOCIAL_LINKS = [
  { id: 'email', label: 'Email', href: 'mailto:joewukingdom@gmail.com' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/joe-wu-204b4818a/' },
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/joe_wooooo/' },
]

interface ResumeGroup {
  heading?: string
  logo?: string
  logoImg?: string
  sub?: string
  link?: string
  items?: string[]
  links?: { id: string; label: string; href: string }[]
}
interface ResumeEntry {
  period: string
  place: string
  role?: string
  logo?: { src: string; alt: string }
  points?: string[]
  groups?: ResumeGroup[]
}
const resumeCopy: { title: string; entries: ResumeEntry[] } = {
  title: 'Résumé',
  entries: [
    {
      period: 'Sep 2025 – Present',
      place: 'Schaeffler · Chatham, ON',
      role: 'Product Development Engineer · Co-op',
      points: [
        'Robotics Actuation: Developed engineering BOMs for advanced actuation systems (finger/wrist/hip-level mechanisms); prototyped BLDC & coreless motors and linear actuators via CNC + 3D printing (DFM-driven).',
        'Throttle Bodies: Developed CAD designs for EGR throttle bodies and PBW systems; performed 3D reconstruction from CT scans for competitive analysis.',
        'AI Agents & LLM Automation: Designed AI agent workflows to automate acquisition tasks (SOR/SOW extraction, compliance mapping); built PDF → structured JSON pipelines for LLM processing.',
        'Motor Test System: Built a €40K+ equivalent motor test rig from reclaimed components for cogging torque, back-EMF, inductance, acoustic & performance testing.',
        'Data Automation: Developed an automated Python/TDMS pipeline + dashboard, reducing manual analysis time by >80%.',
      ],
      groups: [
        {
          heading: 'Connect',
          links: SOCIAL_LINKS,
        },
      ],
    },
    {
      period: '2023.02 – 2025.04',
      place: "Children's Hospital of Eastern Ontario (CHEO) · Ottawa, ON",
      role: 'Engineering Co-op Student',
      points: [
        'AutoCAD: Restored hospital facilities to architectural drawings following IO CAD Standards, coordinating with outsourcing consultants/construction/technicians.',
        'Energy Planning: Optimized lighting energy efficiency per IES standards, collaborating with an interior designer on fixture layout.',
        'Engineering Drawing: Coordinated with multiple consulting companies; read and interpreted mechanical, floor-plan electrical, and single-line diagrams.',
      ],
    },
    {
      period: '2022.05 – 2022.12',
      place: 'Top Shelf Distillers',
      role: 'Front End Developer · Co-op',
      points: [
        'Led ERP development projects, coordinating multiple functional teams and securing UI designer support.',
        'Gathered authorizations to pull data from a SQL database to deliver an upgraded ERP system meeting sales team requirements.',
      ],
    },
    {
      period: '2020.05 – 2020.08',
      place: 'Guang Zhou Shen Da Metal & Plastic Products · Guangzhou, China',
      role: 'Product Design Internship',
      points: [
        'SOLIDWORKS: Designed metal buttons with SOLIDWORKS and CorelDRAW, ensuring compatibility with existing manufacturing molds.',
        'BOM: Produced bills of material for a single button in SOLIDWORKS and estimated production/material cost in Excel.',
        'Testing: Conducted tensile, impact & abrasion tests; operated injection molding and plating machinery for small-scale production.',
      ],
    },
    {
      period: '2016 – 2024',
      place: 'Education',
      points: [
        'University of Ottawa — B.A.Sc. Mechanical Engineering, GPA 3.3/4.0 (2019–2024)',
        'Huron Heights Secondary School — OSSD, Lieutenant Governor of Ontario Award, GPA 9.5/10 (2017–2019)',
        'Guangzhou Middle School — Guangzhou, China, GPA 8.9/10 (2016–2017)',
      ],
    },
  ],
}
const RESUME: Record<'en' | 'zh', typeof resumeCopy> = { en: resumeCopy, zh: resumeCopy }

// 履历条目依次对应 glb 里的聚焦锚点（相机停靠点），顺序须与 entries 一致。
// 名单是唯一真源，见 data/focusPoints.ts（Scene.tsx 也从那里取）。
const POINT_ORDER = FOCUS_POINTS

const EASE = [0.22, 1, 0.36, 1]
const containerV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
}
const itemV = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
}

function Group({ group }: { group: ResumeGroup }) {
  const heading =
    group.logo === 'zooop' ? (
      <a
        className="zooop-logo-link"
        href={group.link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="ZOOOP"
      >
        <ZooopLogo className="zooop-logo" animated />
      </a>
    ) : group.link ? (
      <a className="about-link" href={group.link} target="_blank" rel="noopener noreferrer">
        {group.heading}
      </a>
    ) : (
      <span>{group.heading}</span>
    )

  return (
    <motion.div className="tl-group" variants={itemV}>
      <div className="tl-group-head">
        {group.logoImg && (
          <span className="tl-group-logo">
            <img src={group.logoImg} alt={group.heading || ''} loading="lazy" />
          </span>
        )}
        {heading}
        {group.sub && <span className="tl-group-sub">{group.sub}</span>}
      </div>
      {group.items && (
        <ul className="tl-points">
          {group.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      )}
      {group.links && (
        <div className="tl-logos">
          {group.links.map((l) => {
            const Icon = SOCIAL_ICONS[l.id as keyof typeof SOCIAL_ICONS]
            return (
              <a
                key={l.id}
                className="tl-logo"
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={l.label}
                title={l.label}
              >
                <Icon />
              </a>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

function Entry({ entry, index }: { entry: ResumeEntry; index: number }) {
  return (
    <motion.div
      className="tl-entry"
      data-point={POINT_ORDER[index]}
      variants={containerV}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
    >
      <motion.span className="tl-dot" variants={itemV} aria-hidden="true" />
      {/* tl-body 包住文字内容（点保持在外做时间轴标记）：移动端可给它加卡片衬底，
          且它紧贴内容高度，不含 tl-entry 用于排布的大 padding。
          用普通 div（非 motion）：framer 变体经 React context 穿透它，叶子元素仍是
          tl-entry 的直接 stagger 子级，入场动画与包裹前完全一致。 */}
      <div className="tl-body">
        <motion.div className="tl-period" variants={itemV}>
          {entry.period}
        </motion.div>
        <motion.div className="tl-head" variants={itemV}>
          {entry.logo && (
            <span className="tl-logo-chip">
              <img src={entry.logo.src} alt={entry.logo.alt} loading="lazy" />
            </span>
          )}
          <h3 className="tl-place">{entry.place}</h3>
        </motion.div>
        {entry.role && (
          <motion.div className="tl-role" variants={itemV}>
            {entry.role}
          </motion.div>
        )}
        {entry.points && (
          <motion.ul className="tl-points" variants={itemV}>
            {entry.points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </motion.ul>
        )}
        {entry.groups && entry.groups.map((g, i) => <Group key={i} group={g} />)}
      </div>
    </motion.div>
  )
}

export default function Resume({ lang }: { lang: 'en' | 'zh' }) {
  const data = RESUME[lang]
  return (
    <section className="resume" lang={lang}>
      <motion.h2
        className="resume-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {data.title}
      </motion.h2>
      <div className="timeline">
        {data.entries.map((e, i) => (
          <Entry key={i} entry={e} index={i} />
        ))}
      </div>
    </section>
  )
}
