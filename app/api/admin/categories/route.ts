import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getServerAuthTokens } from "@/lib/backend/auth/token-storage.server"
import type {
  BackendCreateAdminCategoryRequest,
  BackendCreateAdminCategoryResponse,
  BackendListAdminCategoriesResponse,
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

const categoryChildSchema = z.object({
  slug: z.string().trim().min(1),
  name: localizedNameSchema,
})

const createCategorySchema = z.object({
  slug: z.string().trim().min(1),
  name: localizedNameSchema,
  childrens: z.array(categoryChildSchema).nullable().optional(),
})

const GENERIC_LIST_CATEGORIES_ERROR_MESSAGE = "Fetch categories failed"
const GENERIC_CREATE_CATEGORY_ERROR_MESSAGE = "Create category failed"

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
    const parsed = createCategorySchema.safeParse(body)

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
    const payload = await apiClient.post<BackendCreateAdminCategoryResponse>(
      "api/admin/categories",
      {
        json: {
          ...parsed.data,
          childrens: parsed.data.childrens ?? null,
        } satisfies BackendCreateAdminCategoryRequest,
      }
    )

    return NextResponse.json(payload, { status: 201 })
  } catch (error) {
    if (isBackendApiError(error)) {
      const publicMessage = sanitizePublicErrorMessage(
        error.message,
        GENERIC_CREATE_CATEGORY_ERROR_MESSAGE
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
            message: "Unexpected create category error",
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
    const payload = await apiClient.get<BackendListAdminCategoriesResponse>(
      "api/admin/categories"
    )

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (isBackendApiError(error)) {
      const publicMessage = sanitizePublicErrorMessage(
        error.message,
        GENERIC_LIST_CATEGORIES_ERROR_MESSAGE
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
            message: "Unexpected list categories error",
          })

    return NextResponse.json(
      {
        message: fallbackError.message,
      },
      { status: 500 }
    )
  }
}
