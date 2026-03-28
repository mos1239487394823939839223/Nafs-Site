import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'nafs_blogs'

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

export function useBlogsStore() {
  const [blogs, setBlogs] = useState(() => {
    const stored = readStorage()
    if (stored) return stored
    writeStorage(SEED_BLOGS)
    return SEED_BLOGS
  })

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

  const addBlog = useCallback((data) => {
    const blog = {
      id: `blog-${Date.now()}`,
      ...data,
      author: data.author || 'Admin',
      createdAt: new Date().toISOString(),
      featured: false,
    }
    persist([blog, ...blogs])
    return blog
  }, [blogs, persist])

  const updateBlog = useCallback((id, data) => {
    persist(blogs.map(b => b.id === id ? { ...b, ...data, updatedAt: new Date().toISOString() } : b))
  }, [blogs, persist])

  const deleteBlog = useCallback((id) => {
    persist(blogs.filter(b => b.id !== id))
  }, [blogs, persist])

  const toggleFeatured = useCallback((id) => {
    persist(blogs.map(b => b.id === id ? { ...b, featured: !b.featured } : b))
  }, [blogs, persist])

  return { blogs, addBlog, updateBlog, deleteBlog, toggleFeatured }
}
