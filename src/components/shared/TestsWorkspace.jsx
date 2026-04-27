import { useEffect, useMemo, useState } from 'react'
import Card, { CardContent } from '../ui/Card'
import Badge from '../ui/Badge'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { useToast } from '../ui/Toast'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { extractErrorMessage, medicalAPI, userAPI } from '../../lib/api'
import { Beaker as Science, ExternalLink as OpenInNew, ClipboardCheck as AssignmentTurnedIn, Loader2, Eye } from 'lucide-react'
import TestDetailModal from './TestDetailModal'

function UserResultCard({
  test,
  result,
  pendingValue,
  onPendingChange,
  onSubmit,
  isSubmitting,
  isRTL,
  onViewDetails,
}) {
  const hasResult = Boolean(String(result?.resultText || '').trim())

  return (
    <Card className="h-full hover:border-primary/40 transition-colors cursor-pointer" onClick={onViewDetails}>
      <CardContent className="h-full flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-text-heading">{test.name}</h2>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="secondary">{test.tagName || (isRTL ? 'بدون وسم' : 'No tag')}</Badge>
            <button
              onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
              className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
              title={isRTL ? 'عرض التفاصيل' : 'View details'}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-sm text-text-muted leading-relaxed">{test.description}</p>

        {test.url ? (
          <a
            href={test.url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline"
          >
            <OpenInNew className="w-4 h-4" />
            {isRTL ? 'فتح الاختبار' : 'Open Test'}
          </a>
        ) : null}

        {hasResult ? (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <AssignmentTurnedIn className="w-4 h-4" />
              {isRTL ? 'تم إرسال النتيجة' : 'Result submitted'}
            </div>
            <p className="text-sm text-text-heading whitespace-pre-wrap">{result.resultText}</p>
            <p className="text-xs text-text-muted">
              {isRTL ? 'وقت الإدخال:' : 'Submitted at:'} {new Date(result.submittedAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <div className="space-y-2 pt-1" onClick={(e) => e.stopPropagation()}>
            <Input
              label={isRTL ? 'اكتب نتيجتك بعد إنهاء الاختبار' : 'Enter your result after completing the test'}
              value={pendingValue}
              onChange={(event) => onPendingChange(test.id, event.target.value)}
              placeholder={isRTL ? 'مثال: 18/27 أو ملخص النتيجة' : 'Example: 18/27 or short summary'}
            />

            <Button
              onClick={(e) => { e.stopPropagation(); onSubmit(test.id); }}
              disabled={isSubmitting || !String(pendingValue || '').trim()}
              className="gap-2"
            >
              <AssignmentTurnedIn className="w-4.5 h-4.5" />
              {isRTL ? 'إرسال النتيجة' : 'Submit Result'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function TestsWorkspace({ roleLabel = 'user' }) {
  const { isRTL } = useLanguage()
  const { user } = useAuth()
  const toast = useToast()
  const isPatientView = String(roleLabel).toLowerCase() === 'patient'

  const userId = useMemo(() => {
    const resolved = userAPI.resolveUserId(user)
    return resolved ? String(resolved) : ''
  }, [user])

  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')
  const [resultDrafts, setResultDrafts] = useState({})
  const [selectedTest, setSelectedTest] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testsLoading, setTestsLoading] = useState(true)
  const [tests, setTests] = useState([])
  const [diseases, setDiseases] = useState([])
  const [submittedResultsByTest, setSubmittedResultsByTest] = useState({})
  const [resultsRefreshTick, setResultsRefreshTick] = useState(0)

  useEffect(() => {
    let cancelled = false

    const loadTests = async () => {
      setTestsLoading(true)
      try {
        if (isPatientView) {
          if (!userId) {
            if (!cancelled) {
              setTests([])
              setDiseases([])
              setSubmittedResultsByTest({})
            }
            return
          }

          const response = await medicalAPI.getPatientHistory(userId, 1, 200)
          const data = response?.Data ?? response?.data ?? response
          const items = Array.isArray(data?.Items)
            ? data.Items
            : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data)
            ? data
            : []

          const normalized = items
            .map((item) => {
              const recordId = item?.RecordID ?? item?.RecordId ?? item?.recordId ?? item?.ID ?? item?.Id ?? item?.id
              if (!recordId) return null

              const testName = String(
                item?.TestTypeName ?? item?.testTypeName ?? item?.Name ?? item?.name ?? '',
              ).trim()

              const description = String(item?.ExamNotes ?? item?.examNotes ?? '').trim()
              const scanUrl = String(item?.ScanUrl ?? item?.scanUrl ?? '').trim()
              const testDate = item?.TestDate ?? item?.testDate ?? item?.CreatedAt ?? item?.createdAt
              const doctorName = String(item?.DoctorName ?? item?.doctorName ?? '').trim()

              return {
                id: String(recordId),
                name: testName || (isRTL ? 'اختبار طبي' : 'Medical Test'),
                description,
                url: scanUrl,
                tagName: doctorName || (testDate ? new Date(testDate).toLocaleDateString() : ''),
                resultText: String(item?.Result ?? item?.result ?? '').trim(),
                submittedAt: testDate || new Date().toISOString(),
              }
            })
            .filter(Boolean)

          const mappedResults = normalized.reduce((acc, item) => {
            if (!String(item.resultText || '').trim()) return acc
            acc[String(item.id)] = {
              testId: String(item.id),
              resultText: item.resultText,
              submittedAt: item.submittedAt,
            }
            return acc
          }, {})

          if (!cancelled) {
            setDiseases([])
            setTests(normalized)
            setSubmittedResultsByTest(mappedResults)
          }

          return
        }

        const selectedDiseaseId = selectedTag === 'all' ? null : Number(selectedTag)
        const [diseasesResponse, testsResponse] = await Promise.all([
          medicalAPI.getDiseases(1, 200),
          medicalAPI.getTestTypes(1, 50, selectedDiseaseId),
        ])

        const diseasesData = diseasesResponse?.Data ?? diseasesResponse?.data ?? diseasesResponse
        const diseasesItems = Array.isArray(diseasesData?.Items)
          ? diseasesData.Items
          : Array.isArray(diseasesData?.items)
          ? diseasesData.items
          : Array.isArray(diseasesData)
          ? diseasesData
          : []

        const normalizedDiseases = diseasesItems
          .map((item) => {
            const id = item?.ID ?? item?.Id ?? item?.id
            const name = String(item?.Name ?? item?.name ?? '').trim()
            if (!id || !name) return null
            return { id: String(id), name }
          })
          .filter(Boolean)

        if (!cancelled) {
          setDiseases(normalizedDiseases)
        }

        const diseaseNameById = new Map(
          normalizedDiseases.map((item) => [item.id, item.name]),
        )

        const testsData = testsResponse?.Data ?? testsResponse?.data ?? testsResponse
        const testsItems = Array.isArray(testsData?.Items)
          ? testsData.Items
          : Array.isArray(testsData?.items)
          ? testsData.items
          : Array.isArray(testsData)
          ? testsData
          : []

        const normalized = testsItems
          .map((item) => {
            const id = item?.ID ?? item?.Id ?? item?.id
            const name = String(item?.Name ?? item?.name ?? '').trim()
            if (!id || !name) return null

            const diseaseIds = Array.isArray(item?.DiseaseIds)
              ? item.DiseaseIds
                  .map((value) => Number(value))
                  .filter((value) => Number.isFinite(value) && value > 0)
              : []

            const tagNamesFromDiseases = diseaseIds
              .map((diseaseId) => diseaseNameById.get(String(diseaseId)))
              .filter(Boolean)

            const rawTags = Array.isArray(item?.Tags)
              ? item.Tags
              : Array.isArray(item?.tags)
              ? item.tags
              : []

            const tagNamesFromPayload = rawTags
              .map((tag) => {
                if (typeof tag === 'string') return tag.trim()
                return String(tag?.Name ?? tag?.name ?? '').trim()
              })
              .filter(Boolean)

            const resolvedTagNames =
              tagNamesFromDiseases.length > 0 ? tagNamesFromDiseases : tagNamesFromPayload

            return {
              id: String(id),
              name,
              description: String(item?.Description ?? item?.description ?? '').trim(),
              url: String(item?.Url ?? item?.url ?? '').trim(),
              tagName: resolvedTagNames.join(', '),
            }
          })
          .filter(Boolean)

        if (!cancelled) {
          setTests(normalized)
        }
      } catch (error) {
        if (!cancelled) {
          setTests([])
          setDiseases([])
          toast.error(extractErrorMessage(error, isRTL ? 'فشل تحميل الاختبارات' : 'Failed to load tests'))
        }
      } finally {
        if (!cancelled) {
          setTestsLoading(false)
        }
      }
    }

    loadTests()

    return () => {
      cancelled = true
    }
  }, [isRTL, toast, selectedTag, isPatientView, userId, resultsRefreshTick])

  useEffect(() => {
    if (isPatientView) {
      return
    }

    let cancelled = false

    const loadSubmittedResults = async () => {
      if (!userId) {
        setSubmittedResultsByTest({})
        return
      }

      try {
        const response = await medicalAPI.getMyHistory(1, 200)
        const data = response?.Data ?? response?.data ?? response
        const items = Array.isArray(data?.Items)
          ? data.Items
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : []

        const mapped = items.reduce((acc, item) => {
          const testTypeId = item?.TestTypeID ?? item?.TestTypeId ?? item?.testTypeId
          if (!testTypeId) return acc

          const submittedAt =
            item?.TestDate ||
            item?.testDate ||
            item?.CreatedAt ||
            item?.createdAt ||
            new Date().toISOString()

          const resultText = String(
            item?.Result ??
            item?.result ??
            item?.ExamNotes ??
            item?.examNotes ??
            '',
          ).trim()

          acc[String(testTypeId)] = {
            testId: String(testTypeId),
            resultText,
            submittedAt,
          }
          return acc
        }, {})

        if (!cancelled) {
          setSubmittedResultsByTest(mapped)
        }
      } catch {
        if (!cancelled) {
          setSubmittedResultsByTest({})
        }
      }
    }

    loadSubmittedResults()

    return () => {
      cancelled = true
    }
  }, [userId, resultsRefreshTick, isPatientView])

  const tags = useMemo(() => diseases, [diseases])

  const selectedTagName = useMemo(() => {
    if (selectedTag === 'all') return ''
    const found = diseases.find((item) => String(item.id) === String(selectedTag))
    return String(found?.name || '').trim().toLowerCase()
  }, [diseases, selectedTag])

  const filteredTests = useMemo(() => {
    const query = search.trim().toLowerCase()

    return tests.filter(test => {
      const normalizedTagName = String(test.tagName || '').toLowerCase()
      const matchesTag = selectedTag === 'all' || (selectedTagName && normalizedTagName.includes(selectedTagName))
      const matchesQuery = !query
        || test.name.toLowerCase().includes(query)
        || test.description.toLowerCase().includes(query)
        || normalizedTagName.includes(query)

      return matchesTag && matchesQuery
    })
  }, [tests, search, selectedTag])

  const submitResultForTest = async (testId) => {
    const draftValue = String(resultDrafts[testId] || '').trim()
    if (!draftValue) {
      toast.error(isRTL ? 'اكتب النتيجة أولا' : 'Please enter your result first')
      return
    }

    const test = tests.find((item) => String(item.id) === String(testId))
    const recordId = String(testId || '').trim()
    if (!recordId) {
      toast.error(isRTL ? 'نوع الاختبار غير صالح' : 'Invalid test type')
      return
    }

    if (!isPatientView) {
      const patientId = String(userId || '').trim()
      if (!patientId) {
        toast.error(isRTL ? 'تعذر تحديد هوية المستخدم' : 'Unable to resolve current user id')
        return
      }
    }

    setIsSubmitting(true)
    try {
      const response = isPatientView
        ? await medicalAPI.updatePatientTestResult(recordId, draftValue)
        : await medicalAPI.addPatientTest({
            PatientID: String(userId || '').trim(),
            TestTypeID: String(testId || '').trim(),
            ScanUrl: String(test?.url || ''),
            ExamNotes: draftValue,
            TestDate: new Date().toISOString(),
          })

      if (response?.IsSuccess === false) {
        toast.error(response?.Message || (isRTL ? 'فشل حفظ النتيجة' : 'Failed to save result'))
        return
      }

      setSubmittedResultsByTest((prev) => ({
        ...prev,
        [String(testId)]: {
          testId: String(testId),
          resultText: draftValue,
          submittedAt: new Date().toISOString(),
        },
      }))
      setResultsRefreshTick((prev) => prev + 1)
      setResultDrafts(prev => ({ ...prev, [testId]: '' }))
      toast.success(isRTL ? 'تم حفظ النتيجة بنجاح' : 'Result saved successfully')
    } catch (error) {
      toast.error(extractErrorMessage(error, isRTL ? 'فشل حفظ النتيجة' : 'Failed to save result'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const headerTitle = isRTL ? 'الاختبارات المتاحة' : 'Available Tests'
  const headerSubtitle = isRTL
    ? 'افتح رابط الاختبار الخارجي ثم ارجع وأدخل نتيجتك. يمكن إدخال النتيجة مرة واحدة فقط.'
    : 'Open the external test link, then return and submit your result. Each test can be submitted once only.'

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text-heading flex items-center gap-2">
          <Science className="w-7 h-7 text-primary" />
          {headerTitle}
        </h1>
        <p className="text-text-muted mt-2">{headerSubtitle}</p>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <Input
            label={isRTL ? 'بحث' : 'Search'}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={isRTL ? 'ابحث باسم الاختبار أو الوصف أو التصنيف' : 'Search by test name, description, or tag'}
          />

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedTag('all')}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                selectedTag === 'all'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-text-muted hover:border-primary/60'
              }`}
            >
              {isRTL ? 'الكل' : 'All'}
            </button>

            {tags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => setSelectedTag(tag.id)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedTag === tag.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-text-muted hover:border-primary/60'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredTests.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12 text-text-muted">
              {testsLoading ? (
                <>
                  <Loader2 className="w-12 h-12 mx-auto mb-3 opacity-40 animate-spin" />
                  <p>{isRTL ? 'جاري تحميل الاختبارات...' : 'Loading tests...'}</p>
                </>
              ) : (
                <>
                  <Science className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{isRTL ? 'لا توجد اختبارات متاحة حاليا' : 'No tests are available right now'}</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTests.map((test) => (
            <UserResultCard
              key={test.id}
              test={test}
              result={submittedResultsByTest[String(test.id)]}
              pendingValue={resultDrafts[test.id] || ''}
              onPendingChange={(id, value) => {
                setResultDrafts(prev => ({ ...prev, [id]: value }))
              }}
              onSubmit={submitResultForTest}
              isSubmitting={isSubmitting}
              isRTL={isRTL}
              onViewDetails={() => { setSelectedTest(test); setIsModalOpen(true); }}
            />
          ))}
        </div>
      )}

      <TestDetailModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        test={selectedTest}
        result={selectedTest ? submittedResultsByTest[String(selectedTest.id)] : null}
        isRTL={isRTL}
      />
    </div>
  )
}
