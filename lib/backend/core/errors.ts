import type { BackendErrorPayload } from "@/lib/backend/contracts/common"

interface BackendApiErrorOptions extends BackendErrorPayload {
  status: number
}

export class BackendApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: unknown
  readonly traceId?: string

  constructor(options: BackendApiErrorOptions) {
    super(options.message)
    this.name = "BackendApiError"
    this.status = options.status
    this.code = options.code
    this.details = options.details
    this.traceId = options.traceId
  }
}

export function isBackendApiError(value: unknown): value is BackendApiError {
  return value instanceof BackendApiError
}

export function sanitizePublicErrorMessage(message: string, fallbackMessage: string) {
  if (/(https?:\/\/)/i.test(message)) {
    return fallbackMessage
  }

  return message
}
