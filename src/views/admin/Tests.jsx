import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import SelectDropdown from '../../components/ui/SelectDropdown'
import { useToast } from '../../components/ui/Toast'
import { useLanguage } from '../../contexts/LanguageContext'
import { FlaskConical, PlusCircle, ExternalLink, Tag, ClipboardCheck, Search, Loader2 } from 'lucide-react'
import {
  getAllTestResults,
} from '../../lib/testsStorage'
import { extractErrorMessage, medicalAPI } from '../../lib/api'

const initialForm = {
  name: '',
  description: '',
  url: '',
  tagId: '',
}

const initialTagForm = {
  name: '',
  description: '',
}

function isValidUrl(url) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export default function AdminTests() {
  const { isRTL } = useLanguage()
  const toast = useToast()

  const [activeTab, setActiveTab] = useState('tests')
  const [search, setSearch] = useState('')
  const [resultsSearch, setResultsSearch] = useState('')
  const [formData, setFormData] = useState(initialForm)
  const [tagForm, setTagForm] = useState(initialTagForm)
  const [errors, setErrors] = useState({})
  const [tagErrors, setTagErrors] = useState({})
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreateTagModalOpen, setIsCreateTagModalOpen] = useState(false)
  const [tests, setTests] = useState([])
  const [testsLoading, setTestsLoading] = useState(true)
  const [isCreatingTest, setIsCreatingTest] = useState(false)
  const [selectedDiseaseFilter, setSelectedDiseaseFilter] = useState('')
  const [tags, setTags] = useState([])
  const [tagsLoading, setTagsLoading] = useState(true)
  const [isCreatingTag, setIsCreatingTag] = useState(false)
  const [results, setResults] = useState(() => getAllTestResults())

  const normalizeDiseaseTag = (item) => {
    const id = item?.ID ?? item?.Id ?? item?.id ?? item?.DiseaseID ?? item?.DiseaseId
    const name = String(item?.Name ?? item?.name ?? '').trim()

    if (!id || !name) return null

    return {
      id: String(id),
      name,
      createdAt: item?.CreatedAt || new Date().toISOString(),
    }
  }

  const normalizeTestType = (item) => {
    const id = item?.ID ?? item?.Id ?? item?.id
    const name = String(item?.Name ?? item?.name ?? '').trim()

    if (!id || !name) return null

    const diseaseIds = Array.isArray(item?.DiseaseIds)
      ? item.DiseaseIds
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value) && value > 0)
      : []

    const rawTags = Array.isArray(item?.Tags)
      ? item.Tags
      : Array.isArray(item?.tags)
      ? item.tags
      : []

    const tagNames = rawTags
      .map((tag) => {
        if (typeof tag === 'string') return tag.trim()
        return String(tag?.Name ?? tag?.name ?? '').trim()
      })
      .filter(Boolean)

    return {
      id: String(id),
      name,
      description: String(item?.Description ?? item?.description ?? '').trim(),
      url: String(item?.Url ?? item?.url ?? '').trim(),
      diseaseIds,
      tagNames,
    }
  }

  const loadDiseaseTags = useCallback(async () => {
    setTagsLoading(true)
    try {
      const response = await medicalAPI.getDiseases(1, 200)
      const data = response?.Data ?? response?.data ?? response
      const items = Array.isArray(data?.Items)
        ? data.Items
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : []

      const normalized = items
        .map(normalizeDiseaseTag)
        .filter(Boolean)

      setTags(normalized)
    } catch (error) {
      setTags([])
      toast.error(extractErrorMessage(error, isRTL ? 'فشل تحميل الوسوم' : 'Failed to load tags'))
    } finally {
      setTagsLoading(false)
    }
  }, [isRTL, toast])

  const loadTests = useCallback(async () => {
    setTestsLoading(true)
    try {
      const diseaseId = selectedDiseaseFilter ? Number(selectedDiseaseFilter) : null
      const response = await medicalAPI.getTestTypes(1, 50, diseaseId)
      const data = response?.Data ?? response?.data ?? response
      const items = Array.isArray(data?.Items)
        ? data.Items
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : []

      const normalized = items.map(normalizeTestType).filter(Boolean)
      setTests(normalized)
    } catch (error) {
      setTests([])
      toast.error(extractErrorMessage(error, isRTL ? 'فشل تحميل الاختبارات' : 'Failed to load tests'))
    } finally {
      setTestsLoading(false)
    }
  }, [isRTL, selectedDiseaseFilter, toast])

  useEffect(() => {
    loadDiseaseTags()
  }, [loadDiseaseTags])

  useEffect(() => {
    loadTests()
  }, [loadTests])

  const diseaseNameById = useMemo(() => {
    return new Map(tags.map((tag) => [String(tag.id), tag.name]))
  }, [tags])

  const testsWithTags = useMemo(() => {
    return tests.map((test) => {
      const diseaseNames = (test.diseaseIds || [])
        .map((id) => diseaseNameById.get(String(id)))
        .filter(Boolean)

      const resolvedTagNames = diseaseNames.length > 0 ? diseaseNames : (test.tagNames || [])

      return {
        ...test,
        tagName: resolvedTagNames.join(', '),
      }
    })
  }, [diseaseNameById, tests])

  const tagsCount = useMemo(() => {
    return tags.length
  }, [tags])

  const resultsCount = useMemo(() => results.length, [results])

  const testsById = useMemo(() => {
    return testsWithTags.reduce((acc, test) => {
      acc[String(test.id)] = test
      return acc
    }, {})
  }, [testsWithTags])

  const filteredTests = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return testsWithTags

    return testsWithTags.filter((test) => {
      return (
        test.name.toLowerCase().includes(query)
        || test.description.toLowerCase().includes(query)
        || test.tagName.toLowerCase().includes(query)
      )
    })
  }, [testsWithTags, search])

  const filteredResults = useMemo(() => {
    const query = resultsSearch.trim().toLowerCase()
    if (!query) return results

    return results.filter((result) => {
      const test = testsById[String(result.testId)]
      const testName = test?.name || ''
      const tagName = test?.tagName || ''

      return (
        result.userName.toLowerCase().includes(query)
        || result.userRole.toLowerCase().includes(query)
        || result.resultText.toLowerCase().includes(query)
        || testName.toLowerCase().includes(query)
        || tagName.toLowerCase().includes(query)
      )
    })
  }, [results, resultsSearch, testsById])

  const tabs = [
    {
      key: 'tests',
      label: isRTL ? 'الاختبارات' : 'Tests',
      icon: <FlaskConical style={{ width: 18, height: 18 }} />,
      count: tests.length,
    },
    {
      key: 'tags',
      label: isRTL ? 'وسوم الاختبارات' : 'Test Tags',
      icon: <Tag style={{ width: 18, height: 18 }} />,
      count: tags.length,
    },
    {
      key: 'results',
      label: isRTL ? 'النتائج' : 'Results',
      icon: <ClipboardCheck style={{ width: 18, height: 18 }} />,
      count: results.length,
    },
  ]

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const nextErrors = {}

    if (!formData.name.trim()) {
      nextErrors.name = isRTL ? 'اسم الاختبار مطلوب' : 'Test name is required'
    }

    if (!formData.description.trim()) {
      nextErrors.description = isRTL ? 'الوصف مطلوب' : 'Description is required'
    }

    if (!formData.url.trim()) {
      nextErrors.url = isRTL ? 'الرابط مطلوب' : 'URL is required'
    } else if (!isValidUrl(formData.url.trim())) {
      nextErrors.url = isRTL ? 'الرابط غير صحيح' : 'Please enter a valid URL'
    }

    if (!formData.tagId.trim()) {
      nextErrors.tag = isRTL ? 'التصنيف مطلوب' : 'Tag is required'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!validate()) {
      toast.error(isRTL ? 'يرجى تصحيح الأخطاء' : 'Please fix the form errors')
      return
    }

    const createTest = async () => {
      setIsCreatingTest(true)
      try {
        const selectedTag = tags.find((tag) => String(tag.id) === String(formData.tagId))
        const selectedTagName = String(selectedTag?.name || '').trim()
        if (!selectedTagName) {
          toast.error(isRTL ? 'الوسم المحدد غير صالح' : 'Selected tag is invalid')
          return
        }

        const payload = {
          Name: formData.name.trim(),
          Description: formData.description.trim(),
          Url: formData.url.trim(),
          Tags: [selectedTagName],
        }

        const response = await medicalAPI.createTestType(payload)
        if (response?.IsSuccess === false) {
          toast.error(response?.Message || (isRTL ? 'فشل إنشاء الاختبار' : 'Failed to create test'))
          return
        }

        await loadTests()
        setFormData(initialForm)
        setErrors({})
        setIsCreateModalOpen(false)
        toast.success(isRTL ? 'تمت إضافة الاختبار بنجاح' : 'Test added successfully')
      } catch (error) {
        toast.error(extractErrorMessage(error, isRTL ? 'فشل إنشاء الاختبار' : 'Failed to create test'))
      } finally {
        setIsCreatingTest(false)
      }
    }

    createTest()
  }

  const closeCreateModal = () => {
    setIsCreateModalOpen(false)
    setFormData(initialForm)
    setErrors({})
  }

  const validateTag = () => {
    const nextErrors = {}
    if (!tagForm.name.trim()) {
      nextErrors.name = isRTL ? 'اسم الوسم مطلوب' : 'Tag name is required'
    }
    setTagErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleCreateTag = (event) => {
    event.preventDefault()

    if (!validateTag()) {
      toast.error(isRTL ? 'يرجى تصحيح الأخطاء' : 'Please fix the form errors')
      return
    }

    const createTag = async () => {
      setIsCreatingTag(true)
      try {
        const payload = {
          Name: tagForm.name.trim(),
          Description: String(tagForm.description || '').trim() || tagForm.name.trim(),
        }

        const response = await medicalAPI.createDisease(payload)

        if (response?.IsSuccess === false) {
          toast.error(response?.Message || (isRTL ? 'فشل إنشاء الوسم' : 'Failed to create tag'))
          return
        }

        await loadDiseaseTags()
        setTagForm(initialTagForm)
        setTagErrors({})
        setIsCreateTagModalOpen(false)
        toast.success(isRTL ? 'تم إنشاء الوسم بنجاح' : 'Tag created successfully')
      } catch (error) {
        toast.error(extractErrorMessage(error, isRTL ? 'فشل إنشاء الوسم' : 'Failed to create tag'))
      } finally {
        setIsCreatingTag(false)
      }
    }

    createTag()
  }

  const closeCreateTagModal = () => {
    setTagForm(initialTagForm)
    setTagErrors({})
    setIsCreateTagModalOpen(false)
  }

  const tagOptions = tags.map((tag) => ({
    value: tag.id,
    label: tag.name,
  }))

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-2xl font-bold text-text-heading flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <FlaskConical className="text-primary" style={{ width: 22, height: 22 }} />
            </div>
            {isRTL ? 'إدارة الاختبارات' : 'Manage Tests'}
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            {isRTL
              ? 'أنشئ الاختبارات والوسوم وتابع نتائج المرضى والأطباء في مكان واحد.'
              : 'Create tests and tags, then monitor all doctor and patient results in one place.'}
          </p>
        </div>

        {activeTab === 'tests' ? (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2 shadow-lg shadow-primary/20"
            disabled={tags.length === 0}
          >
            <PlusCircle style={{ width: 18, height: 18 }} />
            {isRTL ? 'إنشاء اختبار' : 'Create Test'}
          </Button>
        ) : activeTab === 'tags' ? (
          <Button onClick={() => setIsCreateTagModalOpen(true)} className="gap-2 shadow-lg shadow-primary/20">
            <PlusCircle style={{ width: 18, height: 18 }} />
            {isRTL ? 'إنشاء وسم' : 'Create Tag'}
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-text-muted">{isRTL ? 'إجمالي الاختبارات' : 'Total Tests'}</p>
          <p className="text-3xl font-bold text-text-heading mt-1">{testsWithTags.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-text-muted">{isRTL ? 'التصنيفات' : 'Tags'}</p>
          <p className="text-3xl font-bold text-text-heading mt-1">{tagsCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-text-muted">{isRTL ? 'إجمالي النتائج' : 'Total Results'}</p>
          <p className="text-3xl font-bold text-text-heading mt-1">{resultsCount}</p>
        </Card>
      </div>

      <div className="flex border-b border-border gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm transition-all relative whitespace-nowrap rounded-t-xl ${
              activeTab === tab.key
                ? 'text-primary bg-primary/5 border-b-2 border-primary -mb-[2px]'
                : 'text-text-muted hover:text-text-heading hover:bg-background-subtle'
            }`}
          >
            {tab.icon}
            {tab.label}
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === tab.key ? 'bg-primary text-white' : 'bg-background-subtle text-text-muted'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {activeTab === 'tests' && (
        <motion.div
          key="tests"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-3">
            <div className="relative">
              <Search
                className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-text-muted`}
                style={{ width: 18, height: 18 }}
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={isRTL ? 'ابحث باسم الاختبار أو الوصف أو الوسم' : 'Search by test name, description, or tag'}
                className={`w-full ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 bg-background-paper border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-text transition-all`}
              />
            </div>
            <SelectDropdown
              value={selectedDiseaseFilter}
              onChange={(value) => setSelectedDiseaseFilter(String(value || ''))}
              options={[
                { value: '', label: isRTL ? 'كل التصنيفات' : 'All Tags' },
                ...tagOptions,
              ]}
              placeholder={isRTL ? 'تصفية بالتصنيف' : 'Filter by tag'}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'الاختبارات الحالية' : 'Current Tests'}</CardTitle>
            </CardHeader>
            <CardContent>
              {testsLoading ? (
                <div className="text-center py-12 text-text-muted">
                  <Loader2 className="w-12 h-12 mx-auto mb-3 opacity-40 animate-spin" />
                  <p>{isRTL ? 'جاري تحميل الاختبارات...' : 'Loading tests...'}</p>
                </div>
              ) : filteredTests.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>
                    {search
                      ? (isRTL ? 'لا توجد نتائج مطابقة' : 'No matching tests')
                      : (isRTL ? 'لا توجد اختبارات مضافة بعد' : 'No tests added yet')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTests.map(test => (
                    <div
                      key={test.id}
                      className="rounded-xl border border-border p-4 flex flex-col md:flex-row md:items-start gap-4 md:justify-between"
                    >
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-text-heading text-lg">{test.name}</h3>
                          <Badge variant="secondary">{test.tagName || (isRTL ? 'بدون وسم' : 'No tag')}</Badge>
                        </div>
                        <p className="text-sm text-text-muted">{test.description}</p>
                        {test.url && (
                          <a
                            href={test.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary text-sm hover:underline"
                          >
                            <ExternalLink className="w-4 h-4" />
                            {isRTL ? 'فتح الرابط' : 'Open URL'}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 'tags' && (
        <motion.div
          key="tags"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'وسوم الاختبارات' : 'Test Tags'}</CardTitle>
            </CardHeader>
            <CardContent>
              {tagsLoading ? (
                <div className="text-center py-12 text-text-muted">
                  <Tag className="w-12 h-12 mx-auto mb-3 opacity-30 animate-pulse" />
                  <p>{isRTL ? 'جاري تحميل الوسوم...' : 'Loading tags...'}</p>
                </div>
              ) : tags.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{isRTL ? 'لا توجد وسوم بعد' : 'No tags yet'}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  {tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 'results' && (
        <motion.div
          key="results"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-5"
        >
          <div className="relative">
            <Search
              className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-text-muted`}
              style={{ width: 18, height: 18 }}
            />
            <input
              type="text"
              value={resultsSearch}
              onChange={(event) => setResultsSearch(event.target.value)}
              placeholder={isRTL ? 'ابحث بالمستخدم أو الاختبار أو النتيجة' : 'Search by user, test, or result'}
              className={`w-full ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 bg-background-paper border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-text transition-all`}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'نتائج جميع المستخدمين' : 'All User Results'}</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredResults.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>
                    {resultsSearch
                      ? (isRTL ? 'لا توجد نتائج مطابقة' : 'No matching results')
                      : (isRTL ? 'لا توجد نتائج بعد' : 'No results yet')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredResults.map((result) => {
                    const test = testsById[String(result.testId)]
                    return (
                      <div key={result.id} className="rounded-xl border border-border p-4 space-y-2">
                        <div className="flex items-center flex-wrap gap-2">
                          <h3 className="font-semibold text-text-heading">
                            {test?.name || (isRTL ? 'اختبار محذوف' : 'Deleted test')}
                          </h3>
                          <Badge variant="secondary">{result.userRole || (isRTL ? 'مستخدم' : 'User')}</Badge>
                          <Badge variant="secondary">{result.userName || (isRTL ? 'بدون اسم' : 'Unnamed')}</Badge>
                          {test?.tagName && <Badge variant="secondary">{test.tagName}</Badge>}
                        </div>
                        <p className="text-sm text-text-muted whitespace-pre-wrap">{result.resultText}</p>
                        <p className="text-xs text-text-muted">
                          {isRTL ? 'وقت الإدخال:' : 'Submitted at:'} {new Date(result.submittedAt).toLocaleString()}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title={isRTL ? 'إضافة اختبار جديد' : 'Add New Test'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input
            label={isRTL ? 'اسم الاختبار' : 'Test Name'}
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder={isRTL ? 'مثل: PHQ-9' : 'e.g. PHQ-9'}
          />

          <Textarea
            label={isRTL ? 'الوصف' : 'Description'}
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            placeholder={isRTL ? 'اكتب وصفا مختصرا للاختبار' : 'Write a short description for the test'}
          />

          <Input
            label={isRTL ? 'الرابط' : 'URL'}
            name="url"
            value={formData.url}
            onChange={handleChange}
            error={errors.url}
            placeholder="https://example.com/test"
          />

          <SelectDropdown
            label={isRTL ? 'الوسم' : 'Tag'}
            value={formData.tagId}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, tagId: String(value) }))
              if (errors.tag) {
                setErrors(prev => ({ ...prev, tag: '' }))
              }
            }}
            options={tagOptions}
            placeholder={isRTL ? 'اختر وسم' : 'Select tag'}
            error={errors.tag}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeCreateModal}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isCreatingTest}>
              {!isCreatingTest && <PlusCircle className="w-4 h-4 mr-2" />}
              {isCreatingTest
                ? (isRTL ? 'جار الإنشاء...' : 'Creating...')
                : (isRTL ? 'إنشاء الاختبار' : 'Create Test')}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isCreateTagModalOpen}
        onClose={closeCreateTagModal}
        title={isRTL ? 'إنشاء وسم جديد' : 'Create New Tag'}
        size="sm"
      >
        <form onSubmit={handleCreateTag} className="space-y-4 pt-2">
          <Input
            label={isRTL ? 'اسم الوسم' : 'Tag Name'}
            name="name"
            value={tagForm.name}
            onChange={(event) => {
              setTagForm((prev) => ({ ...prev, name: event.target.value }))
              if (tagErrors.name) {
                setTagErrors({})
              }
            }}
            error={tagErrors.name}
            placeholder={isRTL ? 'مثل: نفسي / سلوكي / قلق' : 'e.g. Psychological / Behavioral / Anxiety'}
          />

          <Textarea
            label={isRTL ? 'الوصف' : 'Description'}
            name="description"
            rows={3}
            value={tagForm.description}
            onChange={(event) => {
              setTagForm((prev) => ({ ...prev, description: event.target.value }))
            }}
            placeholder={isRTL ? 'وصف اختياري للتصنيف المرضي' : 'Optional disease category description'}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeCreateTagModal}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isCreatingTag}>
              <PlusCircle className="w-4 h-4 mr-2" />
              {isCreatingTag
                ? (isRTL ? 'جار الإنشاء...' : 'Creating...')
                : (isRTL ? 'إنشاء الوسم' : 'Create Tag')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
