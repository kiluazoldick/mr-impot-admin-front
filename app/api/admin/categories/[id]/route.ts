import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getServerAuthTokens } from "@/lib/backend/auth/token-storage.server"
import type {
  BackendAdminCategoryResponse,
  BackendDeleteAdminCategoryResponse,
  BackendUpdateAdminCategoryRequest,
} from "@/lib/backend/contracts/categories"
import {
  BackendApiError,
  isBackendApiError,
  sanitizePublicErrorMessage,
} from "@/lib/backend/core/errors"
import { createServerApiClientFromCookies } from "@/lib/backend/server/create-server-api-client"

const localizedNameSchema = z.object({
  fr: z.string().trim().min(1),
  en: z.string().trim().min(1),
})

const updateCategorySchema = z.object({
  name: z.union([
    localizedNameSchema,
    z.array(z.string().trim().min(1)).min(1),
    z.string().trim().min(1),
  ]),
  parent_id: z.string().trim().nullable().optional(),
})

const GENERIC_GET_CATEGORY_ERROR_MESSAGE = "Fetch category failed"
const GENERIC_UPDATE_CATEGORY_ERROR_MESSAGE = "Update category failed"
const GENERIC_DELETE_CATEGORY_ERROR_MESSAGE = "Delete category failed"

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

function resolveCategoryId(params?: { id?: string }) {
  const id = params?.id?.trim()
  return id || null
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authTokens = await getServerAuthTokens()

  if (!authTokens.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const categoryId = resolveCategoryId(await params)

  if (!categoryId) {
    return NextResponse.json({ message: "Category id is required" }, { status: 400 })
  }

  try {
    const apiClient = await createServerApiClientFromCookies()
    const payload = await apiClient.get<BackendAdminCategoryResponse>(
      `api/admin/categories/${categoryId}`
    )

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (isBackendApiError(error)) {
      const publicMessage = sanitizePublicErrorMessage(
        error.message,
        GENERIC_GET_CATEGORY_ERROR_MESSAGE
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
            message: "Unexpected get category error",
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
  const authTokens = await getServerAuthTokens()

  if (!authTokens.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const categoryId = resolveCategoryId(await params)

  if (!categoryId) {
    return NextResponse.json({ message: "Category id is required" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const parsed = updateCategorySchema.safeParse(body)

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
    const payload = await apiClient.put<BackendAdminCategoryResponse>(
      `api/admin/categories/${categoryId}`,
      {
        json: {
          name: parsed.data.name,
          parent_id: parsed.data.parent_id ?? null,
        } satisfies BackendUpdateAdminCategoryRequest,
      }
    )

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (isBackendApiError(error)) {
      const publicMessage = sanitizePublicErrorMessage(
        error.message,
        GENERIC_UPDATE_CATEGORY_ERROR_MESSAGE
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
            message: "Unexpected update category error",
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
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authTokens = await getServerAuthTokens()

  if (!authTokens.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const categoryId = resolveCategoryId(await params)

  if (!categoryId) {
    return NextResponse.json({ message: "Category id is required" }, { status: 400 })
  }

  try {
    const apiClient = await createServerApiClientFromCookies()
    const payload = await apiClient.delete<BackendDeleteAdminCategoryResponse>(
      `api/admin/categories/${categoryId}`
    )

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (isBackendApiError(error)) {
      const publicMessage = sanitizePublicErrorMessage(
        error.message,
        GENERIC_DELETE_CATEGORY_ERROR_MESSAGE
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
            message: "Unexpected delete category error",
          })

    return NextResponse.json(
      {
        message: fallbackError.message,
      },
      { status: 500 }
    )
  }
}
