import { type NextRequest, NextResponse } from "next/server"

import { getServerAuthTokens } from "@/lib/backend/auth/token-storage.server"
import type { BackendCreateVideoResponse } from "@/lib/backend/contracts/videos"
import {
  BackendApiError,
  isBackendApiError,
  sanitizePublicErrorMessage,
} from "@/lib/backend/core/errors"
import { createServerApiClientFromCookies } from "@/lib/backend/server/create-server-api-client"

const GENERIC_UPDATE_VIDEO_ERROR_MESSAGE = "Update video failed"
const IS_DEV = process.env.NODE_ENV === "development"

function debugLog(message: string, meta?: Record<string, unknown>) {
  if (!IS_DEV) return
  if (meta) {
    console.debug(`[api/admin/videos/[video]] ${message}`, meta)
    return
  }
  console.debug(`[api/admin/videos/[video]] ${message}`)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function resolveBackendErrors(details: unknown) {
  if (!isRecord(details)) return undefined
  const errors = details.errors
  if (!isRecord(errors)) return undefined
  return errors
}

export async function PUT(request: NextRequest) {
  debugLog("Incoming request", { method: request.method, path: request.nextUrl.pathname })

  const authTokens = await getServerAuthTokens()

  if (!authTokens.accessToken) {
    debugLog("Unauthorized request", { method: request.method, path: request.nextUrl.pathname })
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const videoId = request.nextUrl.pathname.split("/").pop() || null

  if (!videoId) {
    return NextResponse.json({ message: "Missing video id" }, { status: 400 })
  }

  let formData: FormData

  try {
    formData = await request.formData()
  } catch {
    debugLog("Invalid form data", { path: request.nextUrl.pathname })
    return NextResponse.json({ message: "Invalid form data" }, { status: 400 })
  }

  try {
    const apiClient = await createServerApiClientFromCookies()

    debugLog("Proxying update request", { videoId, hasVideo: !!formData.get("video") })

    const payload = await apiClient.put<BackendCreateVideoResponse>(
      `api/admin/videos/${videoId}`,
      {
        body: formData,
      }
    )

    debugLog("Update proxied response", { videoId, createdId: payload?.data?.id ?? null })

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (isBackendApiError(error)) {
      const publicMessage = sanitizePublicErrorMessage(error.message, GENERIC_UPDATE_VIDEO_ERROR_MESSAGE)

      debugLog("Backend API error", { status: error.status, code: error.code })

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
        : new BackendApiError({ status: 500, code: "INTERNAL_SERVER_ERROR", message: "Unexpected update video error" })

    debugLog("Unexpected error", { type: error instanceof Error ? error.name : typeof error })

    return NextResponse.json({ message: fallbackError.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  debugLog("Incoming request", { method: request.method, path: request.nextUrl.pathname })

  const authTokens = await getServerAuthTokens()

  if (!authTokens.accessToken) {
    debugLog("Unauthorized request", { method: request.method, path: request.nextUrl.pathname })
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const videoId = request.nextUrl.pathname.split("/").pop() || null

  if (!videoId) {
    return NextResponse.json({ message: "Missing video id" }, { status: 400 })
  }

  try {
    const apiClient = await createServerApiClientFromCookies()

    debugLog("Fetching single video", { videoId })

    const payload = await apiClient.get<BackendCreateVideoResponse>(`api/admin/videos/${videoId}`)

    debugLog("Single video fetched", { videoId })

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (isBackendApiError(error)) {
      const publicMessage = sanitizePublicErrorMessage(error.message, "Fetch video failed")

      debugLog("Backend API error", { status: error.status, code: error.code })

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
        : new BackendApiError({ status: 500, code: "INTERNAL_SERVER_ERROR", message: "Unexpected fetch video error" })

    debugLog("Unexpected error", { type: error instanceof Error ? error.name : typeof error })

    return NextResponse.json({ message: fallbackError.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  debugLog("Incoming request", { method: request.method, path: request.nextUrl.pathname })

  const authTokens = await getServerAuthTokens()

  if (!authTokens.accessToken) {
    debugLog("Unauthorized request", { method: request.method, path: request.nextUrl.pathname })
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const videoId = request.nextUrl.pathname.split("/").pop() || null

  if (!videoId) {
    return NextResponse.json({ message: "Missing video id" }, { status: 400 })
  }

  try {
    const apiClient = await createServerApiClientFromCookies()

    debugLog("Proxying delete request", { videoId })

    await apiClient.delete(`api/admin/videos/${videoId}`)

    debugLog("Delete proxied response", { videoId, status: 204 })

    // 204 No Content
    return NextResponse.json(null, { status: 204 })
  } catch (error) {
    if (isBackendApiError(error)) {
      const publicMessage = sanitizePublicErrorMessage(error.message, "Delete video failed")

      debugLog("Backend API error", { status: error.status, code: error.code })

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
        : new BackendApiError({ status: 500, code: "INTERNAL_SERVER_ERROR", message: "Unexpected delete video error" })

    debugLog("Unexpected error", { type: error instanceof Error ? error.name : typeof error })

    return NextResponse.json({ message: fallbackError.message }, { status: 500 })
  }
}
