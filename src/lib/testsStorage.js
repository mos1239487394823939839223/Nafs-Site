const TESTS_STORAGE_KEY = 'nafs_available_tests_v1'

function parseStoredTests(rawValue) {
  if (!rawValue) return []

  try {
    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function getAvailableTests() {
  if (typeof window === 'undefined') return []

  const tests = parseStoredTests(window.localStorage.getItem(TESTS_STORAGE_KEY))
  return tests.filter(test => test && test.id && test.name && test.url)
}

export function saveAvailableTests(tests) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TESTS_STORAGE_KEY, JSON.stringify(tests))
}

export function addAvailableTest(testInput) {
  const nextTest = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: String(testInput.name || '').trim(),
    description: String(testInput.description || '').trim(),
    url: String(testInput.url || '').trim(),
    tag: String(testInput.tag || '').trim(),
    createdAt: new Date().toISOString(),
  }

  const currentTests = getAvailableTests()
  const updatedTests = [nextTest, ...currentTests]
  saveAvailableTests(updatedTests)
  return updatedTests
}

export function deleteAvailableTest(testId) {
  const currentTests = getAvailableTests()
  const updatedTests = currentTests.filter(test => test.id !== testId)
  saveAvailableTests(updatedTests)
  return updatedTests
}
