import { decodeJwt } from "jose"

export interface DecodedAccessToken {
  sub?: string
  exp?: number
  iat?: number
  iss?: string
  aud?: string | string[]
  [claim: string]: unknown
}

export function decodeAccessToken(token: string): DecodedAccessToken | null {
  try {
    return decodeJwt(token) as DecodedAccessToken
  } catch {
    return null
  }
}

export function getAccessTokenExpirationDate(token: string): Date | null {
  const decodedToken = decodeAccessToken(token)

  if (!decodedToken?.exp) {
    return null
  }

  return new Date(decodedToken.exp * 1000)
}

export function isAccessTokenExpired(token: string, clockSkewSeconds = 30) {
  const expirationDate = getAccessTokenExpirationDate(token)

  if (!expirationDate) {
    return true
  }

  const now = Date.now()
  const allowedSkewMs = clockSkewSeconds * 1000

  return now >= expirationDate.getTime() - allowedSkewMs
}
