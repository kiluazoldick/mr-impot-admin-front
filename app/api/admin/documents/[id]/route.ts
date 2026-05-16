import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getServerAuthTokens } from "@/lib/backend/auth/token-storage.server"
import type {
  BackendDocumentResponse,
  BackendUpdateDocumentRequest,
} from "@/lib/backend/contracts/documents"
import {
  BackendApiError,
  isBackendApiError,
  sanitizePublicErrorMessage,
} from "@/lib/backend/core/errors"
import { createServerApiClientFromCookies } from "@/lib/backend/server/create-server-api-client"

const updateDocumentSchema = z.object({
  category_id: z.string().trim().min(1),
  title: z.object({
    fr: z.string().trim().min(1),
    en: z.string().trim().min(1),
  }),
  description: z.object({
    fr: z.string().trim().min(1),
    en: z.string().trim().min(1),
  }),
})

const GENERIC_GET_DOCUMENT_ERROR_MESSAGE = "Fetch document failed"
const GENERIC_UPDATE_DOCUMENT_ERROR_MESSAGE = "Update document failed"
const GENERIC_DELETE_DOCUMENT_ERROR_MESSAGE = "Delete document failed"
const IS_DEV = process.env.NODE_ENV === "development"

function debugLog(message: string, meta?: Record<string, unknown>) {
  if (!IS_DEV) {
    return
  }

  if (meta) {
    console.debug(`[api/admin/documents/[id]] ${message}`, meta)
  } else {
    console.debug(`[api/admin/documents/[id]] ${message}`)
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

function resolveDocumentId(params?: { id?: string }) {
  const id = params?.id?.trim()
  return id || null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const documentId = resolveDocumentId(await params)

  if (!documentId) {
    debugLog("Missing document id", {
      method: request.method,
      path: request.nextUrl.pathname,
    })
    return NextResponse.json({ message: "Document id is required" }, { status: 400 })
  }

  try {
    const apiClient = await createServerApiClientFromCookies()
    const payload = await apiClient.get<BackendDocumentResponse>(
      `api/admin/documents/${documentId}`
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
        GENERIC_GET_DOCUMENT_ERROR_MESSAGE
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
            message: "Unexpected get document error",
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const documentId = resolveDocumentId(await params)

  if (!documentId) {
    debugLog("Missing document id", {
      method: request.method,
      path: request.nextUrl.pathname,
    })
    return NextResponse.json({ message: "Document id is required" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const parsed = updateDocumentSchema.safeParse(body)

    if (!parsed.success) {
      debugLog("Validation failed", {
        method: request.method,
        path: request.nextUrl.pathname,
      })
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 422 }
      )
    }

    const apiClient = await createServerApiClientFromCookies()
    debugLog("Update document payload", {
      documentId,
      category_id: parsed.data.category_id,
      hasTitle: isRecord(parsed.data.title),
      hasDescription: isRecord(parsed.data.description),
    })
    const payload = await apiClient.put<BackendDocumentResponse>(
      `api/admin/documents/${documentId}`,
      {
        json: {
          category_id: parsed.data.category_id,
          title: parsed.data.title,
          description: parsed.data.description,
        } satisfies BackendUpdateDocumentRequest,
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
        GENERIC_UPDATE_DOCUMENT_ERROR_MESSAGE
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
            message: "Unexpected update document error",
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const documentId = resolveDocumentId(await params)

  if (!documentId) {
    debugLog("Missing document id", {
      method: request.method,
      path: request.nextUrl.pathname,
    })
    return NextResponse.json({ message: "Document id is required" }, { status: 400 })
  }

  try {
    const apiClient = await createServerApiClientFromCookies()
    await apiClient.delete(`api/admin/documents/${documentId}`)

    return new NextResponse(null, { status: 204 })
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
        GENERIC_DELETE_DOCUMENT_ERROR_MESSAGE
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
            message: "Unexpected delete document error",
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
