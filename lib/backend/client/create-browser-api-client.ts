"use client"
import { getBackendPublicEnv } from "@/lib/backend/config/env"
import {
  createBackendHttpClient,
  type BackendHttpClient,
} from "@/lib/backend/core/http-client"

let cachedBrowserApiClient: BackendHttpClient | null = null

function resolveBrowserAcceptLanguage(): string | null {
  const documentLanguage = document.documentElement.lang?.trim()

  if (documentLanguage) {
    return documentLanguage
  }

  const navigatorLanguage = navigator.language?.trim()

  return navigatorLanguage || null
}

export function getBrowserApiClient() {
  if (cachedBrowserApiClient) {
    return cachedBrowserApiClient
  }

  const env = getBackendPublicEnv()

  cachedBrowserApiClient = createBackendHttpClient({
    baseUrl: env.NEXT_PUBLIC_INTERNAL_API_BASE_PATH,
    credentials: "same-origin",
    acceptLanguageResolver: resolveBrowserAcceptLanguage,
  })

  return cachedBrowserApiClient
}
