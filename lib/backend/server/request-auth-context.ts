import type { NextRequest } from "next/server"

import { extractBearerToken } from "@/lib/backend/auth/bearer"
import { getBackendServerEnv } from "@/lib/backend/config/env"

export type BackendAuthTokenSource =
  | "authorization_header"
  | "access_token_cookie"
  | "none"

export interface BackendRequestAuthContext {
  accessToken: string | null
  source: BackendAuthTokenSource
}

export function resolveRequestAuthContext(request: NextRequest): BackendRequestAuthContext {
  const authorizationHeader = request.headers.get("authorization")
  const tokenFromHeader = extractBearerToken(authorizationHeader)

  if (tokenFromHeader) {
    return {
      accessToken: tokenFromHeader,
      source: "authorization_header",
    }
  }

  const env = getBackendServerEnv()
  const tokenFromCookie = request.cookies.get(env.BACKEND_ACCESS_TOKEN_COOKIE_NAME)?.value ?? null

  if (tokenFromCookie) {
    return {
      accessToken: tokenFromCookie,
      source: "access_token_cookie",
    }
  }

  return {
    accessToken: null,
    source: "none",
  }
}
