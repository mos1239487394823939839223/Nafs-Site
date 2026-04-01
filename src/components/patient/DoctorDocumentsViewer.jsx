import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Description as FileText,
  PictureAsPdf as FilePdf,
  Image as FileImage,
  Visibility as Eye,
  School as GraduationCap,
  MedicalServices as Stethoscope,
  Badge as BadgeIcon,
  FolderOpen,
  Close as X,
} from '@mui/icons-material'
import { useLanguage } from '../../contexts/LanguageContext'
import { documentsAPI } from '../../lib/api'

const DOCUMENT_CATEGORIES = [
  { key: 'certificates', labelKey: 'doctor.docs.certificates', icon: GraduationCap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { key: 'licenses',     labelKey: 'doctor.docs.licenses',     icon: BadgeIcon,       color: 'text-green-500', bg: 'bg-green-500/10' },
  { key: 'medical',      labelKey: 'doctor.docs.medical',      icon: Stethoscope,     color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { key: 'other',        labelKey: 'doctor.docs.other',        icon: FolderOpen,      color: 'text-orange-500', bg: 'bg-orange-500/10' },
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

export default function DoctorDocumentsViewer({ doctorId }) {
  const { t, isRTL } = useLanguage()
  const [docs, setDocs] = useState({})
  const [activeCategory, setActiveCategory] = useState(null)
  const [previewFile, setPreviewFile] = useState(null)

  const label = (key, fallback) => {
    try { const v = t(key); return v && v !== key ? v : fallback } catch { return fallback }
  }

  useEffect(() => {
    const mapCategory = (documentType) => {
      const value = Number(documentType)
      if (value === 0) return 'certificates'
      if (value === 1) return 'licenses'
      if (value === 2) return 'medical'
      return 'other'
    }

    const fetchDocs = async () => {
      if (!doctorId) return

      const grouped = {
        certificates: [],
        licenses: [],
        medical: [],
        other: [],
      }

      try {
        const response = await documentsAPI.getDocumentsByOwner(doctorId, 1, 100)
        const items = response?.Data?.Items || []

        items.forEach((item) => {
          const categoryKey = mapCategory(item.DocumentType)
          grouped[categoryKey].push({
            id: String(item.DocumentID),
            name: item.FileName || item.Title,
            size: 0,
            type: '',
            dataUrl: item.FileUrl,
            uploadedAt: item.UploadedAt,
          })
        })

        setDocs(grouped)

        for (const cat of DOCUMENT_CATEGORIES) {
          if (grouped[cat.key]?.length > 0) {
            setActiveCategory(cat.key)
            break
          }
        }
      } catch {
        setDocs(grouped)
      }
    }

    fetchDocs()
  }, [doctorId])

  const totalCount = Object.values(docs).reduce((acc, arr) => acc + (arr?.length || 0), 0)

  if (totalCount === 0) {
    return null // Don't show anything if doctor hasn't uploaded documents
  }

  const currentCat = activeCategory ? DOCUMENT_CATEGORIES.find(c => c.key === activeCategory) : null
  const currentFiles = activeCategory ? (docs[activeCategory] || []) : []

  return (
    <div className="bg-background-paper border border-border rounded-2xl overflow-hidden mt-6 mb-8">
      <div className="p-5 border-b border-border bg-background-subtle/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-text-heading">
              {label('patient.doctorCredentials', 'Doctor Credentials')}
            </h3>
            <p className="text-sm text-text-muted mt-0.5">
              {label('patient.verifiedDocs', 'Verified certificates and licenses')}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {DOCUMENT_CATEGORIES.map(cat => {
            const count = docs[cat.key]?.length || 0
            if (count === 0) return null

            const isActive = activeCategory === cat.key
            const Icon = cat.icon
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                  isActive
                    ? `${cat.bg} ${cat.color} border-${cat.color.split('-')[1]}-500/20 shadow-sm`
                    : 'text-text-muted border-border hover:bg-background-subtle'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label(cat.labelKey, CATEGORY_LABELS_FALLBACK[cat.key])}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? `${cat.bg} ${cat.color}` : 'bg-border text-text-muted'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Files Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {currentFiles.map((file) => {
              const FileIcon = getFileIcon(file.type)
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-background-subtle transition-all cursor-pointer group"
                  onClick={() => setPreviewFile(file)}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${currentCat.bg} ${currentCat.color}`}>
                    <FileIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-heading truncate text-sm" title={file.name}>{file.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{formatBytes(file.size)}</p>
                  </div>
                  <div className="text-text-muted group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 p-1">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

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
              <div className="flex items-center justify-between p-4 border-b border-border bg-background-subtle">
                <p className="font-semibold text-text truncate pr-4">{previewFile.name}</p>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-1.5 hover:bg-background-paper rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              <div className="p-4 overflow-auto max-h-[calc(85vh-64px)] flex items-center justify-center bg-background">
                {previewFile.type?.startsWith('image/') ? (
                  <img
                    src={previewFile.dataUrl}
                    alt={previewFile.name}
                    className="max-w-full max-h-full rounded-xl object-contain"
                  />
                ) : previewFile.type === 'application/pdf' ? (
                  <iframe
                    src={previewFile.dataUrl}
                    className="w-full h-[60vh] rounded-xl border border-border"
                    title={previewFile.name}
                  />
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-text-muted mx-auto mb-3 opacity-30" />
                    <p className="text-text-muted text-sm">
                      {label('doctor.docs.noPreview', 'Preview not available')}
                    </p>
                    {previewFile.dataUrl && (
                      <a
                        href={previewFile.dataUrl}
                        download={previewFile.name}
                        className="mt-3 inline-block px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-dark transition-colors"
                      >
                        {label('common.download', 'Download')}
                      </a>
                    )}
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
