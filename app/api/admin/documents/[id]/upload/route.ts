import { type NextRequest, NextResponse } from "next/server"

import { getServerAuthTokens } from "@/lib/backend/auth/token-storage.server"
import type { BackendUploadDocumentResponse } from "@/lib/backend/contracts/documents"
import {
  BackendApiError,
  isBackendApiError,
  sanitizePublicErrorMessage,
} from "@/lib/backend/core/errors"
import { createServerApiClientFromCookies } from "@/lib/backend/server/create-server-api-client"

const GENERIC_UPLOAD_DOCUMENT_ERROR_MESSAGE = "Upload document failed"
const IS_DEV = process.env.NODE_ENV === "development"

function debugLog(message: string, meta?: Record<string, unknown>) {
  if (!IS_DEV) {
    return
  }

  if (meta) {
    console.debug(`[api/admin/documents/upload] ${message}`, meta)
  } else {
    console.debug(`[api/admin/documents/upload] ${message}`)
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

export async function POST(
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
    return NextResponse.json({ message: "Document id is required" }, { status: 400 })
  }

  let formData: FormData

  try {
    formData = await request.formData()
  } catch {
    debugLog("Invalid form data", {
      method: request.method,
      path: request.nextUrl.pathname,
    })
    return NextResponse.json({ message: "Invalid form data" }, { status: 400 })
  }

  if (IS_DEV) {
    const debugEntries = await Promise.all(
      Array.from(formData.entries()).map(async ([key, value]) => {
        if (value instanceof File) {
          const buffer = await value.arrayBuffer()
          const bytes = new Uint8Array(buffer)
          const previewBytes = bytes.slice(0, 256)
          const previewBase64 = Buffer.from(previewBytes).toString("base64")

          return {
            key,
            type: "file",
            name: value.name,
            size: value.size,
            mime: value.type,
            previewByteLength: previewBytes.length,
            previewBase64,
          }
        }

        return {
          key,
          type: "field",
          value: String(value),
        }
      })
    )

    debugLog("Upload payload", { entries: debugEntries })
  }

  try {
    const apiClient = await createServerApiClientFromCookies()
    const payload = await apiClient.post<BackendUploadDocumentResponse>(
      `api/admin/documents/${documentId}/upload`,
      {
        body: formData,
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
        GENERIC_UPLOAD_DOCUMENT_ERROR_MESSAGE
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
            message: "Unexpected document upload error",
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
