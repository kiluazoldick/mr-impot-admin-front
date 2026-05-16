import { type NextRequest, NextResponse } from "next/server"

import {
  BACKEND_SESSION_PROFILE_COOKIE_NAME,
  encodeBackendSessionProfile,
  toBackendSessionProfile,
} from "@/lib/backend/auth/session-profile"
import { persistServerAuthTokens } from "@/lib/backend/auth/token-storage.server"
import { type BackendLoginApiResponse } from "@/lib/backend/contracts/auth"
import { getBackendServerEnv } from "@/lib/backend/config/env"
import {
  BackendApiError,
  isBackendApiError,
  sanitizePublicErrorMessage,
} from "@/lib/backend/core/errors"
import { createServerApiClient } from "@/lib/backend/server/create-server-api-client"
import { normalizeLoginResponse } from "@/lib/backend/server/auth"
import { routing } from "@/i18n/routing"
import { loginSchema } from "@/lib/validations/auth"

const NEXT_INTL_LOCALE_COOKIE_NAME = "NEXT_LOCALE"
const GENERIC_LOGIN_ERROR_MESSAGE = "Login failed"

function resolvePreferredLocale(preferredLanguage: string | null): string {
  const preferred = preferredLanguage?.toLowerCase().trim()

  if (preferred?.startsWith("fr")) {
    return "fr"
  }

  if (preferred?.startsWith("en")) {
    return "en"
  }

  return routing.defaultLocale
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 422 }
      )
    }

    const apiClient = createServerApiClient()
    const backendPayload = await apiClient.post<BackendLoginApiResponse>("api/auth/login", {
      json: {
        email: parsed.data.email,
        password: parsed.data.password,
      },
    })

    const loginResponse = normalizeLoginResponse(backendPayload)
    const env = getBackendServerEnv()

    await persistServerAuthTokens(loginResponse.tokens)

    const locale = resolvePreferredLocale(loginResponse.user.preferredLanguage)

    const response = NextResponse.json({
      message: null,
      data: {
        user: loginResponse.user,
      },
    })

    response.cookies.set(NEXT_INTL_LOCALE_COOKIE_NAME, locale, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    })

    response.cookies.set(
      BACKEND_SESSION_PROFILE_COOKIE_NAME,
      encodeBackendSessionProfile(toBackendSessionProfile(loginResponse.user)),
      {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: env.BACKEND_COOKIE_SECURE,
        maxAge: loginResponse.tokens.expiresIn,
      }
    )

    return response
  } catch (error) {
    if (isBackendApiError(error)) {
      const publicMessage = sanitizePublicErrorMessage(
        error.message,
        GENERIC_LOGIN_ERROR_MESSAGE
      )

      return NextResponse.json(
        {
          message: publicMessage,
          code: error.code,
        },
        { status: error.status }
      )
    }

    const fallbackError = error instanceof Error ? error : new BackendApiError({
      status: 500,
      code: "INTERNAL_SERVER_ERROR",
      message: "Unexpected login error",
    })

    return NextResponse.json(
      {
        message: fallbackError.message,
      },
      { status: 500 }
    )
  }
}
