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
  const { t, isRTL } = useLanguage()
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
      toast.error(extractErrorMessage(error, t("auto.failedToLoadTags")))
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
      toast.error(extractErrorMessage(error, t("auto.failedToLoadTests")))
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
      label: t("auto.tests"),
      icon: <FlaskConical style={{ width: 18, height: 18 }} />,
      count: tests.length,
    },
    {
      key: 'tags',
      label: t("auto.testTags"),
      icon: <Tag style={{ width: 18, height: 18 }} />,
      count: tags.length,
    },
    {
      key: 'results',
      label: t("auto.results"),
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
      nextErrors.name = t("auto.testNameIsRequired")
    }

    if (!formData.description.trim()) {
      nextErrors.description = t("auto.descriptionIsRequired")
    }

    if (!formData.url.trim()) {
      nextErrors.url = t("auto.urlIsRequired")
    } else if (!isValidUrl(formData.url.trim())) {
      nextErrors.url = t("auto.pleaseEnterAValidUrl")
    }

    if (!formData.tagId.trim()) {
      nextErrors.tag = t("auto.tagIsRequired")
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!validate()) {
      toast.error(t("auto.pleaseFixTheFormErrors"))
      return
    }

    const createTest = async () => {
      setIsCreatingTest(true)
      try {
        const selectedTag = tags.find((tag) => String(tag.id) === String(formData.tagId))
        const selectedTagName = String(selectedTag?.name || '').trim()
        if (!selectedTagName) {
          toast.error(t("auto.selectedTagIsInvalid"))
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
          toast.error(response?.Message || (t("auto.failedToCreateTest")))
          return
        }

        await loadTests()
        setFormData(initialForm)
        setErrors({})
        setIsCreateModalOpen(false)
        toast.success(t("auto.testAddedSuccessfully"))
      } catch (error) {
        toast.error(extractErrorMessage(error, t("auto.failedToCreateTest")))
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
      nextErrors.name = t("auto.tagNameIsRequired")
    }
    setTagErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleCreateTag = (event) => {
    event.preventDefault()

    if (!validateTag()) {
      toast.error(t("auto.pleaseFixTheFormErrors"))
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
          toast.error(response?.Message || (t("auto.failedToCreateTag")))
          return
        }

        await loadDiseaseTags()
        setTagForm(initialTagForm)
        setTagErrors({})
        setIsCreateTagModalOpen(false)
        toast.success(t("auto.tagCreatedSuccessfully"))
      } catch (error) {
        toast.error(extractErrorMessage(error, t("auto.failedToCreateTag")))
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
    <div className="space-y-6" >
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-2xl font-bold text-text-heading flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <FlaskConical className="text-primary" style={{ width: 22, height: 22 }} />
            </div>
            {t("auto.manageTests")}
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            {t("auto.createTestsAndTagsThenMonitorAllDoctorAndPatientResultsInOnePlace")}
          </p>
        </div>

        {activeTab === 'tests' ? (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2 shadow-lg shadow-primary/20"
            disabled={tags.length === 0}
          >
            <PlusCircle style={{ width: 18, height: 18 }} />
            {t("auto.createTest")}
          </Button>
        ) : activeTab === 'tags' ? (
          <Button onClick={() => setIsCreateTagModalOpen(true)} className="gap-2 shadow-lg shadow-primary/20">
            <PlusCircle style={{ width: 18, height: 18 }} />
            {t("auto.createTag")}
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-text-muted">{t("auto.totalTests")}</p>
          <p className="text-3xl font-bold text-text-heading mt-1">{testsWithTags.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-text-muted">{t("auto.tags")}</p>
          <p className="text-3xl font-bold text-text-heading mt-1">{tagsCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-text-muted">{t("auto.totalResults")}</p>
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
                className={`absolute ${t("auto.start4")} top-1/2 -translate-y-1/2 text-text-muted`}
                style={{ width: 18, height: 18 }}
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("auto.searchByTestNameDescriptionOrTag")}
                className={`w-full ${t("auto.ps11Pe4")} py-3 bg-background-paper border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-text transition-all`}
              />
            </div>
            <SelectDropdown
              value={selectedDiseaseFilter}
              onChange={(value) => setSelectedDiseaseFilter(String(value || ''))}
              options={[
                { value: '', label: t("auto.allTags") },
                ...tagOptions,
              ]}
              placeholder={t("auto.filterByTag")}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("auto.currentTests")}</CardTitle>
            </CardHeader>
            <CardContent>
              {testsLoading ? (
                <div className="text-center py-12 text-text-muted">
                  <Loader2 className="w-12 h-12 mx-auto mb-3 opacity-40 animate-spin" />
                  <p>{t("auto.loadingTests")}</p>
                </div>
              ) : filteredTests.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>
                    {search
                      ? (t("auto.noMatchingTests"))
                      : (t("auto.noTestsAddedYet"))}
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
                          <Badge variant="secondary">{test.tagName || (t("auto.noTag"))}</Badge>
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
                            {t("auto.openUrl")}
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
              <CardTitle>{t("auto.testTags")}</CardTitle>
            </CardHeader>
            <CardContent>
              {tagsLoading ? (
                <div className="text-center py-12 text-text-muted">
                  <Tag className="w-12 h-12 mx-auto mb-3 opacity-30 animate-pulse" />
                  <p>{t("auto.loadingTags")}</p>
                </div>
              ) : tags.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t("auto.noTagsYet")}</p>
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
              className={`absolute ${t("auto.start4")} top-1/2 -translate-y-1/2 text-text-muted`}
              style={{ width: 18, height: 18 }}
            />
            <input
              type="text"
              value={resultsSearch}
              onChange={(event) => setResultsSearch(event.target.value)}
              placeholder={t("auto.searchByUserTestOrResult")}
              className={`w-full ${t("auto.ps11Pe4")} py-3 bg-background-paper border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-text transition-all`}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("auto.allUserResults")}</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredResults.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>
                    {resultsSearch
                      ? (t("auto.noMatchingResults"))
                      : (t("auto.noResultsYet"))}
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
                            {test?.name || (t("auto.deletedTest"))}
                          </h3>
                          <Badge variant="secondary">{result.userRole || (t("auto.user"))}</Badge>
                          <Badge variant="secondary">{result.userName || (t("auto.unnamed"))}</Badge>
                          {test?.tagName && <Badge variant="secondary">{test.tagName}</Badge>}
                        </div>
                        <p className="text-sm text-text-muted whitespace-pre-wrap">{result.resultText}</p>
                        <p className="text-xs text-text-muted">
                          {t("auto.submittedAt")} {new Date(result.submittedAt).toLocaleString()}
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
        title={t("auto.addNewTest")}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input
            label={t("auto.testName")}
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder={t("auto.egPhq9")}
          />

          <Textarea
            label={t("auto.description")}
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            placeholder={t("auto.writeAShortDescriptionForTheTest")}
          />

          <Input
            label={t("auto.url")}
            name="url"
            value={formData.url}
            onChange={handleChange}
            error={errors.url}
            placeholder="https://example.com/test"
          />

          <SelectDropdown
            label={t("auto.tag")}
            value={formData.tagId}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, tagId: String(value) }))
              if (errors.tag) {
                setErrors(prev => ({ ...prev, tag: '' }))
              }
            }}
            options={tagOptions}
            placeholder={t("auto.selectTag")}
            error={errors.tag}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeCreateModal}>
              {t("auto.cancel")}
            </Button>
            <Button type="submit" disabled={isCreatingTest}>
              {!isCreatingTest && <PlusCircle className="w-4 h-4 me-2" />}
              {isCreatingTest
                ? (t("auto.creating"))
                : (t("auto.createTest"))}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isCreateTagModalOpen}
        onClose={closeCreateTagModal}
        title={t("auto.createNewTag")}
        size="sm"
      >
        <form onSubmit={handleCreateTag} className="space-y-4 pt-2">
          <Input
            label={t("auto.tagName")}
            name="name"
            value={tagForm.name}
            onChange={(event) => {
              setTagForm((prev) => ({ ...prev, name: event.target.value }))
              if (tagErrors.name) {
                setTagErrors({})
              }
            }}
            error={tagErrors.name}
            placeholder={t("auto.egPsychologicalBehavioralAnxiety")}
          />

          <Textarea
            label={t("auto.description")}
            name="description"
            rows={3}
            value={tagForm.description}
            onChange={(event) => {
              setTagForm((prev) => ({ ...prev, description: event.target.value }))
            }}
            placeholder={t("auto.optionalDiseaseCategoryDescription")}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeCreateTagModal}>
              {t("auto.cancel")}
            </Button>
            <Button type="submit" disabled={isCreatingTag}>
              <PlusCircle className="w-4 h-4 me-2" />
              {isCreatingTag
                ? (t("auto.creating"))
                : (t("auto.createTag"))}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
