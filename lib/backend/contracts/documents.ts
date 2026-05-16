import type { BackendAdminCategoryResource } from "@/lib/backend/contracts/categories"
import type { BackendResponseMeta } from "@/lib/backend/contracts/common"
import type { BackendUserResource } from "@/lib/backend/contracts/users"

export type BackendDocumentStatus = "ds_draft" | "ds_published" | "ds_archived"
export type BackendOcrStatus = "pending" | "processing" | "completed" | "failed"

export interface BackendDocumentLocalizedText {
  fr: string
  en: string
}

export type BackendDocumentTitle =
  | BackendDocumentLocalizedText
  | string[]
  | string
  | null

export type BackendDocumentDescription =
  | BackendDocumentLocalizedText
  | string[]
  | string
  | null

export interface BackendDocumentFiles {
  [key: string]: string | null
}

export interface BackendDocumentResource {
  id: string
  title: BackendDocumentTitle
  status: BackendDocumentStatus
  ocr_status: BackendOcrStatus
  document_views: number
  published_at: string | null
  created_at: string | null
  category: BackendAdminCategoryResource
  uploaded_by?: BackendUserResource
  files: BackendDocumentFiles
  description: BackendDocumentDescription
}

export interface BackendCreateDocumentResponse {
  data: BackendDocumentResource
}

export interface BackendDocumentResponse {
  data: BackendDocumentResource
}

export interface BackendUpdateDocumentRequest {
  category_id: string
  title: BackendDocumentLocalizedText
  description: BackendDocumentLocalizedText
}

export interface BackendListDocumentsResponse {
  data: BackendDocumentResource[]
  meta?: BackendResponseMeta
}

export interface BackendUploadDocumentResponse {
  success: boolean
  message: string | null
  data: null
}
