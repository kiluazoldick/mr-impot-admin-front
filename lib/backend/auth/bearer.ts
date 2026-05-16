import { BACKEND_AUTH_SCHEME } from "@/lib/backend/config/constants"

export function formatBearerToken(token: string) {
  return `${BACKEND_AUTH_SCHEME} ${token}`
}

export function extractBearerToken(headerValue: string | null | undefined) {
  if (!headerValue) {
    return null
  }

  const trimmedHeader = headerValue.trim()
  const authSchemePattern = new RegExp(`^${BACKEND_AUTH_SCHEME}\\s+`, "i")

  if (!authSchemePattern.test(trimmedHeader)) {
    return null
  }

  return trimmedHeader.replace(authSchemePattern, "").trim() || null
}
