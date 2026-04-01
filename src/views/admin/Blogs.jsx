import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Article as ArticleIcon,
  Add as Plus,
  Edit as Pencil,
  Delete as Trash2,
  LocalOffer as TagIcon,
  CalendarToday as Calendar,
  Close as X,
  Save,
  Search,
} from '@mui/icons-material'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'
import { useBlogsStore } from '../../hooks/useBlogsStore'
import { useLanguage } from '../../contexts/LanguageContext'
import { blogAPI } from '../../lib/api'

const TAG_SUGGESTIONS = [
  'الصحة النفسية', 'العلاج النفسي', 'القلق', 'الاكتئاب', 'التوعية',
  'نصائح', 'صحة عامة', 'تطوير الذات', 'العلاقات', 'الأسرة',
  'Mental Health', 'Therapy', 'Anxiety', 'Wellness', 'Tips',
]

const EMPTY_FORM = { title: '', description: '', tags: [] }

function BlogFormModal({ isOpen, onClose, onSave, initial, availableTags = [] }) {
  const { t, isRTL } = useLanguage()
  const [form, setForm] = useState(initial ? { title: initial.title, description: initial.description, tags: [...initial.tags] } : EMPTY_FORM)
  const [tagInput, setTagInput] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = t('blogs.titleRequired')
    if (!form.description.trim()) e.description = t('blogs.contentRequired')
    if (form.tags.length === 0) e.tags = t('blogs.tagsRequired')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const addTag = (tag) => {
    const trimmed = tag.trim()
    if (!trimmed || form.tags.includes(trimmed)) return
    setForm(f => ({ ...f, tags: [...f.tags, trimmed] }))
    setTagInput('')
    if (errors.tags) setErrors(e => ({ ...e, tags: '' }))
  }

  const removeTag = (t) => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))

  const handleSave = () => {
    if (!validate()) return
    onSave({ title: form.title.trim(), description: form.description.trim(), tags: form.tags })
    onClose()
  }

  const handleClose = () => {
    setForm(initial ? { title: initial.title, description: initial.description, tags: [...initial.tags] } : EMPTY_FORM)
    setTagInput('')
    setSelectedTag('')
    setErrors({})
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={initial?.id ? t('blogs.editArticle') : `✨ ${t('blogs.addNew')}`}
      size="lg"
    >
      <div className="space-y-5" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-text-heading mb-1.5">
            {t('blogs.articleTitle')} <span className="text-red-500">{t('blogs.required')}</span>
          </label>
          <input
            className={`w-full px-4 py-3 rounded-xl border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm ${errors.title ? 'border-red-400' : 'border-border focus:border-primary'}`}
            placeholder={t('blogs.titlePlaceholder')}
            value={form.title}
            onChange={e => { setForm(f => ({ ...f, title: e.target.value })); if (errors.title) setErrors(er => ({ ...er, title: '' })) }}
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-text-heading mb-1.5">
            {t('blogs.content')} <span className="text-red-500">{t('blogs.required')}</span>
          </label>
          <textarea
            rows={6}
            className={`w-full px-4 py-3 rounded-xl border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm resize-none leading-relaxed ${errors.description ? 'border-red-400' : 'border-border focus:border-primary'}`}
            placeholder={t('blogs.contentPlaceholder')}
            value={form.description}
            onChange={e => { setForm(f => ({ ...f, description: e.target.value })); if (errors.description) setErrors(er => ({ ...er, description: '' })) }}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.description
              ? <p className="text-xs text-red-500">{errors.description}</p>
              : <span />}
            <span className="text-xs text-text-muted">{form.description.length} {t('blogs.charCount')}</span>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-text-heading mb-1.5">
            {t('blogs.tagsLabel')} <span className="text-red-500">{t('blogs.required')}</span>
          </label>

          <div className={`flex gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded-xl bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">{isRTL ? 'اختر وسم من القائمة' : 'Choose a tag from list'}</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!selectedTag) return
                addTag(selectedTag)
                setSelectedTag('')
              }}
              disabled={!selectedTag}
            >
              {isRTL ? 'إضافة' : 'Add'}
            </Button>
          </div>

          <div className={`flex gap-2 p-1 rounded-xl border bg-background transition-all ${errors.tags ? 'border-red-400' : 'border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'}`}>
            <input
              className="flex-1 px-3 py-2 bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
              placeholder={t('blogs.tagsPlaceholder')}
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput) } }}
            />
            <button
              type="button"
              onClick={() => addTag(tagInput)}
              className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              <Plus style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-medium border border-primary/20">
                  <TagIcon style={{ width: 12, height: 12 }} />
                  {tag}
                  <button onClick={() => removeTag(tag)} className={`${isRTL ? 'mr-1' : 'ml-1'} hover:text-red-500 transition-colors`}>
                    <X style={{ width: 12, height: 12 }} />
                  </button>
                </span>
              ))}
            </div>
          )}
          {errors.tags && <p className="text-xs text-red-500 mt-1">{errors.tags}</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-border">
          <Button variant="outline" className="flex-1" onClick={handleClose}>{t('blogs.cancel')}</Button>
          <Button className="flex-1 gap-2" onClick={handleSave}>
            <Save style={{ width: 16, height: 16 }} />
            {initial?.id ? t('blogs.saveChanges') : t('blogs.publish')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function BlogCard({ blog, onEdit, onDelete }) {
  const { t, isRTL } = useLanguage()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const formatDate = (iso) => new Date(iso).toLocaleDateString(
    isRTL ? 'ar-EG' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-background-paper border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
    >
      <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-primary/40" />

      <div className="p-5 space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-text-heading text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {blog.title}
            </h3>
          </div>
        </div>

        <p className={`text-sm text-text-muted line-clamp-3 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
          {blog.description}
        </p>

        <div className={`flex flex-wrap gap-1.5 ${isRTL ? 'justify-end' : 'justify-start'}`}>
          {blog.tags.slice(0, 4).map(tag => (
            <span key={tag} className="text-xs px-2.5 py-0.5 bg-primary/8 border border-primary/15 text-primary rounded-full font-medium flex items-center gap-1">
              <TagIcon style={{ width: 11, height: 11 }} />
              {tag}
            </span>
          ))}
          {blog.tags.length > 4 && (
            <span className="text-xs px-2.5 py-0.5 bg-background-subtle border border-border text-text-muted rounded-full">
              +{blog.tags.length - 4}
            </span>
          )}
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Calendar style={{ width: 12, height: 12 }} />
              {formatDate(blog.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(blog)}
              className="p-2 text-text-muted hover:text-primary hover:bg-primary/8 rounded-lg transition-all"
              title={t('common.edit')}
            >
              <Pencil style={{ width: 15, height: 15 }} />
            </button>
            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { onDelete(blog.id); setConfirmDelete(false) }}
                  className="px-2.5 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >{t('blogs.confirmDelete')}</button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-1 text-xs bg-background-subtle text-text-muted rounded-lg hover:bg-border transition-colors"
                >{t('blogs.confirmNo')}</button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title={t('common.delete')}
              >
                <Trash2 style={{ width: 15, height: 15 }} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function AdminBlogs() {
  const { blogs, blogLoadError, addBlog, updateBlog, deleteBlog } = useBlogsStore()
  const { t, isRTL } = useLanguage()
  const toast = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)
  const [search, setSearch] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [preferredTags, setPreferredTags] = useState([])
  const [selectedPreferredTagIds, setSelectedPreferredTagIds] = useState([])
  const [tagsLoading, setTagsLoading] = useState(false)
  const [savingTags, setSavingTags] = useState(false)
  const [creatingTag, setCreatingTag] = useState(false)
  const [createdTagNames, setCreatedTagNames] = useState([])

  useEffect(() => {
    if (!blogLoadError) return
    toast.error(isRTL ? 'فشل تحميل المقالات من الخادم' : 'Failed to load blogs from server')
  }, [blogLoadError, toast, isRTL])

  const loadPreferredTags = async () => {
    setTagsLoading(true)
    try {
      const response = await blogAPI.getPreferredTags()
      const tagItems = response?.Data || []
      setPreferredTags(tagItems)
      setSelectedPreferredTagIds(tagItems.map((tag) => tag.TagID))
    } catch {
      setPreferredTags([])
      setSelectedPreferredTagIds([])
    } finally {
      setTagsLoading(false)
    }
  }

  useEffect(() => {
    loadPreferredTags()
  }, [])

  const handleSave = async (data) => {
    try {
      if (editingBlog?.id) {
        await updateBlog(editingBlog.id, data)
        toast.success(t('success.blogUpdated'))
      } else {
        await addBlog(data)
        toast.success(t('success.blogAdded'))
      }
      setEditingBlog(null)
    } catch {
      toast.error(t('errors.unexpectedError'))
    }
  }

  const handleEdit = (blog) => {
    setEditingBlog(blog)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteBlog(id)
      toast.success(t('success.blogDeleted'))
    } catch {
      toast.error(t('errors.unexpectedError'))
    }
  }

  const handleOpenAdd = () => {
    setEditingBlog(null)
    setIsModalOpen(true)
  }

  const handleCreateTag = async () => {
    const name = newTagName.trim()
    if (!name) return

    setCreatingTag(true)
    try {
      const createResponse = await blogAPI.createTag(name)
      if (createResponse?.IsSuccess === false) {
        toast.error(createResponse?.Message || t('errors.unexpectedError'))
        return
      }

      setCreatedTagNames((prev) => (
        prev.some((tag) => tag.toLowerCase() === name.toLowerCase()) ? prev : [...prev, name]
      ))

      setNewTagName('')
      await loadPreferredTags()
      toast.success(isRTL ? 'تم إنشاء الوسم' : 'Tag created')
    } catch {
      toast.error(isRTL ? 'فشل إنشاء الوسم' : 'Failed to create tag')
    } finally {
      setCreatingTag(false)
    }
  }

  const togglePreferredTag = (tagId) => {
    setSelectedPreferredTagIds((prev) => (
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    ))
  }

  const handleSavePreferredTags = async () => {
    setSavingTags(true)
    try {
      const response = await blogAPI.setPreferredTags(selectedPreferredTagIds)
      if (response?.IsSuccess === false) {
        toast.error(response?.Message || t('errors.unexpectedError'))
        return
      }
      toast.success(isRTL ? 'تم حفظ الوسوم المفضلة' : 'Preferred tags saved')
      await loadPreferredTags()
    } catch {
      toast.error(isRTL ? 'فشل حفظ الوسوم المفضلة' : 'Failed to save preferred tags')
    } finally {
      setSavingTags(false)
    }
  }

  const tagsUsage = useMemo(() => {
    const counts = new Map()
    blogs.forEach((blog) => {
      ;(blog.tags || []).forEach((tag) => {
        counts.set(tag, (counts.get(tag) || 0) + 1)
      })
    })
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [blogs])

  const availableTagNames = useMemo(() => {
    const names = [
      ...preferredTags.map((tag) => tag?.Name).filter(Boolean),
      ...tagsUsage.map((item) => item.name).filter(Boolean),
      ...createdTagNames,
      ...TAG_SUGGESTIONS,
    ]

    return [...new Set(names.map((name) => String(name).trim()).filter(Boolean))]
  }, [preferredTags, tagsUsage, createdTagNames])

  const filtered = blogs.filter(b =>
    !search || b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  )

  const stats = {
    total: blogs.length,
    featured: blogs.filter(b => b.featured).length,
    tags: [...new Set(blogs.flatMap(b => b.tags))].length,
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-2xl font-bold text-text-heading flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <ArticleIcon className="text-primary" style={{ width: 22, height: 22 }} />
            </div>
            {t('blogs.adminTitle')}
          </h1>
          <p className="text-text-muted mt-1 text-sm">{t('blogs.adminSubtitle')}</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 shadow-lg shadow-primary/20">
          <Plus style={{ width: 18, height: 18 }} />
          {t('blogs.addNew')}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-text-muted`}
          style={{ width: 18, height: 18 }}
        />
        <input
          type="text"
          placeholder={t('blogs.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`w-full ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 bg-background-paper border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-text transition-all`}
        />
      </div>

      {/* Tag Management */}
      <div className="rounded-2xl border border-border bg-background-paper p-5 space-y-4">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-lg font-bold text-text-heading">{isRTL ? 'إدارة الوسوم' : 'Tag Management'}</h2>
          <Button variant="outline" size="sm" onClick={handleSavePreferredTags} disabled={savingTags || tagsLoading}>
            {savingTags ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ الوسوم المفضلة' : 'Save Preferred Tags')}
          </Button>
        </div>

        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder={isRTL ? 'أدخل اسم وسم جديد' : 'Enter new tag name'}
            className="flex-1 px-4 py-2 border border-border rounded-xl bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Button onClick={handleCreateTag} disabled={creatingTag || !newTagName.trim()}>
            {creatingTag ? (isRTL ? 'جاري الإنشاء...' : 'Creating...') : (isRTL ? 'إنشاء وسم' : 'Create Tag')}
          </Button>
        </div>

        {tagsLoading ? (
          <p className="text-sm text-text-muted">{isRTL ? 'جاري تحميل الوسوم...' : 'Loading tags...'}</p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-text-muted">{isRTL ? 'اختر الوسوم المفضلة:' : 'Choose preferred tags:'}</p>
            <div className="flex flex-wrap gap-2">
              {preferredTags.length > 0 ? (
                preferredTags.map((tag) => {
                  const selected = selectedPreferredTagIds.includes(tag.TagID)
                  return (
                    <button
                      key={tag.TagID}
                      onClick={() => togglePreferredTag(tag.TagID)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                        selected
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : 'bg-background-subtle text-text-muted border-border hover:text-text-heading'
                      }`}
                    >
                      {tag.Name}
                    </button>
                  )
                })
              ) : (
                <p className="text-sm text-text-muted">{isRTL ? 'لا توجد وسوم بعد' : 'No tags found yet'}</p>
              )}
            </div>

            {tagsUsage.length > 0 && (
              <div>
                <p className="text-sm text-text-muted mb-2">{isRTL ? 'استخدام الوسوم في المقالات:' : 'Tag usage across articles:'}</p>
                <div className="flex flex-wrap gap-2">
                  {tagsUsage.map((item) => (
                    <span key={item.name} className="text-xs px-2.5 py-1 rounded-full bg-background-subtle border border-border text-text-muted">
                      {item.name} ({item.count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center bg-background-subtle/30 rounded-2xl border-2 border-dashed border-border"
        >
          <ArticleIcon className="text-text-muted opacity-20 mb-4" style={{ width: 64, height: 64 }} />
          <h3 className="text-xl font-bold text-text-heading mb-2">
            {search ? t('blogs.noResults') : t('blogs.noArticles')}
          </h3>
          <p className="text-text-muted text-sm mb-6">
            {search ? t('blogs.noResultsDesc') : t('blogs.noArticlesDesc')}
          </p>
          {!search && (
            <Button onClick={handleOpenAdd} className="gap-2">
              <Plus style={{ width: 16, height: 16 }} />
              {t('blogs.addNew')}
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map(blog => (
              <BlogCard
                key={blog.id}
                blog={blog}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Form Modal */}
      <BlogFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingBlog(null) }}
        onSave={handleSave}
        initial={editingBlog}
        availableTags={availableTagNames}
        key={editingBlog?.id || 'new'}
      />
    </div>
  )
}
