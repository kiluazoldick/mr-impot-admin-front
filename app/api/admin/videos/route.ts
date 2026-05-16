import { type NextRequest, NextResponse } from "next/server"

import { getServerAuthTokens } from "@/lib/backend/auth/token-storage.server"
import type {
  BackendCreateVideoResponse,
  BackendListVideosResponse,
} from "@/lib/backend/contracts/videos"
import {
  BackendApiError,
  isBackendApiError,
  sanitizePublicErrorMessage,
} from "@/lib/backend/core/errors"
import { createServerApiClientFromCookies } from "@/lib/backend/server/create-server-api-client"

const GENERIC_CREATE_VIDEO_ERROR_MESSAGE = "Create video failed"
const GENERIC_LIST_VIDEOS_ERROR_MESSAGE = "Fetch video list failed"
const IS_DEV = process.env.NODE_ENV === "development"

function debugLog(message: string, meta?: Record<string, unknown>) {
  if (!IS_DEV) {
    return
  }

  if (meta) {
    console.debug(`[api/admin/videos] ${message}`, meta)
    return
  }

  console.debug(`[api/admin/videos] ${message}`)
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

  let formData: FormData

  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ message: "Invalid form data" }, { status: 400 })
  }

  try {
    const apiClient = await createServerApiClientFromCookies()

    // Debug instrumentation (structured, non-sensitive)
    try {
      console.info(JSON.stringify({
        event: "api.proxy.request",
        route: "/api/admin/videos",
        method: "POST",
        hasAccessToken: !!authTokens.accessToken,
        category_id: formData.get("category_id")?.toString() ?? null,
      }))
    } catch {}

    const payload = await apiClient.post<BackendCreateVideoResponse>("api/admin/videos", {
      body: formData,
    })

    // Log created resource id when available
    try {
      console.info(JSON.stringify({
        event: "api.proxy.response",
        route: "/api/admin/videos",
        method: "POST",
        status: 201,
        createdId: payload?.data?.id ?? null,
      }))
    } catch {}

    return NextResponse.json(payload, { status: 201 })
  } catch (error) {
    if (isBackendApiError(error)) {
      const publicMessage = sanitizePublicErrorMessage(
        error.message,
        GENERIC_CREATE_VIDEO_ERROR_MESSAGE
      )

      try {
        console.warn(JSON.stringify({
          event: "api.proxy.error",
          route: "/api/admin/videos",
          method: "POST",
          status: error.status,
          code: error.code,
          category_id: typeof formData !== "undefined" ? formData.get("category_id")?.toString() ?? null : null,
        }))
      } catch {}

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
            message: "Unexpected create video error",
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
    const path = queryString ? `api/admin/videos?${queryString}` : "api/admin/videos"

    debugLog("Fetching videos list", {
      method: request.method,
      path: request.nextUrl.pathname,
      query: queryString || null,
    })

    const payload = await apiClient.get<BackendListVideosResponse>(path)

    debugLog("Videos list fetched", {
      method: request.method,
      path: request.nextUrl.pathname,
      count: Array.isArray(payload.data) ? payload.data.length : null,
    })

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (isBackendApiError(error)) {
      debugLog("Backend API error", {
        method: request.method,
        path: request.nextUrl.pathname,
        status: error.status,
        code: error.code,
      })

      const publicMessage = sanitizePublicErrorMessage(
        error.message,
        GENERIC_LIST_VIDEOS_ERROR_MESSAGE
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
            message: "Unexpected list videos error",
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
