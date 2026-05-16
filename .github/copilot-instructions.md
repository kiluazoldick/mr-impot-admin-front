# Project Setup and Conventions (mr-impot-admin)

This document provides AI agents and new developers with the essential guidelines for contributing to this Next.js codebase.

## Core Stack & Dependencies
- **Framework:** Next.js 16.2.2 (App Router `app/` exclusively). Heed deprecation notices for older Next.js versions.
- **React:** v19.2.4 (React Server Components by default).
- **Styling:** Tailwind CSS v4, `clsx`, `tailwind-merge` (use the `cn()` utility exposed in `lib/utils.ts` for dynamic classes).
- **UI Toolkit:** `shadcn/ui` and `radix-ui` (dumb elements reside in `components/ui/`, do not modify directly without request).
- **Icons:** `lucide-react`.
- **Form Management:** `react-hook-form` integrated with `@hookform/resolvers` and `zod` for strictly typed validation.
- **Internationalization:** `next-intl` strictly enforced. Route segments use `[locale]`.
- **Animations:** `framer-motion` (requires client components).
- **Notifications:** `sonner` (`toast.promise` used for pending operations).

## Architecture & Directory Conventions
- **`app/[locale]/`**: The application root. Every route here is localized, do not hardcode text strings layout/page components. 
- **`app/[locale]/(auth)/`**: A localized route group for authentication functionalities (e.g., `login`, `forgot_password`, `reset_password`).
- **`components/macro_components/`**: Composite components that combine multiple UI primitives or add advanced state (e.g., `localeswitcher.tsx`).
- **`lib/validations/`**: Houses all `zod` schemas. Separation of form validation from UI rendering logic is strictly enforced (e.g., `auth.ts`).
- **`messages/` & `i18n/`**: Home for `next-intl` translations (`en.json`, `fr.json`) and configuration (`navigation.ts`, `routing.ts`, `request.ts`).

## Patterns & Guidelines

### 1. React Server vs Client Components
- Prefer **React Server Components (RSC)**. They should be used by default to fetch data and render UI without shipping JS.
- Use the `"use client"` directive at the top of a file *only* when absolutely necessary:
  - Event listeners (`onClick`, `onSubmit`).
  - React State and Lifecycle hooks (`useState`, `useEffect`).
  - Animation libraries (`framer-motion`).
  - Client-side form handlers (`react-hook-form`).

### 2. Form Handling
- For user inputs, use `react-hook-form`.
- **Always** pair form generation with a corresponding Zod schema located in `lib/validations/`.
- Present error feedback using standard Next-Intl localized strings mapping mapped to Zod errors.

### 3. Internationalization (i18n)
- **Do not hardcode display strings.** Any text presented to the user must be read via the `useTranslations()` hook provided by `next-intl`.
- E.g., `const t = useTranslations('Auth');` and `{t('Login.login_title')}` inside components.
- Always keep `en.json` and `fr.json` in sync when introducing a new translation string.
- Routing should be handled by importing `Link` from `@/i18n/navigation` instead of standard `next/link`.

### 4. Styling and Tailwind V4
- Make use of the Tailwind classes directly. 
- When combining programmatic class states, strictly import and apply the `cn()` helper utility to properly process precedence with `tailwind-merge`.

### 5. Imports Configuration
- Use Absolute imports with the `@/` prefix for everything outside the local immediate directory tree (`@/components/...`, `@/lib/...`).

## Developer Workflow

- **Run Dev Server:** `npm run dev`
- **Linting:** `npm run lint`

for others informations follow the AGENTS.md file in the root of the project.