import { useMemo, useState } from 'react'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { useLanguage } from '../../contexts/LanguageContext'
import { Science, AddCircleOutline, DeleteOutline, OpenInNew } from '@mui/icons-material'
import { addAvailableTest, deleteAvailableTest, getAvailableTests } from '../../lib/testsStorage'

const initialForm = {
  name: '',
  description: '',
  url: '',
  tag: '',
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

  const [formData, setFormData] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [tests, setTests] = useState(() => getAvailableTests())

  const tagsCount = useMemo(() => {
    const normalizedTags = tests
      .map(test => test.tag?.toLowerCase())
      .filter(Boolean)
    return new Set(normalizedTags).size
  }, [tests])

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

    if (!formData.tag.trim()) {
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
    toast.success(isRTL ? 'تم حذف الاختبار' : 'Test removed')
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text-heading flex items-center gap-2">
          <Science className="w-7 h-7 text-primary" />
          {isRTL ? 'الاختبارات' : 'Tests'}
        </h1>
        <p className="text-text-muted mt-2">
          {isRTL
            ? 'الأدمن فقط يمكنه إنشاء وحذف الاختبارات. تظهر مباشرة للطبيب والمريض.'
            : 'Only admin can create and remove tests. They are visible immediately to doctor and patient.'}
        </p>
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
          <p className="text-sm text-text-muted">{isRTL ? 'التخزين' : 'Storage'}</p>
          <p className="text-lg font-semibold text-primary mt-2">LocalStorage</p>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <AddCircleOutline className="w-4 h-4 mr-2" />
          {isRTL ? 'إضافة اختبار' : 'Add Test'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'الاختبارات الحالية' : 'Current Tests'}</CardTitle>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <Science className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{isRTL ? 'لا توجد اختبارات مضافة بعد' : 'No tests added yet'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tests.map(test => (
                <div
                  key={test.id}
                  className="rounded-xl border border-border p-4 flex flex-col md:flex-row md:items-start gap-4 md:justify-between"
                >
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-text-heading text-lg">{test.name}</h3>
                      <Badge variant="secondary">{test.tag}</Badge>
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

      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title={isRTL ? 'إضافة اختبار جديد' : 'Add New Test'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={isRTL ? 'اسم الاختبار' : 'Test Name'}
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder={isRTL ? 'مثل: Complete Blood Count' : 'e.g. Complete Blood Count'}
            />

            <Input
              label={isRTL ? 'التصنيف' : 'Tag'}
              name="tag"
              value={formData.tag}
              onChange={handleChange}
              error={errors.tag}
              placeholder={isRTL ? 'مثل: دم / قلب / غدد' : 'e.g. Blood / Cardiology / Hormones'}
            />
          </div>

          <Input
            label={isRTL ? 'الوصف' : 'Description'}
            name="description"
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
            placeholder="https://example.com/test-info"
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeCreateModal}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit">
              <AddCircleOutline className="w-4 h-4 mr-2" />
              {isRTL ? 'إضافة الاختبار' : 'Create Test'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
