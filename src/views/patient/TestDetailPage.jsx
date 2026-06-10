import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Beaker,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  ListChecks,
  Loader2,
  Target,
  WalletCards,
} from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { extractErrorMessage, medicalAPI, userAPI } from '../../lib/api'
import { normalizeTestTypeItem, parseTestSteps } from '../../lib/testCatalog'
import { useToast } from '../../components/ui/Toast'

export default function TestDetailPage() {
  const { testId } = useParams()
  const navigate = useNavigate()
  const { t, isRTL } = useLanguage()
  const { user } = useAuth()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [test, setTest] = useState(null)
  const [diseases, setDiseases] = useState([])
  const [resultDraft, setResultDraft] = useState('')
  const [submittedResult, setSubmittedResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const userId = useMemo(() => {
    const resolved = userAPI.resolveUserId(user)
    return resolved ? String(resolved) : ''
  }, [user])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const [diseasesResponse, testsResponse, historyResponse] = await Promise.all([
          medicalAPI.getDiseases(1, 200),
          medicalAPI.getTestTypes(1, 200),
          userId ? medicalAPI.getMyHistory(1, 200) : Promise.resolve(null),
        ])

        const diseasesData = diseasesResponse?.Data ?? diseasesResponse?.data ?? diseasesResponse
        const diseasesItems = Array.isArray(diseasesData?.Items)
          ? diseasesData.Items
          : Array.isArray(diseasesData?.items)
            ? diseasesData.items
            : Array.isArray(diseasesData)
              ? diseasesData
              : []

        const diseaseNameById = new Map(
          diseasesItems
            .map((item) => {
              const id = item?.ID ?? item?.Id ?? item?.id
              const name = String(item?.Name ?? item?.name ?? '').trim()
              return id && name ? [String(id), name] : null
            })
            .filter(Boolean),
        )

        const testsData = testsResponse?.Data ?? testsResponse?.data ?? testsResponse
        const testsItems = Array.isArray(testsData?.Items)
          ? testsData.Items
          : Array.isArray(testsData?.items)
            ? testsData.items
            : Array.isArray(testsData)
              ? testsData
              : []

        const found = testsItems
          .map((item) => normalizeTestTypeItem(item, { diseaseNameById }))
          .find((item) => String(item?.id) === String(testId))

        const diseasesForTest = await medicalAPI.getTestTypeDiseases(testId)
        const diseasePayload = diseasesForTest?.Data ?? diseasesForTest?.data ?? diseasesForTest
        const diseaseList = Array.isArray(diseasePayload?.Items)
          ? diseasePayload.Items
          : Array.isArray(diseasePayload?.items)
            ? diseasePayload.items
            : Array.isArray(diseasePayload)
              ? diseasePayload
              : []

        const historyData = historyResponse?.Data ?? historyResponse?.data ?? historyResponse
        const historyItems = Array.isArray(historyData?.Items)
          ? historyData.Items
          : Array.isArray(historyData?.items)
            ? historyData.items
            : Array.isArray(historyData)
              ? historyData
              : []

        const existing = historyItems.find(
          (item) =>
            String(item?.TestTypeID ?? item?.TestTypeId ?? item?.testTypeId ?? '') === String(testId),
        )

        if (!cancelled) {
          setTest(found || null)
          setDiseases(
            diseaseList.map((d) => String(d?.Name ?? d?.name ?? '').trim()).filter(Boolean),
          )
          if (existing) {
            setSubmittedResult({
              resultText: String(existing?.Result ?? existing?.result ?? existing?.ExamNotes ?? '').trim(),
              submittedAt:
                existing?.TestDate ||
                existing?.testDate ||
                existing?.CreatedAt ||
                existing?.createdAt ||
                new Date().toISOString(),
            })
          } else {
            setSubmittedResult(null)
          }
        }
      } catch (error) {
        if (!cancelled) {
          setTest(null)
          toast.error(extractErrorMessage(error, t('auto.failedToLoadTests')))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [testId, toast, t, userId])

  const steps = parseTestSteps(test?.steps)
  const instructionSteps =
    steps.length > 0
      ? steps
      : [
          t('auto.reviewTestDetails', 'Review the test details.'),
          t('auto.openAndCompleteTest', 'Open and complete the test.'),
          t('auto.returnAndSubmitResult', 'Return and submit your result.'),
        ]

  const submitResult = async () => {
    const value = String(resultDraft || '').trim()
    if (!value) {
      toast.error(t('auto.pleaseEnterYourResultFirst'))
      return
    }
    if (!userId) {
      toast.error(t('auto.unableToResolveCurrentUserId'))
      return
    }

    setSubmitting(true)
    try {
      const response = await medicalAPI.addPatientTest({
        PatientID: userId,
        TestTypeID: String(testId),
        ScanUrl: String(test?.url || ''),
        ExamNotes: value,
        TestDate: new Date().toISOString(),
      })

      if (response?.IsSuccess === false) {
        toast.error(response?.Message || t('auto.failedToSaveResult'))
        return
      }

      setSubmittedResult({
        resultText: value,
        submittedAt: new Date().toISOString(),
      })
      setResultDraft('')
      toast.success(t('auto.resultSavedSuccessfully'))
    } catch (error) {
      toast.error(extractErrorMessage(error, t('auto.failedToSaveResult')))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!test) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-10 text-center">
        <Beaker className="mx-auto h-12 w-12 text-text-muted opacity-40" />
        <p className="text-text-muted">{t('auto.noTestsAreAvailableRightNow')}</p>
        <Button variant="outline" onClick={() => navigate('/dashboard/patient/tests')}>
          {t('patient.backToDoctors', 'Back')}
        </Button>
      </div>
    )
  }

  const hasPrice = test.price !== null && test.price !== undefined && String(test.price).trim() !== ''
  const BackIcon = isRTL ? ArrowRight : ArrowLeft

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      <button
        type="button"
        onClick={() => navigate('/dashboard/patient/tests')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        <BackIcon className="h-4 w-4" />
        {t('auto.backToTests', 'Back to tests')}
      </button>

      <div className="rounded-3xl border border-border bg-background-paper p-6 shadow-sm">
        <div className="mb-6 flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Beaker className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black text-text-heading">{test.name}</h1>
            {test.tagName ? <p className="mt-1 text-sm text-text-muted">{test.tagName}</p> : null}
          </div>
        </div>

        {test.description ? (
          <p className="text-sm leading-7 text-text-muted">{test.description}</p>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-background-subtle/60 p-4">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-text-muted">
              <Target className="h-4 w-4 text-primary" />
              {t('auto.testPurpose', 'Test purpose')}
            </div>
            <p className="text-sm text-text-heading">
              {test.purpose || t('auto.testPurposeFallback', 'Understand your current needs and support the next step.')}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background-subtle/60 p-4">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-text-muted">
              <Clock3 className="h-4 w-4 text-primary" />
              {t('auto.testDuration', 'Duration')}
            </div>
            <p className="text-sm text-text-heading">{test.duration || t('auto.durationVaries', 'Varies by test')}</p>
          </div>
          <div className="rounded-xl border border-border bg-background-subtle/60 p-4">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-text-muted">
              <ListChecks className="h-4 w-4 text-primary" />
              {t('tests.questionCount', 'Number of questions')}
            </div>
            <p className="text-sm text-text-heading">
              {test.questionCount ?? t('tests.questionCountUnknown', 'Not specified')}
            </p>
          </div>
          {hasPrice ? (
            <div className="rounded-xl border border-border bg-background-subtle/60 p-4">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-text-muted">
                <WalletCards className="h-4 w-4 text-primary" />
                {t('auto.price', 'Price')}
              </div>
              <p className="text-sm text-text-heading">{test.price}</p>
            </div>
          ) : null}
        </div>

        <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-text-heading">{t('tests.beforeYouStart', 'Before you start')}</h2>
          </div>
          <ol className="space-y-2 text-sm text-text-muted">
            {instructionSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-xs text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {diseases.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {diseases.map((name) => (
              <span
                key={name}
                className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary"
              >
                {name}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {test.url ? (
            <a
              href={test.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-dark"
            >
              <ExternalLink className="h-4 w-4" />
              {t('auto.startTest', 'Start test')}
            </a>
          ) : (
            <Button className="flex-1" onClick={() => navigate('/dashboard/patient/reserve')}>
              {t('tests.bookAssessmentSession', 'Book assessment session')}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-background-paper p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-text-heading">{t('auto.result')}</h2>
        </div>

        {submittedResult?.resultText ? (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="whitespace-pre-wrap text-sm text-text-heading">{submittedResult.resultText}</p>
            <p className="mt-2 text-xs text-text-muted">
              {t('auto.submittedAt')} {new Date(submittedResult.submittedAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              label={t('auto.enterYourResultAfterCompletingTheTest')}
              value={resultDraft}
              onChange={(event) => setResultDraft(event.target.value)}
              placeholder={t('auto.example1827OrShortSummary')}
            />
            <Button onClick={submitResult} disabled={submitting || !resultDraft.trim()} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
              {t('auto.submitResult')}
            </Button>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-text-muted">
        <Link to="/dashboard/patient/tests" className="text-primary hover:underline">
          {t('auto.backToTests', 'Back to tests')}
        </Link>
      </p>
    </div>
  )
}
