import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText as ArticleIcon, ArrowLeft as ArrowBack, ArrowRight as ArrowForward, Tag as TagIcon, Calendar, User as PersonIcon, Image as ImageIcon } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useLanguage } from '../../contexts/LanguageContext'
import { blogAPI } from '../../lib/api'

function pickData(payload) {
  return payload?.Data ?? payload?.data ?? null
}

export default function BlogDetail() {
  const { blogId, id } = useParams()
  const activeId = blogId || id
  const navigate = useNavigate()
  const { t, isRTL } = useLanguage()

  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await blogAPI.getBlogById(activeId)
        const data = pickData(response) || response
        setBlog(data)
      } catch {
        setError(t("auto.failedToLoadArticle"))
      } finally {
        setLoading(false)
      }
    }
    if (activeId) fetchBlog()
  }, [activeId, isRTL])

  const formatDate = (iso) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString(t("auto.enus"), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const title = blog?.Title || blog?.title || ''
  const body = blog?.Body || blog?.body || ''
  const tags = blog?.Tags || blog?.tags || []
  const author = blog?.AuthorName || blog?.authorName || blog?.Author || blog?.author || 'Nafs Team'
  const createdAt = blog?.CreatedAt || blog?.createdAt || ''
  const image = blog?.Images?.[0] || blog?.images?.[0]

  const BackArrow = isRTL ? ArrowForward : ArrowBack

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32" >
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-text-muted text-sm">{t("auto.loadingArticle")}</p>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center" >
        <ArticleIcon className="text-text-muted opacity-20 mb-4" style={{ width: 64, height: 64 }} />
        <h2 className="text-xl font-bold text-text-heading mb-2">
          {error || (t("auto.articleNotFound"))}
        </h2>
        <Button variant="outline" onClick={() => navigate('/admin/blogs')} className="mt-4 gap-2">
          <BackArrow style={{ width: 16, height: 16 }} />
          {t("auto.backToArticles")}
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full px-4 md:px-8 space-y-6 pb-12" >
      {/* Back Button */}
      <motion.div initial={{ opacity: 0, x: isRTL ? 20 : -20 }} animate={{ opacity: 1, x: 0 }}>
        <button
          onClick={() => navigate('/admin/blogs')}
          className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm font-medium group"
        >
          <BackArrow
            className="group-hover:scale-110 transition-transform"
            style={{ width: 18, height: 18 }}
          />
          {t("auto.backToArticles")}
        </button>
      </motion.div>

      {/* Article Content */}
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-background-paper border border-border rounded-3xl overflow-hidden shadow-xl"
      >
        {/* Header - Simple Title Section */}
        <div className="p-8 md:p-12 pb-0 border-b border-border/30">
          <div className={`h-1.5 w-20 bg-primary rounded-full mb-8 ${t("auto.ms0")}`} />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag, i) => (
                <span key={i} className="text-[10px] px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full font-bold uppercase tracking-wider">
                  {tag?.Name || tag?.name || tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-4xl md:text-6xl font-black text-text-heading leading-tight tracking-tighter max-w-5xl">
            {title}
          </h1>

          <div className={`flex flex-wrap items-center gap-6 text-sm text-text-muted py-8 flex-row`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <PersonIcon style={{ width: 16, height: 16 }} className="text-primary" />
              </div>
              <span className="font-bold text-text-heading/80">{author}</span>
            </div>
            {createdAt && (
              <div className="flex items-center gap-2 text-xs">
                <Calendar style={{ width: 14, height: 14 }} className="opacity-60" />
                <span>{formatDate(createdAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Layout Grid: Content + Image */}
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* Main Content Side */}
          <div className="flex-1 p-8 md:p-14 lg:p-16">
            <div
              className={`prose prose-lg md:prose-xl max-w-none text-text leading-loose text-start`}
              style={{ lineHeight: '2.2' }}
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </div>

          {/* Image Side (Right) */}
          {image && (
            <div className="w-full lg:w-[400px] xl:w-[500px] p-6 lg:p-10 bg-background-subtle/30">
              <div className="lg:sticky lg:top-8">
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-border group">
                  <img
                    src={image}
                    alt={title}
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-1000"
                  />
                </div>
                <div className="mt-6 flex items-center gap-3 text-xs text-text-muted italic opacity-60 px-2">
                  <ImageIcon style={{ width: 14, height: 14 }} />
                  {t("auto.imageAttachedToArticle")}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rich text styles */}
        <style>{`
          .prose h1 { font-size: 2em; font-weight: 900; margin: 1em 0 0.5em; color: var(--color-text-heading, #fff); }
          .prose h2 { font-size: 1.6em; font-weight: 800; margin: 0.8em 0 0.5em; color: var(--color-text-heading, #fff); }
          .prose h3 { font-size: 1.3em; font-weight: 700; margin: 0.7em 0 0.5em; color: var(--color-text-heading, #fff); }
          .prose ul { list-style: disc; padding-inline-start: 1.5em; margin: 1em 0; }
          .prose ol { list-style: decimal; padding-inline-start: 1.5em; margin: 1em 0; }
          .prose blockquote {
            border-inline-start: 5px solid var(--color-primary, #4ade80);
            background: rgba(74, 222, 128, 0.03);
            padding: 2em;
            margin: 2em 0;
            font-style: italic;
            border-radius: 8px;
            font-size: 1.1em;
            color: var(--color-text-muted, #9ca3af);
          }
          .prose pre {
            background: #111;
            border-radius: 12px;
            padding: 1.5em;
            margin: 2em 0;
            font-family: 'Fira Code', monospace;
            border: 1px solid var(--color-border, #333);
            overflow-x: auto;
          }
          .prose img { border-radius: 12px; margin: 2em auto; display: block; max-width: 100%; height: auto; }
          .prose a { color: var(--color-primary, #4ade80); text-decoration: underline; text-underline-offset: 4px; font-weight: 600; }
          .prose p { margin-bottom: 1.8em; }
        `}</style>
      </motion.article>
    </div>
  )
}
