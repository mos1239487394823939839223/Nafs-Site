import { getRoomCaseTypeKey, getSupportRoomTimestamp } from './supportCaseTypes'

export const SUPPORT_ARCHIVE_META_KEY = 'nafs_support_archive_meta'

export const DEFAULT_SUPPORT_LIFECYCLE = {
  inactiveArchiveDays: 30,
  purgeArchivedDays: 90,
}

export function readSupportArchiveMeta() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SUPPORT_ARCHIVE_META_KEY) || '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function writeSupportArchiveMeta(meta) {
  try {
    localStorage.setItem(SUPPORT_ARCHIVE_META_KEY, JSON.stringify(meta))
  } catch {
    // ignore quota errors
  }
}

export function isSensitiveSupportCase(caseKey) {
  return ['emergency', 'blackmail_abuse', 'billing'].includes(String(caseKey || '').toLowerCase())
}

export function getSupportConversationStatus(room, archiveMeta = {}) {
  const roomId = String(room?.Id ?? room?.id ?? '')
  const meta = archiveMeta[roomId] || {}

  const closedFlag =
    room?.IsClosed === true ||
    room?.isClosed === true ||
    String(room?.Status ?? room?.status ?? '').toLowerCase() === 'closed' ||
    meta.status === 'closed'

  if (closedFlag) return 'closed'

  const archivedFlag =
    room?.IsArchived === true ||
    room?.isArchived === true ||
    String(room?.ArchiveStatus ?? room?.archiveStatus ?? '').toLowerCase() === 'archived' ||
    meta.status === 'archived'

  if (archivedFlag) return 'archived'

  return 'active'
}

/**
 * Client-side lifecycle for support rooms when backend archive flags are absent.
 * Sensitive cases (emergency, billing, blackmail) are never auto-hidden.
 */
export function applySupportLifecycleToRooms(rooms = [], localCaseMap = {}, settings = DEFAULT_SUPPORT_LIFECYCLE) {
  const now = Date.now()
  const inactiveMs = Number(settings.inactiveArchiveDays || 30) * 86400000
  const purgeMs = Number(settings.purgeArchivedDays || 90) * 86400000
  const archiveMeta = { ...readSupportArchiveMeta() }
  let metaChanged = false

  const processed = rooms
    .map((room) => {
      const roomId = String(room?.Id ?? room?.id ?? '')
      if (!roomId) return room

      const caseKey = getRoomCaseTypeKey(room, localCaseMap)
      const sensitive = isSensitiveSupportCase(caseKey)
      const lastActivity = getSupportRoomTimestamp(room)
      const existingMeta = archiveMeta[roomId] || {}

      let status = getSupportConversationStatus(room, archiveMeta)

      if (status === 'active' && !sensitive && lastActivity > 0 && now - lastActivity >= inactiveMs) {
        archiveMeta[roomId] = {
          ...existingMeta,
          status: 'archived',
          archivedAt: existingMeta.archivedAt || now,
          lastActivity,
        }
        status = 'archived'
        metaChanged = true
      }

      if (status === 'archived' && !sensitive) {
        const archivedAt = Number(archiveMeta[roomId]?.archivedAt || 0)
        if (archivedAt > 0 && now - archivedAt >= purgeMs) {
          return null
        }
      }

      return {
        ...room,
        ConversationStatus: status,
        SupportPriority:
          caseKey === 'emergency' || caseKey === 'blackmail_abuse'
            ? 'high'
            : room?.SupportPriority ?? room?.supportPriority,
      }
    })
    .filter(Boolean)

  if (metaChanged) writeSupportArchiveMeta(archiveMeta)

  return processed
}
