import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer'
import '@cyntler/react-doc-viewer/dist/index.css'
import { FileText, FileText as FilePdf, Image as FileImage, Eye, GraduationCap, Stethoscope, BadgeInfo as BadgeIcon, FolderOpen, X } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { documentsAPI } from '../../lib/api'

const DOCUMENT_CATEGORIES = [
  { key: 'certificates', labelKey: 'doctor.docs.certificates', icon: GraduationCap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { key: 'documents',    labelKey: 'doctor.docs.documents',    icon: FileText,        color: 'text-green-500', bg: 'bg-green-500/10' },
  { key: 'ids',          labelKey: 'doctor.docs.ids',          icon: BadgeIcon,       color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { key: 'other',        labelKey: 'doctor.docs.other',        icon: FolderOpen,      color: 'text-orange-500', bg: 'bg-orange-500/10' },
]

const CATEGORY_LABELS_FALLBACK = {
  certificates: 'Certificates & Degrees',
  documents:    'Documents',
  ids:          'ID',
  other:        'Other Documents',
}

const EXTENSION_MIME_MAP = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
  csv: 'text/csv',
  json: 'application/json',
  xml: 'application/xml',
}

const OFFICE_EXTENSIONS = new Set(['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'])

const getFileExtension = (value = '') => {
  const clean = value.split('?')[0].split('#')[0]
  const extension = clean.split('.').pop()?.toLowerCase()
  return extension || ''
}

const inferMimeType = ({ type, name, fileUrl, dataUrl }) => {
  if (type) return type
  const fromDataUrl = dataUrl?.match(/^data:([^;]+);/)?.[1]
  if (fromDataUrl) return fromDataUrl
  const extension = getFileExtension(name || fileUrl || '')
  return EXTENSION_MIME_MAP[extension] || 'application/octet-stream'
}

function getFileIcon(mimeType) {
  if (!mimeType) return FileText
  if (mimeType.includes('pdf')) return FilePdf
  if (mimeType.startsWith('image/')) return FileImage
  return FileText
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
      if (value === 1) return 'certificates'
      if (value === 2) return 'documents'
      if (value === 3) return 'ids'
      return 'other'
    }

    const fetchDocs = async () => {
      if (!doctorId) return

      const grouped = {
        certificates: [],
        documents: [],
        ids: [],
        other: [],
      }

      try {
        const response = await documentsAPI.getDocumentsByOwner(doctorId, 1, 100)
        const items = response?.Data?.Items || []

        items.forEach((item) => {
          const categoryKey = mapCategory(item.DocumentType)
          const fileName = item.FileName || item.Title || 'document'
          const fileUrl = item.FileUrl || ''
          grouped[categoryKey].push({
            id: String(item.DocumentID),
            name: fileName,
            type: inferMimeType({
              type: item.MimeType || item.ContentType || '',
              name: fileName,
              fileUrl,
            }),
            fileUrl,
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
  const previewSource = previewFile ? (previewFile.fileUrl || previewFile.dataUrl || '') : ''
  const previewExtension = getFileExtension(previewFile?.name || previewSource)
  const previewMimeType = previewFile ? inferMimeType(previewFile) : ''
  const isImagePreview = previewMimeType.startsWith('image/')
  const isPdfPreview = previewMimeType === 'application/pdf' || previewExtension === 'pdf'
  const isOfficePreview = OFFICE_EXTENSIONS.has(previewExtension)
  const canUseOfficeWebViewer = isOfficePreview && /^https?:\/\//i.test(previewSource)
  const officeViewerUrl = canUseOfficeWebViewer
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewSource)}`
    : ''
  const docViewerDocuments = previewSource
    ? [{
        uri: previewSource,
        fileType: previewExtension || undefined,
        fileName: previewFile?.name,
      }]
    : []

  return (
    <div className="bg-background-paper border border-border rounded-2xl overflow-hidden mt-6 mb-8">
      <div className="p-5 border-b border-border bg-background-subtle/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-text-heading">
              {label('patient.doctorCredentials', 'Therapist Credentials')}
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
                    {file.uploadedAt && (
                      <p className="text-xs text-text-muted mt-0.5">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    )}
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
                <p className="font-semibold text-text truncate pe-4">{previewFile.name}</p>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-1.5 hover:bg-background-paper rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              <div className="p-4 overflow-auto max-h-[calc(85vh-64px)] flex items-center justify-center bg-background">
                {isImagePreview ? (
                  <img
                    src={previewSource}
                    alt={previewFile.name}
                    className="max-w-full max-h-full rounded-xl object-contain"
                  />
                ) : isPdfPreview ? (
                  <iframe
                    src={previewSource}
                    className="w-full h-[60vh] rounded-xl border border-border"
                    title={previewFile.name}
                  />
                ) : canUseOfficeWebViewer ? (
                  <iframe
                    src={officeViewerUrl}
                    className="w-full h-[60vh] rounded-xl border border-border"
                    title={previewFile.name}
                  />
                ) : docViewerDocuments.length > 0 ? (
                  <div className="w-full h-[60vh] rounded-xl border border-border overflow-hidden">
                    <DocViewer
                      key={previewSource}
                      pluginRenderers={DocViewerRenderers}
                      documents={docViewerDocuments}
                      config={{
                        header: {
                          disableHeader: true,
                          disableFileName: true,
                          retainURLParams: true,
                        },
                      }}
                      style={{ height: '100%' }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-text-muted mx-auto mb-3 opacity-30" />
                    <p className="text-text-muted text-sm">
                      {label('doctor.docs.noPreview', 'Preview not available')}
                    </p>
                    {previewSource && (
                      <a
                        href={previewSource}
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
