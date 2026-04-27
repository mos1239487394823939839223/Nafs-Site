import { useEffect, useRef, useState } from 'react'
import { Upload, FileText, Eye, Trash2, FolderOpen } from 'lucide-react'
import Button from '../ui/Button'
import { useToast } from '../ui/Toast'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/Dialog'
import { useLanguage } from '../../contexts/LanguageContext'
import { documentsAPI } from '../../lib/api'

const ACCEPTED_DOCUMENT_TYPES = 'image/*,.pdf,.doc,.docx,.txt,.rtf,.xls,.xlsx,.ppt,.pptx'
const DEFAULT_BUTTON_LABEL = 'Add Certificate && docementation'
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024

const normalizeDocumentType = (value) => {
  const parsed = Number(value)
  return [1, 2, 3].includes(parsed) ? parsed : 1
}

const getFileExtension = (value = '') => {
  const clean = value.split('?')[0].split('#')[0]
  return clean.split('.').pop()?.toLowerCase() || ''
}

const inferMimeTypeFromName = (fileName = '') => {
  const extension = getFileExtension(fileName)
  const mimeByExtension = {
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
  return mimeByExtension[extension] || 'application/octet-stream'
}

const safeReadLocalDocuments = (storageKey) => {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const toDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = () => reject(new Error('FILE_READ_ERROR'))
  reader.readAsDataURL(file)
})

const formatBytes = (value) => {
  if (!Number.isFinite(value) || value <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = value
  let index = 0
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index += 1
  }
  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}

export default function LocalDocumentsManager({
  storageKey,
  ownerUserId,
  documentType = 1,
  allowDocumentTypeSelection = false,
  title = 'Certificates & Documentation',
  buttonLabel = DEFAULT_BUTTON_LABEL,
  emptyMessage = 'No uploaded certificates or documents yet.',
}) {
  const toast = useToast()
  const { t } = useLanguage()
  const fileInputRef = useRef(null)
  const [documents, setDocuments] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDocumentType, setSelectedDocumentType] = useState(normalizeDocumentType(documentType))
  const isRemoteMode = Boolean(ownerUserId)

  useEffect(() => {
    setSelectedDocumentType(normalizeDocumentType(documentType))
  }, [documentType])

  useEffect(() => {
    const loadDocuments = async () => {
      if (isRemoteMode) {
        try {
          const response = await documentsAPI.getDocumentsByOwner(ownerUserId, 1, 100)
          if (response?.IsSuccess !== false && response?.Data?.Items) {
            const mapped = response.Data.Items.map((item) => ({
              id: String(item.DocumentID),
              name: item.FileName || item.Title,
              title: item.Title,
              type: item.MimeType || item.ContentType || inferMimeTypeFromName(item.FileName || item.Title || ''),
              size: 0,
              uploadedAt: item.UploadedAt,
              fileUrl: item.FileUrl,
            }))
            setDocuments(mapped)
            return
          }
        } catch {
          // If API fails, fallback to local storage to avoid blocking UI.
        }
      }

      setDocuments(safeReadLocalDocuments(storageKey))
    }

    loadDocuments()
  }, [storageKey, isRemoteMode, ownerUserId])

  const persistDocuments = (nextDocuments) => {
    setDocuments(nextDocuments)
    if (!isRemoteMode) {
      localStorage.setItem(storageKey, JSON.stringify(nextDocuments))
    }
  }

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleFilesSelected = async (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setIsUploading(true)
    try {
      const validFiles = files.filter((file) => {
        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast.error(`${file.name} ${t('documents.fileTooLarge2mb')}`)
          return false
        }
        return true
      })

      let uploaded = []

      if (isRemoteMode) {
        uploaded = await Promise.all(validFiles.map(async (file) => {
          const response = await documentsAPI.uploadDocument({
            file,
            ownerUserId,
            title: file.name,
            documentType: selectedDocumentType,
          })

          if (response?.IsSuccess === false) {
            throw new Error(response?.Message || 'DOCUMENT_UPLOAD_FAILED')
          }

          return {
            id: String(response?.Data?.DocumentID || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`),
            name: response?.Data?.FileName || file.name,
            title: file.name,
            documentType: selectedDocumentType,
            type: file.type || 'application/octet-stream',
            size: file.size,
            uploadedAt: new Date().toISOString(),
            fileUrl: response?.Data?.FileUrl,
          }
        }))
      } else {
        uploaded = await Promise.all(validFiles.map(async (file) => {
          const dataUrl = await toDataUrl(file)
          return {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
            name: file.name,
            documentType: selectedDocumentType,
            type: file.type || 'application/octet-stream',
            size: file.size,
            uploadedAt: new Date().toISOString(),
            dataUrl,
          }
        }))
      }

      if (uploaded.length === 0) return

      const nextDocuments = [...documents, ...uploaded]
      persistDocuments(nextDocuments)
      toast.success(`${uploaded.length} ${isRemoteMode ? (t('documents.filesUploaded') || 'files uploaded') : t('documents.filesUploadedLocally')}`)
    } catch {
      toast.error(t('documents.uploadFailed'))
    } finally {
      event.target.value = ''
      setIsUploading(false)
    }
  }

  const handleViewDocument = (documentItem) => {
    if (documentItem.fileUrl) {
      const query = new URLSearchParams({
        fileUrl: documentItem.fileUrl,
        fileName: documentItem.name || 'document',
        mimeType: documentItem.type || inferMimeTypeFromName(documentItem.name || ''),
      }).toString()

      window.open(`/document-viewer?${query}`, '_blank', 'noopener,noreferrer')
      return
    }

    const query = new URLSearchParams({
      storageKey,
      docId: documentItem.id,
    }).toString()

    window.open(`/document-viewer?${query}`, '_blank', 'noopener,noreferrer')
  }

  const handleRemoveDocument = async (documentId) => {
    if (isRemoteMode) {
      try {
        const response = await documentsAPI.deleteDocument(documentId)
        if (response?.IsSuccess === false) {
          toast.error(response?.Message || t('documents.deleteFailed'))
          return
        }
      } catch {
        toast.error(t('documents.deleteFailed'))
        return
      }
    }

    const nextDocuments = documents.filter((doc) => doc.id !== documentId)
    persistDocuments(nextDocuments)
  }

  const handleClearAll = () => {
    persistDocuments([])
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_DOCUMENT_TYPES}
        className="hidden"
        onChange={handleFilesSelected}
      />

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <UploadFile className="w-4 h-4" />
          {buttonLabel}
        </Button>
        <span className="text-xs text-text-muted">{documents.length} {t('documents.filesCountSuffix')}</span>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {t('documents.modalDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4">
            {allowDocumentTypeSelection && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-muted">
                  {t('documents.typeLabel') || 'Document Type'}
                </label>
                <select
                  value={selectedDocumentType}
                  onChange={(e) => setSelectedDocumentType(normalizeDocumentType(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value={1}>{t('documents.typeCertificates') || 'Certificate'}</option>
                  <option value={2}>{t('documents.typeDocument') || 'Document'}</option>
                  <option value={3}>{t('documents.typeId') || 'ID'}</option>
                </select>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleOpenFilePicker} disabled={isUploading}>
                <UploadFile className="w-4 h-4" />
                {isUploading ? t('documents.uploading') : buttonLabel}
              </Button>
              {documents.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearAll}>
                  <DeleteOutline className="w-4 h-4" />
                  {t('documents.clearAll')}
                </Button>
              )}
            </div>

            {documents.length === 0 ? (
              <div className="rounded-xl border border-border-light p-6 text-center text-text-muted">
                <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-60" />
                <p>{emptyMessage}</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[45vh] overflow-auto pr-1">
                {documents.map((documentItem) => (
                  <div key={documentItem.id} className="rounded-xl border border-border-light bg-background-paper p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-text-heading font-medium">
                        <FileText className="w-4 h-4 shrink-0" />
                        <span className="truncate">{documentItem.name}</span>
                      </div>
                      {(documentItem.size > 0 || documentItem.uploadedAt) && (
                        <p className="text-xs text-text-muted mt-1">
                          {[documentItem.size > 0 ? formatBytes(documentItem.size) : null, documentItem.uploadedAt ? new Date(documentItem.uploadedAt).toLocaleString() : null]
                            .filter(Boolean)
                            .join(' | ')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDocument(documentItem)}>
                        <Visibility className="w-4 h-4" />
                        {t('common.view')}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveDocument(documentItem.id)}>
                        <DeleteOutline className="w-4 h-4" />
                        {t('common.remove')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
