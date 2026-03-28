import { useEffect, useRef, useState } from 'react'
import { UploadFile, Description as FileText, Visibility, DeleteOutline, FolderOpen } from '@mui/icons-material'
import Button from '../ui/Button'
import { useToast } from '../ui/Toast'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/Dialog'

const ACCEPTED_DOCUMENT_TYPES = 'image/*,.pdf,.doc,.docx,.txt,.rtf,.xls,.xlsx,.ppt,.pptx'
const DEFAULT_BUTTON_LABEL = 'Add Certificate && docementation'
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024

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
  title = 'Certificates & Documentation',
  buttonLabel = DEFAULT_BUTTON_LABEL,
  emptyMessage = 'No uploaded certificates or documents yet.',
}) {
  const toast = useToast()
  const fileInputRef = useRef(null)
  const [documents, setDocuments] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    setDocuments(safeReadLocalDocuments(storageKey))
  }, [storageKey])

  const persistDocuments = (nextDocuments) => {
    setDocuments(nextDocuments)
    localStorage.setItem(storageKey, JSON.stringify(nextDocuments))
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
          toast.error(`${file.name} is larger than 2MB and was skipped.`)
          return false
        }
        return true
      })

      const uploaded = await Promise.all(validFiles.map(async (file) => {
        const dataUrl = await toDataUrl(file)
        return {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          uploadedAt: new Date().toISOString(),
          dataUrl,
        }
      }))

      if (uploaded.length === 0) return

      const nextDocuments = [...documents, ...uploaded]
      persistDocuments(nextDocuments)
      toast.success(`${uploaded.length} file(s) uploaded locally.`)
    } catch {
      toast.error('Failed to upload selected files.')
    } finally {
      event.target.value = ''
      setIsUploading(false)
    }
  }

  const handleViewDocument = (documentItem) => {
    const query = new URLSearchParams({
      storageKey,
      docId: documentItem.id,
    }).toString()

    window.open(`/document-viewer?${query}`, '_blank', 'noopener,noreferrer')
  }

  const handleRemoveDocument = (documentId) => {
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
        <span className="text-xs text-text-muted">{documents.length} file(s)</span>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Upload and keep files in local storage until backend endpoint is ready.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleOpenFilePicker} disabled={isUploading}>
                <UploadFile className="w-4 h-4" />
                {isUploading ? 'Uploading...' : buttonLabel}
              </Button>
              {documents.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearAll}>
                  <DeleteOutline className="w-4 h-4" />
                  Clear All
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
                      <p className="text-xs text-text-muted mt-1">
                        {formatBytes(documentItem.size)} | {new Date(documentItem.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDocument(documentItem)}>
                        <Visibility className="w-4 h-4" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveDocument(documentItem.id)}>
                        <DeleteOutline className="w-4 h-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
