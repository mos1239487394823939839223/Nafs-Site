import { useMemo, useState } from 'react'
import Card, { CardContent } from '../ui/Card'
import Badge from '../ui/Badge'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { useToast } from '../ui/Toast'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { userAPI } from '../../lib/api'
import { Science, OpenInNew, AssignmentTurnedIn } from '@mui/icons-material'
import { getAvailableTests, getUserTestResults, submitTestResult } from '../../lib/testsStorage'

function getUserDisplayName(user, fallback) {
  const name = user?.Name || user?.name || user?.FullName || user?.fullName
  return String(name || fallback || '').trim()
}

function UserResultCard({
  test,
  result,
  pendingValue,
  onPendingChange,
  onSubmit,
  isSubmitting,
  isRTL,
}) {
  const hasResult = Boolean(result)

  return (
    <Card className="h-full">
      <CardContent className="h-full flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-text-heading">{test.name}</h2>
          <Badge variant="secondary">{test.tagName || (isRTL ? 'بدون وسم' : 'No tag')}</Badge>
        </div>

        <p className="text-sm text-text-muted leading-relaxed">{test.description}</p>

        <a
          href={test.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline"
        >
          <OpenInNew className="w-4 h-4" />
          {isRTL ? 'فتح الاختبار' : 'Open Test'}
        </a>

        {hasResult ? (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <AssignmentTurnedIn style={{ width: 16, height: 16 }} />
              {isRTL ? 'تم إرسال النتيجة' : 'Result submitted'}
            </div>
            <p className="text-sm text-text-heading whitespace-pre-wrap">{result.resultText}</p>
            <p className="text-xs text-text-muted">
              {isRTL ? 'وقت الإدخال:' : 'Submitted at:'} {new Date(result.submittedAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <Input
              label={isRTL ? 'اكتب نتيجتك بعد إنهاء الاختبار' : 'Enter your result after completing the test'}
              value={pendingValue}
              onChange={(event) => onPendingChange(test.id, event.target.value)}
              placeholder={isRTL ? 'مثال: 18/27 أو ملخص النتيجة' : 'Example: 18/27 or short summary'}
            />

            <Button
              onClick={() => onSubmit(test.id)}
              disabled={isSubmitting || !String(pendingValue || '').trim()}
              className="gap-2"
            >
              <AssignmentTurnedIn style={{ width: 18, height: 18 }} />
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
  const { user, role } = useAuth()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')
  const [resultDrafts, setResultDrafts] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)

  const tests = useMemo(() => getAvailableTests(), [refreshTick])

  const userId = useMemo(() => {
    const resolved = userAPI.resolveUserId(user)
    if (resolved) return String(resolved)
    return `${roleLabel}_local_user`
  }, [user, roleLabel])

  const userName = useMemo(() => {
    return getUserDisplayName(user, roleLabel)
  }, [user, roleLabel])

  const userRoleLabel = useMemo(() => {
    return String(role || roleLabel || 'user')
  }, [role, roleLabel])

  const userResults = useMemo(() => {
    const list = getUserTestResults(userId)
    return list.reduce((acc, item) => {
      acc[String(item.testId)] = item
      return acc
    }, {})
  }, [userId, refreshTick])

  const tags = useMemo(() => {
    const allTags = tests
      .map(test => test.tagName)
      .filter(Boolean)
    return Array.from(new Set(allTags))
  }, [tests])

  const filteredTests = useMemo(() => {
    const query = search.trim().toLowerCase()

    return tests.filter(test => {
      const matchesTag = selectedTag === 'all' || test.tagName === selectedTag
      const matchesQuery = !query
        || test.name.toLowerCase().includes(query)
        || test.description.toLowerCase().includes(query)
        || test.tagName.toLowerCase().includes(query)

      return matchesTag && matchesQuery
    })
  }, [tests, search, selectedTag])

  const submitResultForTest = (testId) => {
    const draftValue = String(resultDrafts[testId] || '').trim()
    if (!draftValue) {
      toast.error(isRTL ? 'اكتب النتيجة أولا' : 'Please enter your result first')
      return
    }

    setIsSubmitting(true)
    const response = submitTestResult({
      testId,
      userId,
      userRole: userRoleLabel,
      userName,
      resultText: draftValue,
    })

    if (!response.ok && response.error === 'ALREADY_SUBMITTED') {
      toast.error(isRTL ? 'لقد أدخلت نتيجة هذا الاختبار سابقا' : 'You already submitted this test result')
      setIsSubmitting(false)
      setRefreshTick(prev => prev + 1)
      return
    }

    if (!response.ok) {
      toast.error(isRTL ? 'فشل حفظ النتيجة' : 'Failed to save result')
      setIsSubmitting(false)
      return
    }

    setResultDrafts(prev => ({ ...prev, [testId]: '' }))
    setIsSubmitting(false)
    setRefreshTick(prev => prev + 1)
    toast.success(isRTL ? 'تم حفظ النتيجة بنجاح' : 'Result saved successfully')
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
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedTag === tag
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-text-muted hover:border-primary/60'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredTests.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12 text-text-muted">
              <Science className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{isRTL ? 'لا توجد اختبارات متاحة حاليا' : 'No tests are available right now'}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTests.map((test) => (
            <UserResultCard
              key={test.id}
              test={test}
              result={userResults[String(test.id)]}
              pendingValue={resultDrafts[test.id] || ''}
              onPendingChange={(id, value) => {
                setResultDrafts(prev => ({ ...prev, [id]: value }))
              }}
              onSubmit={submitResultForTest}
              isSubmitting={isSubmitting}
              isRTL={isRTL}
            />
          ))}
        </div>
      )}
    </div>
  )
}
