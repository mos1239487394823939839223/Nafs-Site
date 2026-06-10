export function normalizeTestTypeItem(item, { diseaseNameById = new Map(), fallbackTag = '' } = {}) {
  const id = item?.ID ?? item?.Id ?? item?.id
  const name = String(item?.Name ?? item?.name ?? '').trim()
  if (!id || !name) return null

  const diseaseIds = Array.isArray(item?.DiseaseIds)
    ? item.DiseaseIds.map((value) => Number(value)).filter((value) => Number.isFinite(value) && value > 0)
    : []

  const tagNamesFromDiseases = diseaseIds
    .map((diseaseId) => diseaseNameById.get(String(diseaseId)))
    .filter(Boolean)

  const rawTags = Array.isArray(item?.Tags) ? item.Tags : Array.isArray(item?.tags) ? item.tags : []
  const tagNamesFromPayload = rawTags
    .map((tag) => {
      if (typeof tag === 'string') return tag.trim()
      return String(tag?.Name ?? tag?.name ?? '').trim()
    })
    .filter(Boolean)

  const resolvedTagNames =
    tagNamesFromDiseases.length > 0 ? tagNamesFromDiseases : tagNamesFromPayload

  const questions = Array.isArray(item?.Questions)
    ? item.Questions
    : Array.isArray(item?.questions)
      ? item.questions
      : []

  const questionCountRaw = Number(
    item?.QuestionCount ??
      item?.QuestionsCount ??
      item?.NumberOfQuestions ??
      item?.questionCount ??
      questions.length,
  )

  return {
    id: String(id),
    name,
    description: String(item?.Description ?? item?.description ?? '').trim(),
    purpose: String(
      item?.Purpose ?? item?.purpose ?? item?.Goal ?? item?.goal ?? item?.Objective ?? item?.objective ?? '',
    ).trim(),
    duration: String(
      item?.Duration ??
        item?.duration ??
        item?.DurationMinutes ??
        item?.durationMinutes ??
        item?.EstimatedDuration ??
        item?.estimatedDuration ??
        '',
    ).trim(),
    questionCount: Number.isFinite(questionCountRaw) && questionCountRaw > 0 ? questionCountRaw : null,
    price: item?.Price ?? item?.price ?? item?.TestPrice ?? item?.testPrice ?? item?.Cost ?? item?.cost ?? null,
    steps:
      item?.Steps ??
      item?.steps ??
      item?.Instructions ??
      item?.instructions ??
      item?.BookingSteps ??
      item?.bookingSteps ??
      '',
    url: String(item?.Url ?? item?.url ?? item?.ExternalUrl ?? item?.externalUrl ?? '').trim(),
    tagName: resolvedTagNames.join(', ') || fallbackTag,
  }
}

export function parseTestSteps(steps) {
  if (Array.isArray(steps)) return steps.map((step) => String(step?.Name ?? step?.name ?? step).trim()).filter(Boolean)
  return String(steps || '')
    .split(/\r?\n|,/)
    .map((step) => step.trim())
    .filter(Boolean)
}
