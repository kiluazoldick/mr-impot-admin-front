import ky, { type KyInstance, type Options } from "ky"

import { BACKEND_AUTH_SCHEME, BACKEND_DEFAULT_TIMEOUT_MS } from "@/lib/backend/config/constants"
import type { BackendEnvelope, BackendErrorPayload } from "@/lib/backend/contracts/common"
import { BackendApiError } from "@/lib/backend/core/errors"

export type BackendTokenResolver = () => Promise<string | null> | string | null
export type BackendAcceptLanguageResolver = () => Promise<string | null> | string | null

export interface CreateBackendHttpClientOptions {
  baseUrl: string
  timeoutMs?: number
  tokenResolver?: BackendTokenResolver
  acceptLanguageResolver?: BackendAcceptLanguageResolver
  defaultHeaders?: HeadersInit
  credentials?: RequestCredentials
}

export type BackendRequestOptions = Omit<
  Options,
  "prefix" | "baseUrl" | "hooks" | "throwHttpErrors"
>

export interface BackendHttpClient {
  request<TResponse>(path: string, options?: BackendRequestOptions): Promise<TResponse>
  get<TResponse>(path: string, options?: BackendRequestOptions): Promise<TResponse>
  post<TResponse>(path: string, options?: BackendRequestOptions): Promise<TResponse>
  put<TResponse>(path: string, options?: BackendRequestOptions): Promise<TResponse>
  patch<TResponse>(path: string, options?: BackendRequestOptions): Promise<TResponse>
  delete<TResponse>(path: string, options?: BackendRequestOptions): Promise<TResponse>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function normalizePath(path: string) {
  return path.startsWith("/") ? path.slice(1) : path
}

function createDefaultHeaders(headers?: HeadersInit) {
  const nextHeaders = new Headers(headers)

  if (!nextHeaders.has("Accept")) {
    nextHeaders.set("Accept", "application/json")
  }

  return nextHeaders
}

function isFailureEnvelope(payload: unknown): payload is Extract<BackendEnvelope<unknown>, { success: false }> {
  if (!isRecord(payload)) {
    return false
  }

  return payload.success === false && isRecord(payload.error)
}

function isSuccessEnvelope(payload: unknown): payload is Extract<BackendEnvelope<unknown>, { success: true }> {
  if (!isRecord(payload)) {
    return false
  }

  return payload.success === true && "data" in payload
}

function buildErrorFromPayload(response: Response, payload: unknown) {
  const fallbackCode = `HTTP_${response.status}`
  const fallbackMessage = response.statusText || "Unexpected backend error"

  if (isFailureEnvelope(payload)) {
    const envelopeError = payload.error as BackendErrorPayload

    return new BackendApiError({
      status: response.status,
      code: envelopeError.code || fallbackCode,
      message: envelopeError.message || fallbackMessage,
      details: envelopeError.details,
      traceId: envelopeError.traceId,
    })
  }

  if (isRecord(payload)) {
    const code = typeof payload.code === "string" ? payload.code : fallbackCode
    const message = typeof payload.message === "string" ? payload.message : fallbackMessage
    const traceId = typeof payload.traceId === "string" ? payload.traceId : undefined

    return new BackendApiError({
      status: response.status,
      code,
      message,
      details: payload,
      traceId,
    })
  }

  return new BackendApiError({
    status: response.status,
    code: fallbackCode,
    message: fallbackMessage,
    details: payload,
  })
}

async function parseBody(response: Response) {
  if (response.status === 204) {
    return null
  }

  const bodyText = await response.text()

  if (!bodyText) {
    return null
  }

  try {
    return JSON.parse(bodyText) as unknown
  } catch {
    return bodyText
  }
}

export function createBackendHttpClient(options: CreateBackendHttpClientOptions): BackendHttpClient {
  const kyInstance: KyInstance = ky.create({
    prefix: options.baseUrl,
    timeout: options.timeoutMs ?? BACKEND_DEFAULT_TIMEOUT_MS,
    throwHttpErrors: false,
    headers: createDefaultHeaders(options.defaultHeaders),
    credentials: options.credentials,
    hooks: {
      beforeRequest: [
        async ({ request }) => {
          if (!options.acceptLanguageResolver) {
            return
          }

          if (request.headers.has("Accept-Language")) {
            return
          }

          const resolvedLanguage = await options.acceptLanguageResolver()
          const normalizedLanguage = typeof resolvedLanguage === "string" ? resolvedLanguage.trim() : ""

          if (!normalizedLanguage) {
            return
          }

          request.headers.set("Accept-Language", normalizedLanguage)
        },
        async ({ request }) => {
          if (!options.tokenResolver) {
            return
          }

          const token = await options.tokenResolver()

          if (!token) {
            return
          }

          request.headers.set("Authorization", `${BACKEND_AUTH_SCHEME} ${token}`)
        },
      ],
    },
  })

  const request = async <TResponse>(
    path: string,
    requestOptions: BackendRequestOptions = {}
  ): Promise<TResponse> => {
    const response = await kyInstance(normalizePath(path), requestOptions)
    const payload = await parseBody(response)

    if (!response.ok) {
      throw buildErrorFromPayload(response, payload)
    }

    if (isFailureEnvelope(payload)) {
      throw buildErrorFromPayload(response, payload)
    }

    if (isSuccessEnvelope(payload)) {
      return payload.data as TResponse
    }

    return payload as TResponse
  }

  return {
    request,
    get: <TResponse>(path: string, requestOptions: BackendRequestOptions = {}) =>
      request<TResponse>(path, { ...requestOptions, method: "get" }),
    post: <TResponse>(path: string, requestOptions: BackendRequestOptions = {}) =>
      request<TResponse>(path, { ...requestOptions, method: "post" }),
    put: <TResponse>(path: string, requestOptions: BackendRequestOptions = {}) =>
      request<TResponse>(path, { ...requestOptions, method: "put" }),
    patch: <TResponse>(path: string, requestOptions: BackendRequestOptions = {}) =>
      request<TResponse>(path, { ...requestOptions, method: "patch" }),
    delete: <TResponse>(path: string, requestOptions: BackendRequestOptions = {}) =>
      request<TResponse>(path, { ...requestOptions, method: "delete" }),
  }
}
