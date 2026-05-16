import { cookies } from "next/headers"

import { getServerAuthTokens } from "@/lib/backend/auth/token-storage.server"
import { getBackendServerEnv } from "@/lib/backend/config/env"
import {
  createBackendHttpClient,
  type BackendHttpClient,
} from "@/lib/backend/core/http-client"
import { routing } from "@/i18n/routing"

const NEXT_INTL_LOCALE_COOKIE_NAME = "NEXT_LOCALE"

export interface CreateServerApiClientOptions {
  accessToken?: string | null
  acceptLanguage?: string | null
}

async function resolveServerAcceptLanguage(explicitLanguage?: string | null): Promise<string> {
  const normalizedExplicit = typeof explicitLanguage === "string" ? explicitLanguage.trim() : ""

  if (normalizedExplicit) {
    return normalizedExplicit
  }

  try {
    const cookieStore = await cookies()
    const cookieLocale = cookieStore.get(NEXT_INTL_LOCALE_COOKIE_NAME)?.value ?? ""
    const normalizedCookieLocale = cookieLocale.trim()

    if (normalizedCookieLocale && routing.locales.includes(normalizedCookieLocale as "en" | "fr")) {
      return normalizedCookieLocale
    }
  } catch {
    return routing.defaultLocale
  }

  return routing.defaultLocale
}

export function createServerApiClient(
  options: CreateServerApiClientOptions = {}
): BackendHttpClient {
  const env = getBackendServerEnv()

  return createBackendHttpClient({
    baseUrl: env.BACKEND_API_BASE_URL,
    timeoutMs: env.BACKEND_API_TIMEOUT_MS,
    tokenResolver: () => options.accessToken ?? null,
    acceptLanguageResolver: () => resolveServerAcceptLanguage(options.acceptLanguage),
  })
}

export async function createServerApiClientFromCookies() {
  const authTokens = await getServerAuthTokens()

  return createServerApiClient({
    accessToken: authTokens.accessToken,
  })
}
