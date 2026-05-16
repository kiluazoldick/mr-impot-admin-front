"use client"

import { useSyncExternalStore } from "react"

import type {
  BackendAdminResource,
  BackendListAdminsResponse,
  BackendListUsersResponse,
  BackendUserResource,
} from "@/lib/backend"
import { getBrowserApiClient } from "@/lib/backend/client"
import {
  type BackendAdminPermission,
  getPermissionGroupsForRole,
  isBackendAdminPermission,
  mapPermissionsToGroups,
} from "@/lib/backend/contracts/admin-permissions"
import {
  type AccountStatus,
  type AdminAccount,
  type UserAccount,
} from "@/data/users"

export type ManagedAccountKind = "admin" | "user"

export type ManagedAccountDetails =
  | { kind: "admin"; account: AdminAccount }
  | { kind: "user"; account: UserAccount }

export interface AccountStatusHistoryItem {
  id: string
  kind: ManagedAccountKind
  previousStatus: AccountStatus
  nextStatus: AccountStatus
  changedAt: string
}

interface UserManagementStoreState {
  admins: AdminAccount[]
  users: UserAccount[]
  history: AccountStatusHistoryItem[]
}

export interface CreateManagedAdminAccountInput {
  fullName: string
  email: string
  phone: string
  country: string
  role: AdminAccount["role"]
  managedSections: AdminAccount["managedSections"]
  status: Extract<AccountStatus, "active" | "invited">
  createdBy: string
}

type CreateManagedAdminResult =
  | { created: true; reason: null; account: AdminAccount }
  | { created: false; reason: "email_exists"; account: null }

function normalizeAdminRole(value: string): AdminAccount["role"] {
  const normalized = value.trim().toLowerCase()

  return normalized === "super-admin" ? "super-admin" : "admin"
}

function normalizePermissionCandidates(
  value: BackendAdminResource["permissions"]
): string[] {
  if (!value) {
    return []
  }

  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string")
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return []
  }

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string")
      }
    } catch {
      return []
    }
  }

  return trimmed.split(",")
}

function parseBackendPermissions(
  value: BackendAdminResource["permissions"]
): AdminAccount["managedSections"] {
  const candidates = normalizePermissionCandidates(value)
  const permissions = candidates
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .filter((item): item is BackendAdminPermission => isBackendAdminPermission(item))

  return mapPermissionsToGroups(permissions)
}

let state: UserManagementStoreState = {
  admins: [],
  users: [],
  history: [],
}

const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return state
}

function createNextAdminId(admins: AdminAccount[]) {
  const maxId = admins.reduce((max, admin) => {
    const match = admin.id.match(/^admin-(\d+)$/)
    if (!match) {
      return max
    }

    const parsedId = Number.parseInt(match[1], 10)
    if (Number.isNaN(parsedId)) {
      return max
    }

    return Math.max(max, parsedId)
  }, 0)

  return `admin-${maxId + 1}`
}

function formatDate(value: Date) {
  const day = String(value.getDate()).padStart(2, "0")
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const year = value.getFullYear()

  return `${day}/${month}/${year}`
}

function formatDateTime(value: Date) {
  const hours = String(value.getHours()).padStart(2, "0")
  const minutes = String(value.getMinutes()).padStart(2, "0")

  return `${formatDate(value)} ${hours}:${minutes}`
}

function formatDateFromIso(value: string) {
  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return "-"
  }

  return formatDate(parsed)
}

function mapBackendAdminResource(resource: BackendAdminResource): AdminAccount {
  const role = normalizeAdminRole(resource.roles ?? "")
  const allowedGroups = getPermissionGroupsForRole(role)
  const parsedGroups = parseBackendPermissions(resource.permissions)
  const managedSections = role === "super-admin"
    ? allowedGroups
    : parsedGroups.filter((group) => allowedGroups.includes(group))

  return {
    id: resource.id,
    fullName: resource.name,
    email: resource.email,
    avatar: resource.avatar || null,
    phone: "-",
    country: "-",
    role,
    managedSections,
    createdBy: "-",
    createdOn: formatDateFromIso(resource.created_at),
    lastActivity: "-",
    lastLogin: "-",
    status: "unknown",
  }
}

function mapBackendUserResource(resource: BackendUserResource): UserAccount {
  return {
    id: resource.id,
    fullName: resource.name,
    email: resource.email,
    phone: "-",
    country: "-",
    plan: "standard",
    joinedOn: formatDateFromIso(resource.created_at),
    lastActivity: "-",
    documentsDownloaded: 0,
    reportsOpened: 0,
    status: "unknown",
  }
}

export function useUserManagementStoreState() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function setManagedAdmins(admins: AdminAccount[]) {
  state = {
    ...state,
    admins,
  }

  emitChange()
}

export function setManagedUsers(users: UserAccount[]) {
  state = {
    ...state,
    users,
  }

  emitChange()
}

export async function fetchAdminAccounts() {
  const apiClient = getBrowserApiClient()
  const payload = await apiClient.get<BackendListAdminsResponse>("admin/admins")
  const admins = Array.isArray(payload.data)
    ? payload.data.map(mapBackendAdminResource)
    : []

  setManagedAdmins(admins)
  return admins
}

export async function fetchUserAccounts(query?: string | URLSearchParams) {
  const apiClient = getBrowserApiClient()
  const queryString = typeof query === "string" ? query : query?.toString() ?? ""
  const path = queryString ? `admin/users?${queryString}` : "admin/users"
  const payload = await apiClient.get<BackendListUsersResponse>(path)
  const users = Array.isArray(payload.data)
    ? payload.data.map(mapBackendUserResource)
    : []

  setManagedUsers(users)
  return users
}

export function getManagedAccountById(id: string, sourceState: UserManagementStoreState = state): ManagedAccountDetails | null {
  const admin = sourceState.admins.find((item) => item.id === id)
  if (admin) {
    return { kind: "admin", account: admin }
  }

  const user = sourceState.users.find((item) => item.id === id)
  if (user) {
    return { kind: "user", account: user }
  }

  return null
}

export function getManagedAccountHistory(id: string, sourceState: UserManagementStoreState = state) {
  return sourceState.history.filter((item) => item.id === id)
}

export function createManagedAdminAccount(input: CreateManagedAdminAccountInput): CreateManagedAdminResult {
  const normalizedEmail = input.email.trim().toLowerCase()
  const emailAlreadyExists = state.admins.some(
    (admin) => admin.email.toLowerCase() === normalizedEmail
  )

  if (emailAlreadyExists) {
    return {
      created: false,
      reason: "email_exists",
      account: null,
    }
  }

  const now = new Date()
  const nextAdmin: AdminAccount = {
    id: createNextAdminId(state.admins),
    fullName: input.fullName.trim(),
    email: normalizedEmail,
    phone: input.phone.trim(),
    country: input.country.trim(),
    role: input.role,
    managedSections: [...input.managedSections],
    createdBy: input.createdBy.trim(),
    createdOn: formatDate(now),
    lastActivity: formatDateTime(now),
    lastLogin: input.status === "active" ? formatDateTime(now) : "-",
    status: input.status,
  }

  state = {
    ...state,
    admins: [nextAdmin, ...state.admins],
  }

  emitChange()

  return {
    created: true,
    reason: null,
    account: nextAdmin,
  }
}

export function updateManagedAccountStatus(id: string, nextStatus: AccountStatus) {
  const admin = state.admins.find((item) => item.id === id)
  if (admin) {
    if (admin.status === nextStatus) {
      return { changed: false, kind: "admin" as const }
    }

    const previousStatus = admin.status
    const updatedAdmins = state.admins.map((item) =>
      item.id === id ? { ...item, status: nextStatus } : item
    )

    state = {
      ...state,
      admins: updatedAdmins,
      history: [
        {
          id,
          kind: "admin",
          previousStatus,
          nextStatus,
          changedAt: new Date().toISOString(),
        },
        ...state.history,
      ],
    }

    emitChange()
    return { changed: true, kind: "admin" as const }
  }

  const user = state.users.find((item) => item.id === id)
  if (user) {
    if (user.status === nextStatus) {
      return { changed: false, kind: "user" as const }
    }

    const previousStatus = user.status
    const updatedUsers = state.users.map((item) =>
      item.id === id ? { ...item, status: nextStatus } : item
    )

    state = {
      ...state,
      users: updatedUsers,
      history: [
        {
          id,
          kind: "user",
          previousStatus,
          nextStatus,
          changedAt: new Date().toISOString(),
        },
        ...state.history,
      ],
    }

    emitChange()
    return { changed: true, kind: "user" as const }
  }

  return { changed: false, kind: null as null }
}