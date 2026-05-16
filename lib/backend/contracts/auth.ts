export interface BackendAuthUser {
  id: string
  email: string
  fullName: string
  avatar: string | null
  preferredLanguage: string | null
  createdAt: string | null
  roles: string[]
}

export interface BackendTokenPair {
  tokenType: "Bearer"
  accessToken: string
  refreshToken?: string
  expiresIn: number
  refreshExpiresIn?: number
}

export interface BackendLoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface BackendLoginApiUserResource {
  id: string
  name: string
  email: string
  avatar: string | null
  preferred_language: string | null
  created_at: string | null
}

export interface BackendLoginApiData {
  token: string
  user: BackendLoginApiUserResource
}

export interface BackendLoginApiResponse {
  message: string | string[] | null
  data: BackendLoginApiData
}

export interface BackendLoginResponse {
  user: BackendAuthUser
  tokens: BackendTokenPair
}

export interface BackendRefreshTokenRequest {
  refreshToken: string
}

export interface BackendRefreshTokenResponse {
  tokens: BackendTokenPair
}
