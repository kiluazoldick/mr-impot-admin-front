export type BackendAdminRole = "admin" | "super-admin"

export interface BackendCreateAdminRequest {
  name: string
  email: string
  password: string
  role: BackendAdminRole
  permissions?: string[] | null
}

export interface BackendAdminResource {
  id: string
  name: string
  email: string
  avatar: string
  roles: string
  permissions: string | string[] | null
  created_at: string
}

export interface BackendCreateAdminResponse {
  message: string
  user: BackendAdminResource
}

export interface BackendListAdminsResponse {
  data: BackendAdminResource[]
}
