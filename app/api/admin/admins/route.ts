import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getServerAuthTokens } from "@/lib/backend/auth/token-storage.server"
import type {
  BackendCreateAdminRequest,
  BackendCreateAdminResponse,
  BackendListAdminsResponse,
} from "@/lib/backend"
import {
  BackendApiError,
  isBackendApiError,
  sanitizePublicErrorMessage,
} from "@/lib/backend/core/errors"
import { createServerApiClientFromCookies } from "@/lib/backend/server/create-server-api-client"

const createAdminSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().trim().min(8),
  role: z.enum(["admin", "super-admin"]),
  permissions: z.array(z.string()).nullable().optional(),
})

const GENERIC_CREATE_ADMIN_ERROR_MESSAGE = "Create admin failed"
const GENERIC_LIST_ADMINS_ERROR_MESSAGE = "Fetch admin list failed"

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

export async function POST(request: NextRequest) {
  const authTokens = await getServerAuthTokens()

  if (!authTokens.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = createAdminSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 422 }
      )
    }

    const apiClient = await createServerApiClientFromCookies()
    const payload = await apiClient.post<BackendCreateAdminResponse>("api/admin/admins", {
      json: {
        ...parsed.data,
        permissions: parsed.data.permissions ?? null,
      } satisfies BackendCreateAdminRequest,
    })

    return NextResponse.json(payload, { status: 201 })
  } catch (error) {
    if (isBackendApiError(error)) {
      const publicMessage = sanitizePublicErrorMessage(
        error.message,
        GENERIC_CREATE_ADMIN_ERROR_MESSAGE
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
            message: "Unexpected create admin error",
          })

    return NextResponse.json(
      {
        message: fallbackError.message,
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  const authTokens = await getServerAuthTokens()

  if (!authTokens.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const apiClient = await createServerApiClientFromCookies()
    const payload = await apiClient.get<BackendListAdminsResponse>("api/admin/admins")

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (isBackendApiError(error)) {
      const publicMessage = sanitizePublicErrorMessage(
        error.message,
        GENERIC_LIST_ADMINS_ERROR_MESSAGE
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
            message: "Unexpected list admins error",
          })

    return NextResponse.json(
      {
        message: fallbackError.message,
      },
      { status: 500 }
    )
  }
}
