import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText as ArticleIcon, Search, Calendar, Tag as TagIcon, X, TrendingUp, User } from 'lucide-react'
import Select from 'react-select'
import { useLanguage } from '../../contexts/LanguageContext'
import Badge from '../../components/ui/Badge'
import { useBlogsStore } from '../../hooks/useBlogsStore'
import { blogAPI } from '../../lib/api'
import { useToast } from '../../components/ui/Toast'

// Dynamic thematic gradients based on text hash to provide premium visual look when actual cover images are absent
const getGradientClass = (title = '') => {
  const gradients = [
    'from-teal-500/20 via-emerald-500/10 to-background',
    'from-blue-500/20 via-indigo-500/10 to-background',
    'from-purple-500/20 via-fuchsia-500/10 to-background',
    'from-amber-500/20 via-orange-500/10 to-background',
    'from-rose-500/20 via-pink-500/10 to-background',
  ]
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % gradients.length
  return gradients[index]
}

const getAccentColor = (title = '') => {
  const colors = [
    'text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20',
    'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
    'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
    'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
  ]
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

/* ──── Article Card ──────────────────────────────────────────────────────── */
function BlogCard({ blog, onClick, t, isRTL }) {
  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(isRTL ? "ar-EG" : "en-US", { year: 'numeric', month: 'short', day: 'numeric' })

  const gradientClass = useMemo(() => getGradientClass(blog.title), [blog.title])
  const accentColorClass = useMemo(() => getAccentColor(blog.title), [blog.title])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-background-paper border border-border rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden flex flex-col justify-between h-full"
      onClick={() => onClick(blog)}
    >
      <div>
        {/* Cover visual header */}
        <div className={`h-36 bg-gradient-to-br ${gradientClass} flex items-center justify-center relative overflow-hidden transition-all duration-500 border-b border-border/50`}>
          <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/50 opacity-10" />
          
          <div className={`p-3.5 rounded-2xl bg-background-paper/60 backdrop-blur-md border border-white/20 shadow-md ${accentColorClass.split(' ')[0]} transform group-hover:scale-110 transition-transform duration-300`}>
            <ArticleIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Title */}
          <h3 className={`font-bold text-text-heading text-base leading-snug group-hover:text-primary transition-colors line-clamp-2 ${isRTL ? 'text-right' : 'text-left'}`}>
            {blog.title}
          </h3>

          {/* Description */}
          {blog.description && (
            <p className={`text-sm text-text-muted line-clamp-3 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
              {blog.description}
            </p>
          )}

          {/* Tags */}
          <div className={`flex flex-wrap gap-1.5 ${isRTL ? 'justify-start' : 'justify-start'}`}>
            {blog.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs px-2.5 py-1 bg-primary/5 border border-primary/10 rounded-full text-primary flex items-center gap-1 hover:bg-primary/10 transition-colors">
                <TagIcon style={{ width: 10, height: 10 }} />
                {tag}
              </span>
            ))}
            {blog.tags.length > 3 && (
              <span className="text-xs px-2.5 py-1 bg-background-subtle border border-border rounded-full text-text-muted">+{blog.tags.length - 3}</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 pt-0">
        <div className={`pt-4 border-t border-border/80 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-1.5 text-xs text-text-muted ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Calendar style={{ width: 13, height: 13 }} />
            {formatDate(blog.createdAt)}
          </div>
          
          <div className="flex items-center gap-1 text-xs text-primary font-bold group-hover:underline">
            <span>{t('blogs.readMore')}</span>
            <span className={`transition-transform duration-300 transform ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}>
              {isRTL ? '←' : '→'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ──── Featured Banner Card ──────────────────────────────────────────────── */
function FeaturedCard({ blog, onClick, t, isRTL }) {
  const gradientClass = useMemo(() => getGradientClass(blog.title), [blog.title])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.005 }}
      transition={{ duration: 0.3 }}
      className="relative bg-gradient-to-br from-primary/95 via-primary to-secondary rounded-3xl p-8 text-white cursor-pointer overflow-hidden shadow-lg hover:shadow-xl transition-all"
      onClick={() => onClick(blog)}
    >
      {/* Decorative shapes */}
      <div className="absolute top-0 end-0 w-48 h-48 bg-white/5 rounded-full -translate-y-12 translate-x-12 blur-2xl" />
      <div className="absolute bottom-0 start-0 w-36 h-36 bg-white/5 rounded-full translate-y-12 -translate-x-12 blur-xl" />
      <div className="absolute inset-0 bg-grid-white/[0.03] opacity-40 [mask-image:radial-gradient(circle_at_center,white,transparent)]" />
      
      <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-full mb-4 border border-white/10 shadow-sm">
            <TrendingUp style={{ width: 12, height: 12 }} /> {t('blogs.featuredBadge')}
          </span>
          <h3 className={`font-extrabold text-2xl leading-snug mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>{blog.title}</h3>
          <p className={`text-white/80 text-sm leading-relaxed line-clamp-3 ${isRTL ? 'text-right' : 'text-left'}`}>{blog.description}</p>
        </div>

        <div className={`flex flex-wrap gap-2 pt-2 ${isRTL ? 'justify-start' : 'justify-start'}`}>
          {blog.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-white/15 backdrop-blur-sm text-white/95 px-3 py-1 rounded-full border border-white/5">{tag}</span>
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
    new Date(iso).toLocaleDateString(isRTL ? "ar-EG" : "en-US", { year: 'numeric', month: 'long', day: 'numeric' })

  const gradientClass = getGradientClass(blog.title)
  const accentColorClass = getAccentColor(blog.title)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="bg-background-paper rounded-[28px] shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-border/40"
          onClick={e => e.stopPropagation()}
        >
          {/* Cover Area in Modal */}
          <div className={`h-40 bg-gradient-to-br ${gradientClass} flex items-center justify-center relative overflow-hidden shrink-0`}>
            <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
            <div className="absolute inset-0 bg-grid-slate-100 opacity-10" />
            
            {/* Close button inside cover */}
            <button
              onClick={onClose}
              className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} p-2 rounded-full bg-background-paper/30 hover:bg-background-paper/60 border border-white/20 text-white hover:text-text-heading backdrop-blur-md transition-all shadow-sm`}
            >
              <X style={{ width: 18, height: 18 }} />
            </button>

            <div className={`p-4 rounded-full bg-background-paper/80 backdrop-blur-md border border-white/30 shadow-lg ${accentColorClass.split(' ')[0]}`}>
              <ArticleIcon className="w-8 h-8" />
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-8 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
            <h2 className={`text-2xl sm:text-3xl font-extrabold text-text-heading leading-snug ${isRTL ? 'text-right' : 'text-left'}`}>
              {blog.title}
            </h2>

            <div className={`flex items-center gap-4 text-sm text-text-muted flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className={`flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Calendar style={{ width: 14, height: 14 }} className="text-primary" />
                {formatDate(blog.createdAt)}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-border" />
              <span className={`flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <User style={{ width: 14, height: 14 }} className="text-primary" />
                {t('blogs.by')}: {blog.author || t('blogs.nafsTeam')}
              </span>
            </div>

            <hr className="border-border/60" />

            <div className={`text-text leading-relaxed text-base sm:text-lg whitespace-pre-line ${isRTL ? 'text-right' : 'text-left'}`}>
              {blog.description}
            </div>

            {blog.tags && blog.tags.length > 0 && (
              <div className={`flex flex-wrap gap-2 pt-4 border-t border-border/40 ${isRTL ? 'justify-start' : 'justify-start'}`}>
                {blog.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 bg-primary/5 hover:bg-primary/10 text-primary rounded-full font-semibold border border-primary/10 transition-colors">
                    <TagIcon style={{ width: 11, height: 11 }} />
                    {tag}
                  </span>
                ))}
              </div>
            )}
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

  const featuredBlog = useMemo(() => {
    return filtered.find(b => b.featured)
  }, [filtered])

  const nonFeaturedBlogs = useMemo(() => {
    return filtered.filter(b => !b.featured)
  }, [filtered])

  return (
    <div className="space-y-6 max-w-5xl mx-auto" >
      {/* Header and Controls */}
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border/40 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-black text-text-heading flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <ArticleIcon className="text-primary" style={{ width: 22, height: 22 }} />
            </div>
            {t('blogs.pageTitle')}
          </h1>
          <p className="text-text-muted mt-1.5 text-sm">{t('blogs.pageSubtitle')}</p>
        </div>

        <div className={`flex flex-col sm:flex-row gap-4 w-full lg:w-auto ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
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
                  textAlign: isRTL ? 'right' : 'left',
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

      {/* Articles Grid / Empty State */}
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
        <div className="space-y-8">
          {/* Featured Banner */}
          {activeTag === 'all' && !search && featuredBlog && (
            <div className="mb-6">
              <FeaturedCard blog={featuredBlog} onClick={handleSelectBlog} t={t} isRTL={isRTL} />
            </div>
          )}

          {/* Grid list */}
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {(activeTag === 'all' && !search && featuredBlog ? nonFeaturedBlogs : filtered).map(b => (
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
        </div>
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
