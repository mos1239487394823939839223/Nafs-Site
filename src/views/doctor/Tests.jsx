import { useMemo, useState } from 'react'
import Card, { CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import { useLanguage } from '../../contexts/LanguageContext'
import { Science, OpenInNew } from '@mui/icons-material'
import { getAvailableTests } from '../../lib/testsStorage'

export default function DoctorTests() {
  const { isRTL } = useLanguage()
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')
  const tests = getAvailableTests()

  const tags = useMemo(() => {
    const allTags = tests
      .map(test => test.tag)
      .filter(Boolean)
    return Array.from(new Set(allTags))
  }, [tests])

  const filteredTests = useMemo(() => {
    const query = search.trim().toLowerCase()

    return tests.filter(test => {
      const matchesTag = selectedTag === 'all' || test.tag === selectedTag
      const matchesQuery = !query
        || test.name.toLowerCase().includes(query)
        || test.description.toLowerCase().includes(query)
        || test.tag.toLowerCase().includes(query)

      return matchesTag && matchesQuery
    })
  }, [tests, search, selectedTag])

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text-heading flex items-center gap-2">
          <Science className="w-7 h-7 text-primary" />
          {isRTL ? 'الاختبارات المتاحة' : 'Available Tests'}
        </h1>
        <p className="text-text-muted mt-2">
          {isRTL
            ? 'يمكنك استعراض الاختبارات المتاحة ومشاركة الروابط مع المرضى أثناء المتابعة.'
            : 'Browse available tests and share links with patients during follow-up.'}
        </p>
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
          {filteredTests.map(test => (
            <Card key={test.id} className="h-full">
              <CardContent className="h-full flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-text-heading">{test.name}</h2>
                  <Badge variant="secondary">{test.tag}</Badge>
                </div>

                <p className="text-sm text-text-muted leading-relaxed flex-1">{test.description}</p>

                <a
                  href={test.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline"
                >
                  <OpenInNew className="w-4 h-4" />
                  {isRTL ? 'فتح التفاصيل' : 'Open Details'}
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
