import { getBackendServerEnv } from "@/lib/backend/config/env"
import type {
  BackendAuthUser,
  BackendLoginApiResponse,
  BackendLoginResponse,
} from "@/lib/backend/contracts/auth"

function normalizeAuthUser(user: BackendLoginApiResponse["data"]["user"]): BackendAuthUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.name,
    avatar: user.avatar,
    preferredLanguage: user.preferred_language,
    createdAt: user.created_at,
    roles: [],
  }
}

export function normalizeLoginResponse(payload: BackendLoginApiResponse): BackendLoginResponse {
  const env = getBackendServerEnv()

  return {
    user: normalizeAuthUser(payload.data.user),
    tokens: {
      tokenType: "Bearer",
      accessToken: payload.data.token,
      expiresIn: env.BACKEND_ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS,
    },
  }
}
