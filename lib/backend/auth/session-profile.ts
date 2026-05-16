import type { BackendAuthUser } from "@/lib/backend/contracts/auth"

export const BACKEND_SESSION_PROFILE_COOKIE_NAME = "mr_impot_session_profile"

export interface BackendSessionProfile {
  id: string
  fullName: string
  email: string
  avatar: string | null
  preferredLanguage: string | null
}

export function toBackendSessionProfile(user: BackendAuthUser): BackendSessionProfile {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    avatar: user.avatar,
    preferredLanguage: user.preferredLanguage,
  }
}

export function encodeBackendSessionProfile(profile: BackendSessionProfile): string {
  return Buffer.from(JSON.stringify(profile), "utf-8").toString("base64url")
}

export function decodeBackendSessionProfile(rawCookieValue: string | null | undefined): BackendSessionProfile | null {
  if (!rawCookieValue) {
    return null
  }

  try {
    const parsed = JSON.parse(Buffer.from(rawCookieValue, "base64url").toString("utf-8")) as Partial<BackendSessionProfile>

    if (
      typeof parsed.id !== "string" ||
      typeof parsed.fullName !== "string" ||
      typeof parsed.email !== "string"
    ) {
      return null
    }

    return {
      id: parsed.id,
      fullName: parsed.fullName,
      email: parsed.email,
      avatar: typeof parsed.avatar === "string" ? parsed.avatar : null,
      preferredLanguage: typeof parsed.preferredLanguage === "string" ? parsed.preferredLanguage : null,
    }
  } catch {
    return null
  }
}
