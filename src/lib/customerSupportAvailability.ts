export interface UpdateCustomerSupportAvailabilityRequest {
  IsAvailable: boolean;
}

export interface ApiResponse<T> {
  Data: T;
  IsSuccess: boolean;
  Message: string;
  ErrorCode: number;
  IsAuthorized: boolean;
}

export function readCustomerSupportAvailability(user: Record<string, unknown> | null | undefined): boolean | null {
  const candidates = [
    user?.IsAvailable,
    user?.isAvailable,
    user?.IsSupportAvailable,
    user?.isSupportAvailable,
    user?.SupportAvailable,
    user?.supportAvailable,
    user?.CustomerSupportAvailable,
    user?.customerSupportAvailable,
    user?.IsOnline,
    user?.isOnline,
  ];

  const value = candidates.find((item) => item !== undefined && item !== null);
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "available", "active", "online"].includes(normalized)) return true;
    if (["false", "0", "unavailable", "inactive", "offline"].includes(normalized)) return false;
  }

  return null;
}
