export interface BackendLocalizedCategoryName {
  fr: string
  en: string
}

export type BackendCategoryName = BackendLocalizedCategoryName | string | string[] | null

export interface BackendAdminCategoryChildPayload {
  slug: string
  name: BackendLocalizedCategoryName
}

export interface BackendCreateAdminCategoryRequest {
  slug: string
  name: BackendLocalizedCategoryName
  childrens?: BackendAdminCategoryChildPayload[] | null
}

export interface BackendAdminCategoryResource {
  id: string
  name: BackendCategoryName
  slug: string
  childrens: BackendAdminCategoryResource[]
}

export interface BackendCreateAdminCategoryResponse {
  data: BackendAdminCategoryResource
}

export interface BackendListAdminCategoriesResponse {
  data: BackendAdminCategoryResource[]
}

export interface BackendAdminCategoryResponse {
  data: BackendAdminCategoryResource
}

export type BackendUpdateAdminCategoryName = BackendLocalizedCategoryName | string | string[]

export interface BackendUpdateAdminCategoryRequest {
  name: BackendUpdateAdminCategoryName
  parent_id?: string | null
}

export interface BackendDeleteAdminCategoryResponse {
  success: boolean
  message: string | null
  data: null
}
