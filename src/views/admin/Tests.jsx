import { useMemo, useState } from 'react'
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
import {
  Science,
  AddCircleOutline,
  DeleteOutline,
  OpenInNew,
  LocalOffer,
  AssignmentTurnedIn,
  Search,
} from '@mui/icons-material'
import {
  addAvailableTest,
  addTestTag,
  deleteAvailableTest,
  getAllTestResults,
  getAvailableTests,
  getTestTags,
} from '../../lib/testsStorage'

const initialForm = {
  name: '',
  description: '',
  url: '',
  tagId: '',
}

const initialTagForm = {
  name: '',
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
  const [tests, setTests] = useState(() => getAvailableTests())
  const [tags, setTags] = useState(() => getTestTags())
  const [results, setResults] = useState(() => getAllTestResults())

  const tagsCount = useMemo(() => {
    return tags.length
  }, [tags])

  const resultsCount = useMemo(() => results.length, [results])

  const testsById = useMemo(() => {
    return tests.reduce((acc, test) => {
      acc[String(test.id)] = test
      return acc
    }, {})
  }, [tests])

  const filteredTests = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return tests

    return tests.filter((test) => {
      return (
        test.name.toLowerCase().includes(query)
        || test.description.toLowerCase().includes(query)
        || test.tagName.toLowerCase().includes(query)
      )
    })
  }, [tests, search])

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
      icon: <Science style={{ width: 18, height: 18 }} />,
      count: tests.length,
    },
    {
      key: 'tags',
      label: isRTL ? 'وسوم الاختبارات' : 'Test Tags',
      icon: <LocalOffer style={{ width: 18, height: 18 }} />,
      count: tags.length,
    },
    {
      key: 'results',
      label: isRTL ? 'النتائج' : 'Results',
      icon: <AssignmentTurnedIn style={{ width: 18, height: 18 }} />,
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

    const updatedTests = addAvailableTest(formData)
    setTests(updatedTests)
    setResults(getAllTestResults())
    setFormData(initialForm)
    setErrors({})
    setIsCreateModalOpen(false)
    toast.success(isRTL ? 'تمت إضافة الاختبار بنجاح' : 'Test added successfully')
  }

  const closeCreateModal = () => {
    setIsCreateModalOpen(false)
    setFormData(initialForm)
    setErrors({})
  }

  const handleDelete = (testId) => {
    const updatedTests = deleteAvailableTest(testId)
    setTests(updatedTests)
    setResults(getAllTestResults())
    toast.success(isRTL ? 'تم حذف الاختبار' : 'Test removed')
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

    const before = getTestTags()
    const updated = addTestTag(tagForm.name)
    setTags(updated)

    if (updated.length === before.length) {
      toast.error(isRTL ? 'الوسم موجود بالفعل' : 'Tag already exists')
      return
    }

    setTagForm(initialTagForm)
    setTagErrors({})
    setIsCreateTagModalOpen(false)
    toast.success(isRTL ? 'تم إنشاء الوسم بنجاح' : 'Tag created successfully')
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
              <Science className="text-primary" style={{ width: 22, height: 22 }} />
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
            <AddCircleOutline style={{ width: 18, height: 18 }} />
            {isRTL ? 'إنشاء اختبار' : 'Create Test'}
          </Button>
        ) : activeTab === 'tags' ? (
          <Button onClick={() => setIsCreateTagModalOpen(true)} className="gap-2 shadow-lg shadow-primary/20">
            <AddCircleOutline style={{ width: 18, height: 18 }} />
            {isRTL ? 'إنشاء وسم' : 'Create Tag'}
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-text-muted">{isRTL ? 'إجمالي الاختبارات' : 'Total Tests'}</p>
          <p className="text-3xl font-bold text-text-heading mt-1">{tests.length}</p>
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

          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'الاختبارات الحالية' : 'Current Tests'}</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTests.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  <Science className="w-12 h-12 mx-auto mb-3 opacity-30" />
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
                        <a
                          href={test.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary text-sm hover:underline"
                        >
                          <OpenInNew className="w-4 h-4" />
                          {isRTL ? 'فتح الرابط' : 'Open URL'}
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleDelete(test.id)}>
                          <DeleteOutline className="w-4 h-4 mr-1" />
                          {isRTL ? 'حذف' : 'Delete'}
                        </Button>
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
              {tags.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  <LocalOffer className="w-12 h-12 mx-auto mb-3 opacity-30" />
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
                  <AssignmentTurnedIn className="w-12 h-12 mx-auto mb-3 opacity-30" />
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
            <Button type="submit">
              <AddCircleOutline className="w-4 h-4 mr-2" />
              {isRTL ? 'إنشاء الاختبار' : 'Create Test'}
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
              setTagForm({ name: event.target.value })
              if (tagErrors.name) {
                setTagErrors({})
              }
            }}
            error={tagErrors.name}
            placeholder={isRTL ? 'مثل: نفسي / سلوكي / قلق' : 'e.g. Psychological / Behavioral / Anxiety'}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeCreateTagModal}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit">
              <AddCircleOutline className="w-4 h-4 mr-2" />
              {isRTL ? 'إنشاء الوسم' : 'Create Tag'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
