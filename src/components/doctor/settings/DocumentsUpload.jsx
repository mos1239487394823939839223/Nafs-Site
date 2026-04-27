import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload as UploadIcon, Trash2, FileText, FileText as FilePdf, Image as FileImage, Eye, CheckCircle as CheckCircle2, GraduationCap, Stethoscope, BadgeInfo as BadgeIcon, FolderOpen, X } from 'lucide-react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useToast } from '../../ui/Toast'

const DOCUMENT_CATEGORIES = [
  { key: 'certificates', labelKey: 'doctor.docs.certificates', icon: GraduationCap, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { key: 'licenses',     labelKey: 'doctor.docs.licenses',     icon: BadgeIcon,       color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  { key: 'medical',      labelKey: 'doctor.docs.medical',      icon: Stethoscope,     color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { key: 'other',        labelKey: 'doctor.docs.other',        icon: FolderOpen,      color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
]

const CATEGORY_LABELS_FALLBACK = {
  certificates: 'Certificates & Degrees',
  licenses:     'Medical Licenses',
  medical:      'Medical Papers',
  other:        'Other Documents',
}

function getFileIcon(mimeType) {
  if (!mimeType) return FileText
  if (mimeType.includes('pdf')) return FilePdf
  if (mimeType.startsWith('image/')) return FileImage
  return FileText
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const STORAGE_KEY = 'doctor_documents_meta'

function loadStoredDocs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveDocs(docs) {
  try {
    // store only metadata (not the blob URLs, they're runtime only)
    const meta = {}
    Object.entries(docs).forEach(([cat, files]) => {
      meta[cat] = files.map(f => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type,
        uploadedAt: f.uploadedAt,
        dataUrl: f.dataUrl || null,
      }))
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meta))
  } catch { /* quota exceeded – silent */ }
}

export default function DocumentsUpload() {
  const { t, isRTL } = useLanguage()
  const toast = useToast()

  // Initialize from localStorage
  const [docs, setDocs] = useState(() => {
    const stored = loadStoredDocs()
    const init = {}
    DOCUMENT_CATEGORIES.forEach(c => { init[c.key] = stored[c.key] || [] })
    return init
  })

  const [activeCategory, setActiveCategory] = useState(DOCUMENT_CATEGORIES[0].key)
  const [dragging, setDragging] = useState(false)
  const [previewFile, setPreviewFile] = useState(null)
  const fileInputRef = useRef(null)

  const label = (key, fallback) => {
    try { const v = t(key); return v && v !== key ? v : fallback } catch { return fallback }
  }

  const currentCat = DOCUMENT_CATEGORIES.find(c => c.key === activeCategory)
  const currentFiles = docs[activeCategory] || []

  const addFiles = (fileList) => {
    const newFiles = Array.from(fileList)
      .filter(f => {
        const ok = f.size <= 10 * 1024 * 1024
        if (!ok) toast.error(`"${f.name}" ${label('doctor.docs.tooLarge', 'exceeds 10 MB limit')}`)
        return ok
      })
      .map(f => {
        const reader = new FileReader()
        return new Promise(resolve => {
          reader.onload = (e) => resolve({
            id: Date.now() + Math.random(),
            name: f.name,
            size: f.size,
            type: f.type,
            uploadedAt: new Date().toISOString(),
            dataUrl: e.target.result,
            objectUrl: URL.createObjectURL(f),
          })
          reader.readAsDataURL(f)
        })
      })

    Promise.all(newFiles).then(resolved => {
      setDocs(prev => {
        const updated = { ...prev, [activeCategory]: [...prev[activeCategory], ...resolved] }
        saveDocs(updated)
        return updated
      })
      toast.success(`${resolved.length} ${label('doctor.docs.filesAdded', 'file(s) added')}`)
    })
  }

  const removeFile = (id) => {
    setDocs(prev => {
      const updated = { ...prev, [activeCategory]: prev[activeCategory].filter(f => f.id !== id) }
      saveDocs(updated)
      return updated
    })
    if (previewFile?.id === id) setPreviewFile(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const totalCount = Object.values(docs).reduce((acc, arr) => acc + arr.length, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <UploadIcon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-text">
            {label('doctor.docs.title', 'Documents & Certificates')}
          </h3>
          <p className="text-sm text-text-muted">
            {label('doctor.docs.subtitle', 'Upload your medical licenses, degrees and certificates')}
            {totalCount > 0 && <span className="ml-2 text-primary font-medium">· {totalCount} {label('doctor.docs.files', 'files')}</span>}
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {DOCUMENT_CATEGORIES.map(cat => {
          const Icon = cat.icon
          const count = docs[cat.key]?.length || 0
          const isActive = activeCategory === cat.key
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                isActive
                  ? `${cat.bg} ${cat.color} ${cat.border} shadow-sm`
                  : 'text-text-muted border-border hover:bg-background-subtle'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label(cat.labelKey, CATEGORY_LABELS_FALLBACK[cat.key])}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${isActive ? `${cat.bg} ${cat.color}` : 'bg-border text-text-muted'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
          dragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border hover:border-primary/50 hover:bg-background-subtle'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={e => addFiles(e.target.files)}
        />
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${dragging ? 'bg-primary text-white scale-110' : `${currentCat.bg} ${currentCat.color}`}`}>
          <UploadIcon className="w-7 h-7" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-text">
            {dragging
              ? label('doctor.docs.dropNow', 'Drop files here')
              : label('doctor.docs.dragOrClick', 'Drag & Drop or Click to Upload')}
          </p>
          <p className="text-sm text-text-muted mt-1">
            {label('doctor.docs.acceptedFormats', 'PDF, JPG, PNG, DOC up to 10MB each')}
          </p>
        </div>
      </div>

      {/* Files List */}
      <AnimatePresence mode="popLayout">
        {currentFiles.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-10"
          >
            <currentCat.icon className={`w-10 h-10 mx-auto mb-2 opacity-20 ${currentCat.color}`} />
            <p className="text-text-muted text-sm">
              {label('doctor.docs.noFiles', 'No files uploaded in this category yet')}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {currentFiles.map((file, idx) => {
              const FileIcon = getFileIcon(file.type)
              const uploadDate = new Date(file.uploadedAt).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
              })
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${currentCat.border} ${currentCat.bg} group`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-background-paper border border-border`}>
                    <FileIcon className={`w-5 h-5 ${currentCat.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text truncate text-sm">{file.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-text-muted">{formatBytes(file.size)}</span>
                      <span className="text-xs text-text-muted">·</span>
                      <span className="text-xs text-text-muted">{uploadDate}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(file.dataUrl || file.objectUrl) && (
                      <button
                        onClick={() => setPreviewFile(file)}
                        className="p-2 hover:bg-background-paper rounded-lg transition-colors text-text-muted hover:text-primary"
                        title={label('common.preview', 'Preview')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-lg transition-colors text-text-muted hover:text-red-500"
                      title={label('common.delete', 'Delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background-paper rounded-2xl shadow-2xl border border-border max-w-3xl w-full max-h-[85vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <p className="font-semibold text-text truncate pr-4">{previewFile.name}</p>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-1.5 hover:bg-background-subtle rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              {/* Preview Content */}
              <div className="p-4 overflow-auto max-h-[calc(85vh-64px)] flex items-center justify-center bg-background">
                {previewFile.type?.startsWith('image/') ? (
                  <img
                    src={previewFile.dataUrl || previewFile.objectUrl}
                    alt={previewFile.name}
                    className="max-w-full max-h-full rounded-xl object-contain"
                  />
                ) : previewFile.type === 'application/pdf' ? (
                  <iframe
                    src={previewFile.dataUrl || previewFile.objectUrl}
                    className="w-full h-[60vh] rounded-xl border border-border"
                    title={previewFile.name}
                  />
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-text-muted mx-auto mb-3 opacity-30" />
                    <p className="text-text-muted text-sm">
                      {label('doctor.docs.noPreview', 'Preview not available for this file type')}
                    </p>
                    <a
                      href={previewFile.dataUrl || previewFile.objectUrl}
                      download={previewFile.name}
                      className="mt-3 inline-block px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-dark transition-colors"
                    >
                      {label('common.download', 'Download')}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
