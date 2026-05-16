export interface BackendErrorPayload {
  code: string
  message: string
  details?: unknown
  traceId?: string
}

export interface BackendPaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface BackendResponseMeta {
  pagination?: BackendPaginationMeta
  [key: string]: unknown
}

export interface BackendSuccessResponse<TData> {
  success: true
  data: TData
  meta?: BackendResponseMeta
}

export interface BackendFailureResponse {
  success: false
  error: BackendErrorPayload
}

export type BackendEnvelope<TData> =
  | BackendSuccessResponse<TData>
  | BackendFailureResponse
