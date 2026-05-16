import { type NextRequest, NextResponse } from "next/server"

import { getServerAuthTokens } from "@/lib/backend/auth/token-storage.server"
import type { BackendListUsersResponse } from "@/lib/backend"
import {
  BackendApiError,
  isBackendApiError,
  sanitizePublicErrorMessage,
} from "@/lib/backend/core/errors"
import { createServerApiClientFromCookies } from "@/lib/backend/server/create-server-api-client"

const GENERIC_LIST_USERS_ERROR_MESSAGE = "Fetch user list failed"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function resolveBackendErrors(details: unknown) {
  if (!isRecord(details)) {
    return undefined
  }

  const errors = details.errors

  if (!isRecord(errors)) {
    return undefined
  }

  return errors
}

export async function GET(request: NextRequest) {
  const authTokens = await getServerAuthTokens()

  if (!authTokens.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const apiClient = await createServerApiClientFromCookies()
    const queryString = request.nextUrl.searchParams.toString()
    const path = queryString ? `api/admin/users?${queryString}` : "api/admin/users"
    const payload = await apiClient.get<BackendListUsersResponse>(path)

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (isBackendApiError(error)) {
      const publicMessage = sanitizePublicErrorMessage(
        error.message,
        GENERIC_LIST_USERS_ERROR_MESSAGE
      )

      return NextResponse.json(
        {
          message: publicMessage,
          code: error.code,
          errors: resolveBackendErrors(error.details),
        },
        { status: error.status }
      )
    }

    const fallbackError =
      error instanceof Error
        ? error
        : new BackendApiError({
            status: 500,
            code: "INTERNAL_SERVER_ERROR",
            message: "Unexpected list users error",
          })

    return NextResponse.json(
      {
        message: fallbackError.message,
      },
      { status: 500 }
    )
  }
}
