export interface BackendUserResource {
  id: string
  name: string
  email: string
  avatar: string | null
  roles: string
  permissions: string | string[] | null
  created_at: string
}

export interface BackendListUsersResponse {
  data: BackendUserResource[]
}
