# Backend Integration Foundation

This folder contains the backend foundation for future feature-by-feature integrations.

## Directory map

- `auth/`: Bearer token helpers, JWT decode utilities, client/server token storage
- `client/`: Browser HTTP client setup targeting internal Next.js API paths
- `config/`: Runtime constants and strict environment validation
- `contracts/`: Typed backend request/response contracts
- `core/`: Shared HTTP client and normalized backend error primitives
- `server/`: Server-side client setup and request auth context helpers

## Design choices

- Route handlers are intentionally not implemented yet.
- External backend calls are expected to be proxied through Next.js handlers later.
- `createBackendHttpClient` normalizes non-2xx responses into `BackendApiError`.
- Token handling supports both browser and server runtimes.

## Required environment variables

Use `.env.example` as a starting point.
