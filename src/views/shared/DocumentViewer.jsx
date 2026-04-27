import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Download, ArrowLeft as ArrowBack } from 'lucide-react'
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer'
import '@cyntler/react-doc-viewer/dist/index.css'
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
  const cleanName = fileName.split('?')[0].split('#')[0]
  const extension = cleanName.split('.').pop()?.toLowerCase()
  return extension || undefined
}

const getMimeTypeFromDataUrl = (dataUrl = '') => {
  const match = dataUrl.match(/^data:([^;]+);/)
  return match?.[1] || ''
}

const OFFICE_EXTENSIONS = new Set(['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'])

const isHttpUrl = (value = '') => /^https?:\/\//i.test(value)

const deriveNameFromUrl = (url = '') => {
  try {
    const pathname = new URL(url).pathname
    const rawName = pathname.split('/').pop() || ''
    return decodeURIComponent(rawName) || 'document'
  } catch {
    return 'document'
  }
}

const downloadFile = (url, fileName) => {
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.target = '_blank'
  anchor.rel = 'noopener noreferrer'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}

export default function DocumentViewer() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const storageKey = searchParams.get('storageKey') || ''
  const docId = searchParams.get('docId') || ''
  const remoteFileUrl = searchParams.get('fileUrl') || ''
  const remoteFileName = searchParams.get('fileName') || ''
  const remoteMimeType = searchParams.get('mimeType') || ''

  const documentItem = useMemo(() => {
    if (remoteFileUrl) {
      return {
        id: 'remote-file',
        name: remoteFileName || deriveNameFromUrl(remoteFileUrl),
        type: remoteMimeType,
        dataUrl: remoteFileUrl,
      }
    }

    if (!storageKey || !docId) return null
    const allDocuments = readDocuments(storageKey)
    return allDocuments.find((doc) => doc.id === docId) || null
  }, [storageKey, docId, remoteFileUrl, remoteFileName, remoteMimeType])

  const sourceUrl = documentItem?.dataUrl || documentItem?.fileUrl || ''

  const extension = useMemo(() => getFileTypeFromName(documentItem?.name || sourceUrl), [documentItem, sourceUrl])
  const mimeType = useMemo(() => {
    if (documentItem?.type) return documentItem.type
    return getMimeTypeFromDataUrl(sourceUrl)
  }, [documentItem, sourceUrl])

  const isPdfPreview = useMemo(() => {
    return mimeType === 'application/pdf' || extension === 'pdf'
  }, [mimeType, extension])

  const isInlinePreviewSupported = useMemo(() => {
    if (!sourceUrl) return false
    if (mimeType.startsWith('image/')) return true
    if (OFFICE_EXTENSIONS.has(extension || '')) return true
    if (['txt', 'csv', 'json', 'xml', 'md', 'html'].includes(extension || '')) return true
    return false
  }, [sourceUrl, extension, mimeType])

  const officeViewerUrl = useMemo(() => {
    if (!sourceUrl || !OFFICE_EXTENSIONS.has(extension || '') || !isHttpUrl(sourceUrl)) {
      return ''
    }
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(sourceUrl)}`
  }, [sourceUrl, extension])

  const docViewerDocuments = useMemo(() => {
    if (!sourceUrl) return []
    return [{
      uri: sourceUrl,
      fileType: extension,
      fileName: documentItem?.name || 'document',
    }]
  }, [sourceUrl, extension, documentItem])

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
            <Button variant="outline" onClick={() => downloadFile(sourceUrl, documentItem.name)}>
              <Download className="w-4 h-4" />
              {t('common.download')}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border overflow-hidden bg-background-paper" style={{ minHeight: '80vh' }}>
          {officeViewerUrl ? (
            <iframe
              title={documentItem.name}
              src={officeViewerUrl}
              className="w-full h-[80vh]"
            />
          ) : isPdfPreview ? (
            <object
              data={sourceUrl}
              type="application/pdf"
              className="w-full h-[80vh]"
            >
              <iframe
                title={documentItem.name}
                src={sourceUrl}
                className="w-full h-[80vh]"
              />
            </object>
          ) : isInlinePreviewSupported ? (
            <div className="h-[80vh]">
              <DocViewer
                key={sourceUrl}
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
            <div className="h-[80vh] flex items-center justify-center text-center p-8">
              <div>
                <h2 className="text-xl font-semibold text-text-heading mb-2">{t('documents.previewNotAvailable')}</h2>
                <p className="text-text-muted mb-4">{t('documents.previewNotAvailableDescription')}</p>
                <div className="flex items-center justify-center gap-2">
                  <Button variant="outline" onClick={() => downloadFile(sourceUrl, documentItem.name)}>
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
