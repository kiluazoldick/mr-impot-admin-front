// Stub - l'ancien backend n'est plus utilisé
export interface BackendServerEnv {
  BACKEND_API_BASE_URL: string;
  BACKEND_API_TIMEOUT_MS: number;
  BACKEND_ACCESS_TOKEN_COOKIE_NAME: string;
  BACKEND_REFRESH_TOKEN_COOKIE_NAME: string;
  BACKEND_ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS: number;
  BACKEND_REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS: number;
  BACKEND_COOKIE_SECURE: boolean;
}

export type BackendPublicEnv = {
  NEXT_PUBLIC_INTERNAL_API_BASE_PATH: string;
};

export function getBackendServerEnv(): BackendServerEnv {
  return {
    BACKEND_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
    BACKEND_API_TIMEOUT_MS: 30000,
    BACKEND_ACCESS_TOKEN_COOKIE_NAME: "sb-access-token",
    BACKEND_REFRESH_TOKEN_COOKIE_NAME: "sb-refresh-token",
    BACKEND_ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS: 3600,
    BACKEND_REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS: 2592000,
    BACKEND_COOKIE_SECURE: process.env.NODE_ENV === "production",
  };
}

export function getBackendPublicEnv(): BackendPublicEnv {
  return {
    NEXT_PUBLIC_INTERNAL_API_BASE_PATH: "/api",
  };
}
