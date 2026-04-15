const TESTS_STORAGE_KEY = 'nafs_available_tests_v2'
const TESTS_STORAGE_LEGACY_KEY = 'nafs_available_tests_v1'
const TEST_TAGS_STORAGE_KEY = 'nafs_test_tags_v1'
const TEST_RESULTS_STORAGE_KEY = 'nafs_test_results_v1'

function parseStoredArray(rawValue) {
  if (!rawValue) return []

  try {
    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function randomId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function cleanText(value) {
  return String(value || '').trim()
}

function normalizeTagName(name) {
  return cleanText(name).toLowerCase()
}

function getStorageArray(key) {
  if (typeof window === 'undefined') return []
  return parseStoredArray(window.localStorage.getItem(key))
}

function setStorageArray(key, value) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function normalizeTestsShape(tests, tags) {
  const tagById = new Map(tags.map(tag => [String(tag.id), tag]))

  return tests
    .filter(test => test && test.id && test.name && test.url)
    .map((test) => {
      const tagId = cleanText(test.tagId || test.TagID || test.tagID)
      const rawTagName = cleanText(test.tagName || test.tag)
      const matchedTagName = tagId ? cleanText(tagById.get(tagId)?.name) : ''
      const tagName = matchedTagName || rawTagName

      return {
        ...test,
        id: String(test.id),
        name: cleanText(test.name),
        description: cleanText(test.description),
        url: cleanText(test.url),
        tagId,
        tagName,
        createdAt: test.createdAt || new Date().toISOString(),
      }
    })
}

function runLegacyMigration() {
  if (typeof window === 'undefined') return
  const migratedFlag = window.localStorage.getItem('nafs_tests_migrated_v2')
  if (migratedFlag === '1') return

  const legacyTests = parseStoredArray(window.localStorage.getItem(TESTS_STORAGE_LEGACY_KEY))
  const currentTags = parseStoredArray(window.localStorage.getItem(TEST_TAGS_STORAGE_KEY))
  const currentTests = parseStoredArray(window.localStorage.getItem(TESTS_STORAGE_KEY))

  if (legacyTests.length === 0) {
    window.localStorage.setItem('nafs_tests_migrated_v2', '1')
    return
  }

  const tagMap = new Map(currentTags.map(tag => [normalizeTagName(tag.name), tag]))
  const migratedTags = [...currentTags]
  const migratedTests = [...currentTests]

  legacyTests.forEach((legacyTest) => {
    if (!legacyTest || !legacyTest.id) return

    const existing = migratedTests.some(test => String(test.id) === String(legacyTest.id))
    if (existing) return

    const legacyTagName = cleanText(legacyTest.tag)
    let tag = null

    if (legacyTagName) {
      tag = tagMap.get(normalizeTagName(legacyTagName)) || null
      if (!tag) {
        tag = {
          id: randomId('tag'),
          name: legacyTagName,
          createdAt: new Date().toISOString(),
        }
        migratedTags.unshift(tag)
        tagMap.set(normalizeTagName(tag.name), tag)
      }
    }

    migratedTests.push({
      id: String(legacyTest.id),
      name: cleanText(legacyTest.name),
      description: cleanText(legacyTest.description),
      url: cleanText(legacyTest.url),
      tagId: tag?.id || '',
      tagName: tag?.name || legacyTagName,
      createdAt: legacyTest.createdAt || new Date().toISOString(),
    })
  })

  setStorageArray(TEST_TAGS_STORAGE_KEY, migratedTags)
  setStorageArray(TESTS_STORAGE_KEY, migratedTests)
  window.localStorage.setItem('nafs_tests_migrated_v2', '1')
}

runLegacyMigration()

export function getTestTags() {
  const tags = getStorageArray(TEST_TAGS_STORAGE_KEY)
  return tags
    .filter(tag => tag && tag.id && cleanText(tag.name))
    .map(tag => ({
      id: String(tag.id),
      name: cleanText(tag.name),
      createdAt: tag.createdAt || new Date().toISOString(),
    }))
}

export function saveTestTags(tags) {
  setStorageArray(TEST_TAGS_STORAGE_KEY, tags)
}

export function addTestTag(tagName) {
  const cleanName = cleanText(tagName)
  if (!cleanName) return getTestTags()

  const currentTags = getTestTags()
  const exists = currentTags.some(tag => normalizeTagName(tag.name) === normalizeTagName(cleanName))
  if (exists) return currentTags

  const nextTag = {
    id: randomId('tag'),
    name: cleanName,
    createdAt: new Date().toISOString(),
  }

  const updated = [nextTag, ...currentTags]
  saveTestTags(updated)
  return updated
}

export function getAvailableTests() {
  const tags = getTestTags()
  const tests = getStorageArray(TESTS_STORAGE_KEY)
  return normalizeTestsShape(tests, tags)
}

export function saveAvailableTests(tests) {
  setStorageArray(TESTS_STORAGE_KEY, tests)
}

export function addAvailableTest(testInput) {
  const currentTags = getTestTags()
  const tagId = cleanText(testInput.tagId)
  const selectedTag = currentTags.find(tag => String(tag.id) === String(tagId))
  const providedTagName = cleanText(testInput.tagName || testInput.tag)

  const nextTest = {
    id: randomId('test'),
    name: cleanText(testInput.name),
    description: cleanText(testInput.description),
    url: cleanText(testInput.url),
    tagId,
    tagName: selectedTag?.name || providedTagName || '',
    createdAt: new Date().toISOString(),
  }

  const updatedTests = [nextTest, ...getAvailableTests()]
  saveAvailableTests(updatedTests)
  return updatedTests
}

export function deleteAvailableTest(testId) {
  const updatedTests = getAvailableTests().filter(test => String(test.id) !== String(testId))
  saveAvailableTests(updatedTests)

  const resultsAfterDelete = getAllTestResults().filter(result => String(result.testId) !== String(testId))
  saveAllTestResults(resultsAfterDelete)

  return updatedTests
}

export function getAllTestResults() {
  return getStorageArray(TEST_RESULTS_STORAGE_KEY)
    .filter(result => result && result.id && result.testId && result.userId)
    .map(result => ({
      ...result,
      id: String(result.id),
      testId: String(result.testId),
      userId: String(result.userId),
      userRole: cleanText(result.userRole),
      userName: cleanText(result.userName),
      resultText: cleanText(result.resultText),
      submittedAt: result.submittedAt || new Date().toISOString(),
    }))
}

export function saveAllTestResults(results) {
  setStorageArray(TEST_RESULTS_STORAGE_KEY, results)
}

export function getUserTestResults(userId) {
  const normalizedUserId = cleanText(userId)
  if (!normalizedUserId) return []
  return getAllTestResults().filter(result => String(result.userId) === String(normalizedUserId))
}

export function getUserResultForTest(userId, testId) {
  const normalizedUserId = cleanText(userId)
  const normalizedTestId = cleanText(testId)
  if (!normalizedUserId || !normalizedTestId) return null

  return getAllTestResults().find(
    result => String(result.userId) === String(normalizedUserId) && String(result.testId) === String(normalizedTestId)
  ) || null
}

export function submitTestResult({ testId, userId, userRole, userName, resultText }) {
  const normalizedTestId = cleanText(testId)
  const normalizedUserId = cleanText(userId)
  const normalizedResultText = cleanText(resultText)

  if (!normalizedTestId || !normalizedUserId || !normalizedResultText) {
    return { ok: false, error: 'INVALID_PAYLOAD' }
  }

  const existing = getUserResultForTest(normalizedUserId, normalizedTestId)
  if (existing) {
    return { ok: false, error: 'ALREADY_SUBMITTED', result: existing }
  }

  const nextResult = {
    id: randomId('result'),
    testId: normalizedTestId,
    userId: normalizedUserId,
    userRole: cleanText(userRole),
    userName: cleanText(userName),
    resultText: normalizedResultText,
    submittedAt: new Date().toISOString(),
  }

  const updated = [nextResult, ...getAllTestResults()]
  saveAllTestResults(updated)
  return { ok: true, result: nextResult, results: updated }
}
