import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText as ArticleIcon, Search, Calendar, Tag as TagIcon, X, TrendingUp } from 'lucide-react'
import Select from 'react-select'
import { useLanguage } from '../../contexts/LanguageContext'
import Badge from '../../components/ui/Badge'
import { useBlogsStore } from '../../hooks/useBlogsStore'
import { blogAPI } from '../../lib/api'
import { useToast } from '../../components/ui/Toast'

/* ──── Article Card ──────────────────────────────────────────────────────── */
function BlogCard({ blog, onClick, t, isRTL }) {
  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(t("auto.enus"), { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="bg-background-paper border border-border rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
      onClick={() => onClick(blog)}
    >
      <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-primary/30" />

      <div className="p-5 space-y-3">
        <div className={`flex items-start justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-text-heading text-base leading-snug group-hover:text-primary transition-colors line-clamp-2 text-start`}>
              {blog.title}
            </h3>
          </div>
        </div>

        <p className={`text-sm text-text-muted line-clamp-3 leading-relaxed text-start`}>
          {blog.description}
        </p>

        <div className={`flex flex-wrap gap-1.5 ${t("auto.justifystart")}`}>
          {blog.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs px-2.5 py-0.5 bg-background-subtle border border-border rounded-full text-text-muted flex items-center gap-1">
              <TagIcon style={{ width: 10, height: 10 }} />
              {tag}
            </span>
          ))}
          {blog.tags.length > 3 && (
            <span className="text-xs px-2 py-0.5 bg-background-subtle border border-border rounded-full text-text-muted">+{blog.tags.length - 3}</span>
          )}
        </div>

        <div className={`pt-3 border-t border-border flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-1 text-xs text-text-muted ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Calendar style={{ width: 12, height: 12 }} />
            {formatDate(blog.createdAt)}
          </div>
          <span className="text-xs text-primary font-semibold">{t('blogs.readMore')}</span>
        </div>
      </div>
    </motion.div>
  )
}

/* ──── Featured Banner Card ──────────────────────────────────────────────── */
function FeaturedCard({ blog, onClick, t, isRTL }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="relative bg-gradient-to-br from-primary/90 to-secondary/80 rounded-2xl p-6 text-white cursor-pointer overflow-hidden shadow-lg"
      onClick={() => onClick(blog)}
    >
      <div className="absolute top-0 end-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
      <div className="absolute bottom-0 start-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
      <div className="relative z-10">
        <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
          <TrendingUp style={{ width: 12, height: 12 }} /> {t('blogs.featuredBadge')}
        </span>
        <h3 className={`font-bold text-lg leading-snug mb-2 text-start`}>{blog.title}</h3>
        <p className={`text-white/80 text-sm line-clamp-2 text-start`}>{blog.description}</p>
        <div className={`flex flex-wrap gap-1.5 mt-3 ${t("auto.justifystart")}`}>
          {blog.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs bg-white/15 text-white/90 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* ──── Article Detail Modal ──────────────────────────────────────────────── */
function BlogModal({ blog, onClose, t, isRTL }) {
  if (!blog) return null

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(t("auto.enus"), { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-background-paper rounded-3xl shadow-2xl max-w-2xl w-full max-h-[88vh] overflow-y-auto"
          
          onClick={e => e.stopPropagation()}
        >
          <div className="h-2 bg-gradient-to-r from-primary via-secondary to-primary/40 rounded-t-3xl" />

          <div className="p-6 space-y-5">
            <div className={`flex items-center justify-end`}>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-background-subtle transition-all"
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <h2 className={`text-2xl font-black text-text-heading leading-snug text-start`}>
              {blog.title}
            </h2>

            <div className={`flex items-center gap-3 text-sm text-text-muted flex-wrap ${isRTL ? 'justify-end flex-row-reverse' : ''}`}>
              <span className={`flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Calendar style={{ width: 14, height: 14 }} />
                {formatDate(blog.createdAt)}
              </span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>{t('blogs.by')}: {blog.author || t('blogs.nafsTeam')}</span>
            </div>

            <hr className="border-border" />

            <div className={`text-text leading-relaxed text-base whitespace-pre-line text-start`}>
              {blog.description}
            </div>

            <div className={`flex flex-wrap gap-2 pt-2 ${t("auto.justifystart")}`}>
              {blog.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-sm px-3 py-1 bg-primary/10 text-primary rounded-full font-medium border border-primary/20">
                  <TagIcon style={{ width: 13, height: 13 }} />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ──── Main Page ─────────────────────────────────────────────────────────── */
export default function PatientBlogs() {
  const { blogs, blogLoadError } = useBlogsStore()
  const { t, isRTL } = useLanguage()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState('all')
  const [selected, setSelected] = useState(null)
  const [loadingBlogId, setLoadingBlogId] = useState(null)

  useEffect(() => {
    if (!blogLoadError) return
    toast.error(t("auto.failedToLoadBlogsFromServer"))
  }, [blogLoadError, toast, isRTL])

  const handleSelectBlog = async (blog) => {
    setSelected(blog)
    if (!blog?.id) return

    setLoadingBlogId(blog.id)
    try {
      const response = await blogAPI.getBlogById(blog.id)
      const item = response?.Data
      if (response?.IsSuccess !== false && item) {
        setSelected((prev) => ({
          ...prev,
          title: item.Title || prev?.title,
          description: item.Body || prev?.description,
          createdAt: item.CreatedAt || prev?.createdAt,
          author: item.AuthorName || prev?.author,
          tags: (item.Tags || []).map((tag) => tag.Name),
        }))
      }
    } catch {
      // Keep summary data already available in UI if details fetch fails.
    } finally {
      setLoadingBlogId(null)
    }
  }

  const allTags = useMemo(() => {
    const tagSet = new Set()
    blogs.forEach(b => b.tags.forEach(tag => tagSet.add(tag)))
    return [...tagSet]
  }, [blogs])

  const tagOptions = useMemo(() => [
    { value: 'all', label: t('blogs.filterAll') },
    ...allTags.map(tag => ({ value: tag, label: tag }))
  ], [allTags, t])

  const filtered = useMemo(() => blogs.filter(b => {
    const matchSearch = !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase()) ||
      b.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    const matchTag = activeTag === 'all'
      ? true
      : b.tags.includes(activeTag)
    return matchSearch && matchTag
  }), [blogs, search, activeTag])

  return (
    <div className="space-y-6 max-w-5xl mx-auto" >
      {/* Header and Controls */}
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-black text-text-heading flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <ArticleIcon className="text-primary" style={{ width: 22, height: 22 }} />
            </div>
            {t('blogs.pageTitle')}
          </h1>
          <p className="text-text-muted mt-1 text-sm">{t('blogs.pageSubtitle')}</p>
        </div>

        <div className={`flex flex-col sm:flex-row gap-3 w-full lg:w-auto ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          {/* Dropdown Filter */}
          <div className="w-full sm:w-56 z-20">
            <Select
              value={tagOptions.find(o => o.value === activeTag)}
              onChange={(opt) => setActiveTag(opt.value)}
              options={tagOptions}
              isSearchable={false}
              classNamePrefix="react-select"
              placeholder={t('blogs.filterAll')}
              styles={{
                control: (base, state) => ({
                  ...base,
                  backgroundColor: 'var(--color-background-paper)',
                  borderColor: state.isFocused ? 'var(--color-primary)' : 'var(--color-border)',
                  borderRadius: '0.75rem',
                  padding: '4px',
                  boxShadow: state.isFocused ? '0 0 0 1px var(--color-primary)' : 'none',
                  '&:hover': {
                    borderColor: 'var(--color-primary)'
                  }
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: 'var(--color-background-paper)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  zIndex: 50,
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected 
                    ? 'var(--color-primary)' 
                    : state.isFocused 
                      ? 'var(--color-background-subtle)' 
                      : 'transparent',
                  color: state.isSelected 
                    ? '#ffffff' 
                    : 'var(--color-text)',
                  cursor: 'pointer',
                  textAlign: t("auto.left"),
                }),
                singleValue: (base) => ({
                  ...base,
                  color: 'var(--color-text)',
                })
              }}
            />
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search
              className={`absolute ${t("auto.start4")} top-1/2 -translate-y-1/2 text-text-muted`}
              style={{ width: 17, height: 17 }}
            />
            <input
              type="text"
              placeholder={t('blogs.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full ps-11 pe-10 py-3 bg-background-paper border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-text transition-all`}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className={`absolute end-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text`}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results count */}
      {search && (
        <p className={`text-sm text-text-muted text-start`}>
          {filtered.length > 0
            ? `${filtered.length} ${t('blogs.searchResults')} "${search}"`
            : `${t('blogs.noResults')} "${search}"`}
        </p>
      )}

      {/* Articles grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center bg-background-subtle/20 rounded-2xl border-2 border-dashed border-border"
        >
          <ArticleIcon className="text-text-muted opacity-20 mb-4" style={{ width: 64, height: 64 }} />
          <h3 className="text-xl font-bold text-text-heading">
            {t('blogs.noArticles')}
          </h3>
          <p className="text-text-muted text-sm mt-2">
            {t('blogs.noResultsDesc')}
          </p>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map(b => (
              <BlogCard
                key={b.id}
                blog={b}
                onClick={handleSelectBlog}
                t={t}
                isRTL={isRTL}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Detail modal */}
      {selected && <BlogModal blog={selected} onClose={() => setSelected(null)} t={t} isRTL={isRTL} />}

      {loadingBlogId && (
        <p className={`text-xs text-text-muted text-start`}>
          {t("auto.loadingArticleDetails")}
        </p>
      )}
    </div>
  )
}
