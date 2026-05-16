import { NextResponse } from "next/server"

import { BACKEND_SESSION_PROFILE_COOKIE_NAME } from "@/lib/backend/auth/session-profile"
import { getBackendServerEnv } from "@/lib/backend/config/env"
import {
  BackendApiError,
  isBackendApiError,
  sanitizePublicErrorMessage,
} from "@/lib/backend/core/errors"
import { createServerApiClientFromCookies } from "@/lib/backend/server/create-server-api-client"
import { getServerAuthTokens } from "@/lib/backend/auth/token-storage.server"

const GENERIC_LOGOUT_ERROR_MESSAGE = "Logout failed"

function buildLogoutResponse(status: number, payload?: { message?: string; code?: string }) {
  const env = getBackendServerEnv()
  const response = NextResponse.json(
    {
      message: payload?.message ?? null,
      code: payload?.code,
    },
    { status }
  )

  response.cookies.delete(env.BACKEND_ACCESS_TOKEN_COOKIE_NAME)
  response.cookies.delete(env.BACKEND_REFRESH_TOKEN_COOKIE_NAME)
  response.cookies.delete(BACKEND_SESSION_PROFILE_COOKIE_NAME)

  return response
}

export async function POST() {
  const authTokens = await getServerAuthTokens()

  if (!authTokens.accessToken) {
    return buildLogoutResponse(401)
  }

  try {
    const apiClient = await createServerApiClientFromCookies()
    await apiClient.post("api/auth/logout")

    return buildLogoutResponse(200)
  } catch (error) {
    if (isBackendApiError(error)) {
      if (error.status === 401) {
        return buildLogoutResponse(401)
      }

      const publicMessage = sanitizePublicErrorMessage(
        error.message,
        GENERIC_LOGOUT_ERROR_MESSAGE
      )

      return buildLogoutResponse(error.status, {
        message: publicMessage,
        code: error.code,
      })
    }

    const fallbackError =
      error instanceof Error
        ? error
        : new BackendApiError({
            status: 500,
            code: "INTERNAL_SERVER_ERROR",
            message: "Unexpected logout error",
          })

    return buildLogoutResponse(500, { message: fallbackError.message })
  }
}
