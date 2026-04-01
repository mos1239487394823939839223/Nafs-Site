import { useState, useEffect, useCallback } from 'react'
import { blogAPI } from '../lib/api'

const STORAGE_KEY = 'nafs_blogs_fallback'

const SEED_BLOGS = [
  {
    id: 'seed-1',
    title: 'كيف تستعد لأول جلسة علاج نفسي؟',
    description: 'الجلسة الأولى مع المعالج النفسي قد تبدو مثيرة للقلق، لكنها خطوة شجاعة نحو الصحة. في هذا المقال نشرح ما يمكن توقعه وكيف تستعد بشكل جيد لتحقيق أقصى استفادة.',
    tags: ['الصحة النفسية', 'العلاج النفسي', 'نصائح'],
    author: 'فريق نفس',
    createdAt: new Date('2025-01-10').toISOString(),
    featured: true,
  },
  {
    id: 'seed-2',
    title: 'علامات القلق التي يجب الانتباه إليها',
    description: 'القلق جزء طبيعي من الحياة، لكن حين يصبح مزمناً يحتاج إلى اهتمام. تعرف على أبرز علامات اضطراب القلق وكيف يمكن التعامل معه بفعالية.',
    tags: ['القلق', 'الصحة النفسية', 'توعية'],
    author: 'فريق نفس',
    createdAt: new Date('2025-01-05').toISOString(),
    featured: false,
  },
]

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function pickData(payload) {
  return payload?.Data ?? payload?.data ?? null
}

function pickItems(payload) {
  const data = pickData(payload)
  if (Array.isArray(data?.Items)) return data.Items
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(payload?.Items)) return payload.Items
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

export function useBlogsStore() {
  const [blogs, setBlogs] = useState([])
  const [blogLoadError, setBlogLoadError] = useState('')

  const mapSummary = useCallback((item) => ({
    id: String(item.BlogID ?? item.Id ?? item.id),
    title: item.Title ?? item.title ?? '',
    description: item.Body ?? item.body ?? item.Summary ?? item.summary ?? '',
    tags: (item.Tags || item.tags || []).map((t) => t.Name ?? t.name).filter(Boolean),
    tagItems: (item.Tags || item.tags || []).map((t) => ({ id: t.TagID ?? t.tagID ?? t.id, name: t.Name ?? t.name })).filter((t) => t.id && t.name),
    author: item.AuthorName ?? item.authorName ?? item.Author ?? item.author ?? 'Nafs Team',
    createdAt: item.CreatedAt ?? item.createdAt ?? new Date().toISOString(),
    featured: false,
  }), [])

  const loadFromApi = useCallback(async () => {
    try {
      const response = await blogAPI.getPersonalizedBlogs(1, 100)
      const items = pickItems(response)
      if (response?.IsSuccess !== false && items.length > 0) {
        const mapped = items.map(mapSummary)
        setBlogs(mapped)
        setBlogLoadError('')
        return true
      }
    } catch {
      // Some roles may not have access to personalized feed. Continue to generic blogs.
    }

    const fallbackResponse = await blogAPI.getBlogs(1, 100)
    const fallbackItems = pickItems(fallbackResponse)
    if (fallbackResponse?.IsSuccess !== false && Array.isArray(fallbackItems)) {
      const mapped = fallbackItems.map(mapSummary)
      setBlogs(mapped)
      setBlogLoadError('')
      return true
    }

    setBlogLoadError('BLOG_LIST_API_FAILED')

    return false
  }, [mapSummary])

  const loadFallback = useCallback(() => {
    const stored = readStorage()
    if (stored) {
      setBlogs(stored)
      return
    }
    writeStorage(SEED_BLOGS)
    setBlogs(SEED_BLOGS)
  }, [])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const ok = await loadFromApi()
        if (!ok && active) {
          setBlogs([])
        }
      } catch {
        if (active) {
          setBlogLoadError('BLOG_LIST_API_FAILED')
          setBlogs([])
        }
      }
    }
    load()
    return () => { active = false }
  }, [loadFromApi])

  // Sync across tabs
  useEffect(() => {
    const handler = (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          setBlogs(JSON.parse(e.newValue) || [])
        } catch {}
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const persist = useCallback((next) => {
    writeStorage(next)
    setBlogs(next)
  }, [])

  const ensureTagIds = useCallback(async (tagNames = [], currentTagItems = []) => {
    const existingMap = new Map((currentTagItems || []).map((tag) => [tag.name?.toLowerCase(), tag.id]))
    const ids = []

    for (const rawName of tagNames) {
      const name = String(rawName || '').trim()
      if (!name) continue

      const knownId = existingMap.get(name.toLowerCase())
      if (knownId) {
        ids.push(knownId)
        continue
      }

      try {
        const created = await blogAPI.createTag(name)
        const newId = created?.Data
        if (newId) ids.push(newId)
      } catch {
        // Ignore individual tag creation failures and proceed with available tags.
      }
    }

    return ids
  }, [])

  const addBlog = useCallback(async (data) => {
    const tagIds = await ensureTagIds(data.tags || [])
    const createResponse = await blogAPI.createBlog({
      Title: data.title,
      Body: data.description,
      Images: null,
      TagIDs: tagIds,
    })

    if (createResponse?.IsSuccess === false) {
      throw new Error(createResponse?.Message || 'CREATE_BLOG_FAILED')
    }

    const refreshed = await loadFromApi()
    if (!refreshed) {
      const createdData = pickData(createResponse)
      const createdId = createdData?.BlogID ?? createdData?.Id ?? createdData
      const optimistic = {
        id: String(createdId ?? `blog-${Date.now()}`),
        title: data.title,
        description: data.description,
        tags: data.tags || [],
        tagItems: [],
        author: data.author || 'Admin',
        createdAt: new Date().toISOString(),
        featured: false,
      }
      setBlogs((prev) => [optimistic, ...prev])
    }

    return createResponse
  }, [ensureTagIds, loadFromApi])

  const updateBlog = useCallback(async (id, data) => {
    const current = blogs.find((blog) => String(blog.id) === String(id))
    const tagIds = await ensureTagIds(data.tags || [], current?.tagItems || [])
    const response = await blogAPI.updateBlog(id, {
      Title: data.title,
      Body: data.description,
      Images: null,
      TagIDs: tagIds,
    })

    if (response?.IsSuccess === false) {
      throw new Error(response?.Message || 'UPDATE_BLOG_FAILED')
    }

    const refreshed = await loadFromApi()
    if (!refreshed) {
      setBlogs((prev) => prev.map((blog) => (
        String(blog.id) === String(id)
          ? { ...blog, title: data.title, description: data.description, tags: data.tags || blog.tags }
          : blog
      )))
    }

    return response
  }, [blogs, ensureTagIds, loadFromApi])

  const deleteBlog = useCallback(async (id) => {
    const response = await blogAPI.deleteBlog(id)
    if (response?.IsSuccess === false) {
      throw new Error(response?.Message || 'DELETE_BLOG_FAILED')
    }

    const refreshed = await loadFromApi()
    if (!refreshed) {
      setBlogs((prev) => prev.filter((blog) => String(blog.id) !== String(id)))
    }

    return response
  }, [loadFromApi])

  const toggleFeatured = useCallback((id) => {
    persist(blogs.map(b => b.id === id ? { ...b, featured: !b.featured } : b))
  }, [blogs, persist])

  return { blogs, blogLoadError, addBlog, updateBlog, deleteBlog, toggleFeatured }
}
