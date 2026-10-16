import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type Ref } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { WORKS, SECTION_COVERS, findWorkBySlug, itemThumb, sectionCount, type WorkListItem, type WorkSection, type WorksLang } from '../data/works'
import { getWorkDoc } from '../data/workDocs'
import { analyticsEnabled } from '../analytics'

const EASE = [0.22, 1, 0.36, 1]

// md 里写的 /works/... 等站内绝对路径 → 拼上 BASE_URL，部署在子目录（GitHub Pages）时也能命中
function resolveAsset(url: string): string {
  return url.startsWith('/') && !url.startsWith('//') ? `${import.meta.env.BASE_URL}${url.slice(1)}` : url
}
const mdUrlTransform = (url: string) => resolveAsset(defaultUrlTransform(url))
const isVideo = (url: string) => /\.(mp4|webm)$/i.test(url)

// 每个作品详情的独立链接：<站点>/#/work/<slug>（hash 路由，GitHub Pages 无需服务端配置）
const WORK_HASH = /^#\/work\/([\w-]+)$/
const workHash = (slug: string) => `#/work/${slug}`
const slugFromHash = () => WORK_HASH.exec(window.location.hash)?.[1] ?? null
// 每个板块（project）的独立链接：<站点>/#/project/<section id> → 滚动到该板块卡片
const PROJECT_HASH = /^#\/project\/([\w-]+)$/
const projectFromHash = () => PROJECT_HASH.exec(window.location.hash)?.[1] ?? null
const workUrl = (slug: string) =>
  `${window.location.origin}${window.location.pathname}${window.location.search}${workHash(slug)}`

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // 非安全上下文 / 无权限时的回退
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  }
}

// 极简清单的一行：作品名靠左、数据(播放量/标签)靠右、发丝线分隔；整行可点开全屏详情
function WorkLine({ item, onOpen }: { item: WorkListItem; onOpen: (item: WorkListItem) => void }) {
  const hasMeta = item.meta || (item.tags && item.tags.length)
  return (
    <li className="wk-line">
      <button className="wk-line-btn" onClick={() => onOpen(item)}>
        <span className="wk-line-name">{item.name}</span>
        {hasMeta && (
          <span className="wk-line-meta">
            {item.meta && <span className="wk-line-num">{item.meta}</span>}
            {item.tags &&
              item.tags.map((t, i) => (
                <span key={i} className="wk-line-tag">
                  {t}
                </span>
              ))}
          </span>
        )}
      </button>
    </li>
  )
}

// 缩略图网格的一格：缩略图 + 名称 / 分类；有 preview 时悬停播放静音预览（preload=none，悬停才加载）
function WorkTile({ item, onOpen }: { item: WorkListItem; onOpen: (item: WorkListItem) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const thumb = itemThumb(item)
  const play = () => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = 0
    v.play().catch(() => {})
  }
  const stop = () => videoRef.current?.pause()
  return (
    <li className="wk-tile">
      <button
        className="wk-tile-btn"
        onClick={() => onOpen(item)}
        onMouseEnter={play}
        onMouseLeave={stop}
        onFocus={play}
        onBlur={stop}
      >
        <span className={`wk-tile-media${item.preview ? ' has-preview' : ''}`}>
          {thumb && <img src={thumb} alt="" loading="lazy" />}
          {item.preview && (
            <video ref={videoRef} src={item.preview} muted loop playsInline preload="none" aria-hidden="true" />
          )}
          {item.preview && (
            <span className="wk-tile-play" aria-hidden="true">
              ▶
            </span>
          )}
        </span>
        <span className="wk-tile-name">{item.name}</span>
        {item.meta && <span className="wk-tile-meta">{item.meta}</span>}
      </button>
    </li>
  )
}

// 一张全高板块卡：编号 + 标题 + 配图 + 清单；layout='grid' 时清单换成缩略图网格（不再放板块封面）
function SectionCard({
  section,
  data,
  onOpen,
}: {
  section: WorkSection
  data: WorksLang
  onOpen: (item: WorkListItem) => void
}) {
  const [coverError, setCoverError] = useState(false)
  const cover = SECTION_COVERS[section.id]
  // 作品多（≥6）时收紧行距/留白，保证整张卡一屏放得下
  const isGrid = section.layout === 'grid'
  const isLong = !isGrid && sectionCount(section) >= 6
  return (
    <div
      className={`wk-card${isLong ? ' is-long' : ''}${isGrid ? ' is-grid' : ''}`}
      id={`project-${section.id}`}
    >
      <div className="wk-card-head">
        <span className="wk-card-no">{section.no}</span>
        <h3 className="wk-card-title">{section.title}</h3>
        <span className="wk-card-tagline">{section.tagline}</span>
      </div>
      {!isGrid && (
        <div className="wk-card-cover">
          {cover && !coverError ? (
            <img src={cover} alt="" onError={() => setCoverError(true)} />
          ) : (
            <div className="wk-card-cover-ph" aria-hidden="true">
              <span className="wk-card-cover-no">{section.no}</span>
            </div>
          )}
        </div>
      )}
      <SectionWorks section={section} data={data} onOpen={onOpen} />
    </div>
  )
}

// 板块内的作品清单（items 扁平 / groups 分组 / awards · footer 底部小字）
function SectionWorks({
  section,
  data,
  onOpen,
}: {
  section: WorkSection
  data: WorksLang
  onOpen: (item: WorkListItem) => void
}) {
  return (
    <div className="wk-card-body">
      {section.items && section.layout === 'grid' && (
        // 列数随作品数：1–2 个两列、4 个两列成方阵，其余三列
        <ul className="wk-tiles" data-cols={[1, 2, 4].includes(section.items.length) ? 2 : 3}>
          {section.items.map((it, i) => (
            <WorkTile key={i} item={it} onOpen={onOpen} />
          ))}
        </ul>
      )}

      {section.items && section.layout !== 'grid' && (
        <ul className="wk-list">
          {section.items.map((it, i) => (
            <WorkLine key={i} item={it} onOpen={onOpen} />
          ))}
        </ul>
      )}

      {section.groups &&
        section.groups.map((g, gi) => (
          <div key={gi} className="wk-sub">
            <div className="wk-sub-head">{g.heading}</div>
            <ul className="wk-list">
              {g.items.map((it, i) => (
                <WorkLine key={i} item={{ name: it }} onOpen={onOpen} />
              ))}
            </ul>
          </div>
        ))}

      {(section.awards || section.footer) && (
        <div className="wk-foot">
          {section.awards && (
            <p className="wk-foot-line">
              <span className="wk-foot-label">{data.awardsLabel}</span>
              <span className="wk-foot-val accent">{section.awards.join('  ·  ')}</span>
            </p>
          )}
          {section.footer && <p className="wk-foot-line">{section.footer}</p>}
        </div>
      )}
    </div>
  )
}

// 全屏沉浸详情：渲染该作品的 md（banner + 标题 + markdown 正文 + 外链）；
// 无 md 时回退到占位 banner + meta/标签简介
function WorkDetail({
  item,
  data,
  onClose,
}: {
  item: WorkListItem
  data: WorksLang
  onClose: () => void
}) {
  const [bannerError, setBannerError] = useState(false)
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null) // 正文图片灯箱
  const [copied, setCopied] = useState(false)
  const doc = getWorkDoc(item.slug)
  const title = (doc && doc.title) || item.name

  // 打开详情时标签页标题带上作品名，方便分享 / 收藏
  useEffect(() => {
    const prev = document.title
    document.title = `${title} · ${prev}`
    return () => {
      document.title = prev
    }
  }, [title])

  const onCopyLink = async () => {
    if (!item.slug) return
    if (await copyText(workUrl(item.slug))) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    }
  }
  const banner = doc && doc.banner ? resolveAsset(doc.banner) : null
  const poster = doc && doc.poster ? resolveAsset(doc.poster) : undefined

  // 灯箱打开时 ESC 只关灯箱（capture 阶段先于外层「ESC 关详情」拦截）
  useEffect(() => {
    if (!zoom) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      setZoom(null)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [zoom])

  // 点正文里的图片 → 放大查看
  const onBodyClick = (e: ReactMouseEvent) => {
    const el = e.target as HTMLElement
    if (el instanceof HTMLImageElement) setZoom({ src: el.currentSrc || el.src, alt: el.alt })
  }
  // 有 md 详情时展示完整信息；无 md 时详情页只保留标题 + 统一占位文案
  const link = doc ? doc.link || item.link : null
  const tags = doc ? doc.tags || item.tags : null
  // 副标题不含年份；标签单独做 badge 展示
  const sub = doc ? [item.meta, doc.role].filter(Boolean).join('  ·  ') : ''

  return (
    <>
      <motion.div
        className="wk-detail-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />
      <motion.div
        className="wk-detail"
        initial={{ opacity: 0, scale: 0.985, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.99, y: 6 }}
        transition={{ duration: 0.42, ease: EASE }}
      >
        <button className="wk-detail-close" onClick={onClose} aria-label={data.closeLabel}>
          ✕
        </button>
        {item.slug && (
          <button className={`wk-detail-share${copied ? ' is-done' : ''}`} onClick={onCopyLink}>
            <span aria-hidden="true">{copied ? '✓' : '🔗'}</span>
            {copied ? data.copiedLabel : data.copyLinkLabel}
          </button>
        )}

        {banner && !bannerError ? (
          <div className="wk-detail-banner">
            {isVideo(banner) ? (
              <video
                src={banner}
                poster={poster}
                autoPlay
                muted
                loop
                playsInline
                onError={() => setBannerError(true)}
              />
            ) : (
              <img src={banner} alt={title} onError={() => setBannerError(true)} />
            )}
          </div>
        ) : (
          <div className="wk-detail-banner is-ph" aria-hidden="true">
            <span className="wk-detail-ph-text">{title}</span>
          </div>
        )}

        <article className="wk-detail-article">
          <header className="wk-detail-head">
            <h3 className="wk-detail-title">{title}</h3>
            {sub && <div className="wk-detail-sub">{sub}</div>}
            {tags && tags.length > 0 && (
              <div className="wk-detail-tags">
                {tags.map((t, i) => (
                  <span key={i} className="wk-badge">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </header>

          {doc && doc.body ? (
            <div className="wk-md" onClick={onBodyClick}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                urlTransform={mdUrlTransform}
              >
                {doc.body}
              </ReactMarkdown>
            </div>
          ) : (
            // 无 md：演示详情页支持的组件 —— 介绍文本 + 图片/视频占位 + 跳转按钮
            <>
              <p className="wk-detail-desc">{data.detailPlaceholder}</p>
              <div className="wk-detail-ph-img" aria-hidden="true">
                <span className="wk-detail-ph-img-label">{data.phImageLabel}</span>
              </div>
              <span className="wk-detail-link is-ph" role="button" aria-disabled="true">
                {data.phButtonLabel} <span aria-hidden="true">↗</span>
              </span>
            </>
          )}

          {link && (
            <a
              className="wk-detail-link"
              href={resolveAsset(link)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {data.visitLabel} <span aria-hidden="true">↗</span>
            </a>
          )}
        </article>
      </motion.div>

      <AnimatePresence>
        {zoom && (
          <motion.div
            className="wk-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setZoom(null)}
          >
            <motion.img
              src={zoom.src}
              alt={zoom.alt}
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.98 }}
              transition={{ duration: 0.3, ease: EASE }}
            />
            {zoom.alt && <span className="wk-lightbox-cap">{zoom.alt}</span>}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default function Works({ lang, innerRef }: { lang: 'en' | 'zh'; innerRef: Ref<HTMLElement> }) {
  const data = WORKS[lang]
  const sections = data.sections
  const count = sections.length

  // 当前打开详情的作品 item；带 slug 的作品由 URL hash（#/work/<slug>）驱动，直接打开链接即进入详情
  const [active, setActive] = useState<WorkListItem | null>(() => {
    const slug = slugFromHash()
    return slug ? findWorkBySlug(sections, slug) : null
  })
  const pushedRef = useRef(false) // 详情是站内点开的（写入过历史）→ 关闭时用 history.back()

  // 浏览器前进 / 后退 / 手动改 hash → 同步详情
  useEffect(() => {
    const sync = () => {
      const slug = slugFromHash()
      if (!slug) pushedRef.current = false
      setActive(slug ? findWorkBySlug(sections, slug) : null)
    }
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [sections])

  const openWork = useCallback((item: WorkListItem) => {
    if (!item.slug) return setActive(item)
    pushedRef.current = true
    window.location.hash = workHash(item.slug) // 触发 hashchange → sync 打开
  }, [])

  const closeWork = useCallback(() => {
    if (slugFromHash()) {
      if (pushedRef.current) {
        pushedRef.current = false
        window.history.back() // 回到打开前的历史，hashchange → sync 关闭
        return
      }
      // 直接通过链接进入：清掉 hash，不离开本站
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
    setActive(null)
  }, [])

  // 竖滚 pin 转横移：测量整排卡片的实际可横移距离（px），竖滚进度 → 横移
  const galleryRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: galleryRef,
    offset: ['start start', 'end end'],
  })

  // track 实际宽度 - 视口宽 = 需要横移的距离；随尺寸/语言变化重测
  const [scrollRange, setScrollRange] = useState(0)
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const measure = () => setScrollRange(Math.max(0, el.scrollWidth - window.innerWidth))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [count, lang])

  // 板块链接 #/project/<id>：把该卡片滚到视口中央（竖滚 1:1 映射横移；窄屏为竖排直接定位）
  const scrollToProject = useCallback(() => {
    const id = projectFromHash()
    const card = id && document.getElementById(`project-${id}`)
    const gallery = galleryRef.current
    if (!card || !gallery) return false
    if (window.matchMedia('(max-width: 640px)').matches) {
      card.scrollIntoView({ block: 'start', behavior: 'instant' })
      return true
    }
    const range = Math.max(0, trackRef.current!.scrollWidth - window.innerWidth)
    const offset = card.offsetLeft - (window.innerWidth - card.offsetWidth) / 2
    const top = gallery.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: top + Math.min(range, Math.max(0, offset)), behavior: 'instant' })
    return true
  }, [])
  // 直接打开板块链接：等画廊高度（scrollRange）量好后定位一次
  const pendingProjectRef = useRef(Boolean(projectFromHash()))
  useEffect(() => {
    if (!pendingProjectRef.current) return
    const stacked = window.matchMedia('(max-width: 640px)').matches // 窄屏竖排时没有横移距离
    if (!(scrollRange > 0 || stacked) || !scrollToProject()) return
    pendingProjectRef.current = false
    // 首屏图片/动画还在落位时布局会轻微移动，稍后再对齐两次
    const timers = [400, 1200].map((ms) => window.setTimeout(scrollToProject, ms))
    return () => timers.forEach(clearTimeout)
  }, [scrollRange, scrollToProject])
  useEffect(() => {
    const onHash = () => {
      scrollToProject()
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [scrollToProject])

  // px 数值插值（比 vw 字符串更顺）；竖滚行程与横移 1:1
  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollRange])
  // 横移到底时「继续下滑」提示渐隐
  const hintOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0])

  // 详情打开时锁滚动 + ESC 关闭
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeWork()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [active, closeWork])

  return (
    <section className="works" lang={lang} ref={innerRef}>
      <div
        className="wk-gallery"
        ref={galleryRef}
        style={{ height: `calc(100vh + ${scrollRange}px)` }}
      >
        <div className="wk-gallery-sticky">
          <span className="wk-gallery-title">{data.title}</span>

          <motion.div className="wk-track" ref={trackRef} style={{ x }}>
            {sections.map((s) => (
              <SectionCard key={s.id} section={s} data={data} onOpen={openWork} />
            ))}
          </motion.div>

          <div className="wk-progress" aria-hidden="true">
            <motion.div className="wk-progress-fill" style={{ scaleX: scrollYProgress }} />
          </div>
          <motion.span className="wk-hint" style={{ opacity: hintOpacity }} aria-hidden="true">
            {data.hint}
          </motion.span>
        </div>
      </div>

      {analyticsEnabled && (
        <p className="wk-privacy">
          This site logs visits (IP address, approximate location and pages viewed) so I can see which
          projects people look at. Records are deleted after 180 days.
        </p>
      )}

      <AnimatePresence>
        {active && (
          <WorkDetail
            key={active.slug || active.name}
            item={active}
            data={data}
            onClose={closeWork}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
