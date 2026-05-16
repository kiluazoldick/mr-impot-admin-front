import { cookies } from "next/headers"

import {
  BACKEND_DEFAULT_ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS,
  BACKEND_DEFAULT_REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS,
} from "@/lib/backend/config/constants"
import { getBackendServerEnv } from "@/lib/backend/config/env"
import type { BackendTokenPair } from "@/lib/backend/contracts/auth"

export interface ServerAuthTokens {
  accessToken: string | null
  refreshToken: string | null
}

function createBaseCookieOptions() {
  const env = getBackendServerEnv()

  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.BACKEND_COOKIE_SECURE,
    path: "/",
  }
}

export async function getServerAuthTokens(): Promise<ServerAuthTokens> {
  const env = getBackendServerEnv()
  const cookieStore = await cookies()

  return {
    accessToken: cookieStore.get(env.BACKEND_ACCESS_TOKEN_COOKIE_NAME)?.value ?? null,
    refreshToken: cookieStore.get(env.BACKEND_REFRESH_TOKEN_COOKIE_NAME)?.value ?? null,
  }
}

export async function persistServerAuthTokens(tokens: BackendTokenPair) {
  const env = getBackendServerEnv()
  const cookieStore = await cookies()
  const baseCookieOptions = createBaseCookieOptions()

  cookieStore.set(env.BACKEND_ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, {
    ...baseCookieOptions,
    maxAge: tokens.expiresIn || BACKEND_DEFAULT_ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS,
  })

  if (tokens.refreshToken) {
    cookieStore.set(env.BACKEND_REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, {
      ...baseCookieOptions,
      maxAge:
        tokens.refreshExpiresIn ||
        env.BACKEND_REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS ||
        BACKEND_DEFAULT_REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS,
    })
  }
}

export async function clearServerAuthTokens() {
  const env = getBackendServerEnv()
  const cookieStore = await cookies()

  cookieStore.delete(env.BACKEND_ACCESS_TOKEN_COOKIE_NAME)
  cookieStore.delete(env.BACKEND_REFRESH_TOKEN_COOKIE_NAME)
}
