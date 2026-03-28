import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Download, ArrowBack } from '@mui/icons-material'
import { renderAsync } from 'docx-preview'
import Button from '../../components/ui/Button'
import { useLanguage } from '../../contexts/LanguageContext'

const readDocuments = (storageKey) => {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const getFileTypeFromName = (fileName = '') => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return extension || undefined
}

const getMimeTypeFromDataUrl = (dataUrl = '') => {
  const match = dataUrl.match(/^data:([^;]+);/)
  return match?.[1] || ''
}

const dataUrlToBlob = async (dataUrl) => {
  const response = await fetch(dataUrl)
  return response.blob()
}

const downloadDataUrl = (dataUrl, fileName) => {
  const anchor = document.createElement('a')
  anchor.href = dataUrl
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}

export default function DocumentViewer() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const storageKey = searchParams.get('storageKey') || ''
  const docId = searchParams.get('docId') || ''
  const docxContainerRef = useRef(null)
  const [docxError, setDocxError] = useState('')

  const documentItem = useMemo(() => {
    if (!storageKey || !docId) return null
    const allDocuments = readDocuments(storageKey)
    return allDocuments.find((doc) => doc.id === docId) || null
  }, [storageKey, docId])

  const extension = useMemo(() => getFileTypeFromName(documentItem?.name || ''), [documentItem])
  const mimeType = useMemo(() => getMimeTypeFromDataUrl(documentItem?.dataUrl || ''), [documentItem])
  const isDocx = extension === 'docx'
  const isInlinePreviewSupported = useMemo(() => {
    if (!documentItem) return false
    if (isDocx) return true
    if (mimeType.startsWith('image/')) return true
    if (mimeType === 'application/pdf') return true
    if (mimeType.startsWith('text/')) return true
    if (['txt', 'csv', 'json', 'xml', 'md', 'html'].includes(extension || '')) return true
    return false
  }, [documentItem, extension, isDocx, mimeType])

  useEffect(() => {
    if (!isDocx || !documentItem || !docxContainerRef.current) return

    let cancelled = false
    setDocxError('')
    docxContainerRef.current.innerHTML = ''

    const renderDocx = async () => {
      try {
        const blob = await dataUrlToBlob(documentItem.dataUrl)
        const buffer = await blob.arrayBuffer()
        if (cancelled || !docxContainerRef.current) return

        await renderAsync(buffer, docxContainerRef.current, null, {
          className: 'docx-preview-container',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: true,
          useBase64URL: true,
          renderChanges: true,
          breakPages: true,
        })
      } catch {
        if (!cancelled) {
          setDocxError(t('documents.docxRenderFailed'))
        }
      }
    }

    renderDocx()

    return () => {
      cancelled = true
      if (docxContainerRef.current) {
        docxContainerRef.current.innerHTML = ''
      }
    }
  }, [documentItem, isDocx])

  if (!documentItem) {
    return (
      <div className="min-h-screen bg-background text-text flex items-center justify-center p-6">
        <div className="max-w-lg w-full rounded-2xl border border-border bg-background-paper p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold text-text-heading">File Not Found</h1>
          <p className="text-text-muted">{t('documents.fileNotFoundDescription')}</p>
          <Button onClick={() => window.close()}>
            <ArrowBack className="w-4 h-4" />
            {t('documents.closeTab')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4">
        <div className="rounded-2xl border border-border bg-background-paper p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-text-heading truncate">{documentItem.name}</h1>
            <p className="text-sm text-text-muted">{t('documents.openedInNewTab')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => downloadDataUrl(documentItem.dataUrl, documentItem.name)}>
              <Download className="w-4 h-4" />
              {t('common.download')}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border overflow-hidden bg-background-paper" style={{ minHeight: '80vh' }}>
          {isDocx ? (
            <div className="h-[80vh] overflow-auto p-4 bg-white text-black">
              {docxError ? (
                <div className="h-full flex items-center justify-center text-sm text-red-600">{docxError}</div>
              ) : (
                <div ref={docxContainerRef} />
              )}
            </div>
          ) : isInlinePreviewSupported ? (
            <iframe
              title={documentItem.name}
              src={documentItem.dataUrl}
              className="w-full h-[80vh]"
            />
          ) : (
            <div className="h-[80vh] flex items-center justify-center text-center p-8">
              <div>
                <h2 className="text-xl font-semibold text-text-heading mb-2">{t('documents.previewNotAvailable')}</h2>
                <p className="text-text-muted mb-4">{t('documents.previewNotAvailableDescription')}</p>
                <div className="flex items-center justify-center gap-2">
                  <Button variant="outline" onClick={() => downloadDataUrl(documentItem.dataUrl, documentItem.name)}>
                    <Download className="w-4 h-4" />
                    {t('common.download')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
