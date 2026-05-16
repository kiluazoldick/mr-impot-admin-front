import { type NextRequest, NextResponse } from "next/server"

import { getServerAuthTokens } from "@/lib/backend/auth/token-storage.server"
import type {
  BackendCreateDocumentResponse,
  BackendListDocumentsResponse,
} from "@/lib/backend/contracts/documents"
import {
  BackendApiError,
  isBackendApiError,
  sanitizePublicErrorMessage,
} from "@/lib/backend/core/errors"
import { createServerApiClientFromCookies } from "@/lib/backend/server/create-server-api-client"

const GENERIC_CREATE_DOCUMENT_ERROR_MESSAGE = "Create document failed"
const GENERIC_LIST_DOCUMENTS_ERROR_MESSAGE = "Fetch document list failed"
const IS_DEV = process.env.NODE_ENV === "development"

function debugLog(message: string, meta?: Record<string, unknown>) {
  if (!IS_DEV) {
    return
  }

  if (meta) {
    console.debug(`[api/admin/documents] ${message}`, meta)
  } else {
    console.debug(`[api/admin/documents] ${message}`)
  }
}

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
  debugLog("Incoming request", {
    method: request.method,
    path: request.nextUrl.pathname,
  })

  const authTokens = await getServerAuthTokens()

  if (!authTokens.accessToken) {
    debugLog("Unauthorized request", {
      method: request.method,
      path: request.nextUrl.pathname,
    })
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    debugLog("Invalid json payload", {
      method: request.method,
      path: request.nextUrl.pathname,
    })
    return NextResponse.json({ message: "Invalid json payload" }, { status: 400 })
  }

  if (!isRecord(body)) {
    debugLog("Payload is not an object", {
      method: request.method,
      path: request.nextUrl.pathname,
    })
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 })
  }

  try {
    const apiClient = await createServerApiClientFromCookies()
    debugLog("Create document payload", {
      category_id: body.category_id,
      hasTitle: isRecord(body.title),
      hasDescription: isRecord(body.description),
    })

    const payload = await apiClient.post<BackendCreateDocumentResponse>(
      "api/admin/documents",
      {
        json: body,
      }
    )

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (isBackendApiError(error)) {
      debugLog("Backend API error", {
        message: error.message,
        method: request.method,
        path: request.nextUrl.pathname,
        status: error.status,
        code: error.code,
      })
      const publicMessage = sanitizePublicErrorMessage(
        error.message,
        GENERIC_CREATE_DOCUMENT_ERROR_MESSAGE
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
            message: "Unexpected create document error",
          })

    debugLog("Unexpected error", {
      method: request.method,
      path: request.nextUrl.pathname,
      type: error instanceof Error ? error.name : typeof error,
    })

    return NextResponse.json(
      {
        message: fallbackError.message,
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  debugLog("Incoming request", {
    method: request.method,
    path: request.nextUrl.pathname,
    query: request.nextUrl.searchParams.toString(),
  })

  const authTokens = await getServerAuthTokens()

  if (!authTokens.accessToken) {
    debugLog("Unauthorized request", {
      method: request.method,
      path: request.nextUrl.pathname,
    })
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const apiClient = await createServerApiClientFromCookies()
    const queryString = request.nextUrl.searchParams.toString()
    const path = queryString
      ? `api/admin/documents?${queryString}`
      : "api/admin/documents"
    const payload = await apiClient.get<BackendListDocumentsResponse>(path)

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (isBackendApiError(error)) {
      debugLog("Backend API error", {
        message: error.message,
        method: request.method,
        path: request.nextUrl.pathname,
        status: error.status,
        code: error.code,
      })

      const publicMessage = sanitizePublicErrorMessage(
        error.message,
        GENERIC_LIST_DOCUMENTS_ERROR_MESSAGE
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
            message: "Unexpected list documents error",
          })

    debugLog("Unexpected error", {
      method: request.method,
      path: request.nextUrl.pathname,
      type: error instanceof Error ? error.name : typeof error,
    })

    return NextResponse.json(
      {
        message: fallbackError.message,
      },
      { status: 500 }
    )
  }
}
