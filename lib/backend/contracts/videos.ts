import type { BackendAdminCategoryResource } from "@/lib/backend/contracts/categories"
import type { BackendResponseMeta } from "@/lib/backend/contracts/common"

export type BackendVideoLocalizedText =
  | { fr: string; en: string }
  | string[]
  | string
  | null

export interface BackendVideoResource {
  id: string
  category_id: string
  title: BackendVideoLocalizedText
  description: BackendVideoLocalizedText
  video_url: string
  thumbnail_url: string
  is_featured: boolean
  views_count: number
  published_at: string
  category: BackendAdminCategoryResource
}

export interface BackendCreateVideoResponse {
  data: BackendVideoResource
}

export interface BackendListVideosResponse {
  data: BackendVideoResource[]
  meta?: BackendResponseMeta
}
