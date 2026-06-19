import { Roles } from "../contexts/AuthContext";
import { getRoomCaseTypeMeta } from "./supportCaseTypes";
import { getConfiguredBlackmailSupportUserId } from "./supportRouting";
import { userAPI } from "./api";

const text = (value) => String(value ?? "").trim();

export function isSensitiveSupportRoom(room = {}, localCaseTypes = {}) {
  const meta = getRoomCaseTypeMeta(room, false, localCaseTypes);
  if (meta.key === "blackmail_abuse" || meta.key === "emergency") return true;
  const raw = text(
    room?.SupportCaseType ??
      room?.supportCaseType ??
      room?.CaseType ??
      room?.caseType,
  ).toLowerCase();
  return /blackmail|abuse|emergency|violence|threat|ابتزاز|عنف|طارئ/.test(raw);
}

function assignedSupportUserId(room = {}) {
  return text(
    room?.DedicatedSupportUserId ??
      room?.dedicatedSupportUserId ??
      room?.AssignedSupportUserId ??
      room?.assignedSupportUserId ??
      room?.AssignedToUserId ??
      room?.assignedToUserId,
  );
}

export function canStaffViewSupportRoom(room, user, role, localCaseTypes = {}) {
  if (role === Roles.ADMIN) return true;
  if (role !== Roles.STAFF) return true;

  if (!isSensitiveSupportRoom(room, localCaseTypes)) return true;

  const viewerId = text(userAPI.resolveUserId(user));
  const assigned = assignedSupportUserId(room);
  const configuredDedicated = getConfiguredBlackmailSupportUserId();

  if (assigned && viewerId) return viewerId === assigned;
  if (configuredDedicated && viewerId) return viewerId === configuredDedicated;

  // Hide sensitive cases from general support pool when no assignment metadata is present.
  return false;
}
