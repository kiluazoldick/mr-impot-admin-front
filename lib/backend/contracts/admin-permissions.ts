import type { BackendAdminRole } from "@/lib/backend/contracts/admin"

export const BACKEND_ADMIN_PERMISSIONS = [
  "admin.access",
  "user.view",
  "user.create",
  "user.update",
  "user.delete",
  "admin.create",
  "role.assign",
  "document.create",
  "document.read",
  "document.update",
  "document.delete",
  "document.download",
  "category.view",
  "category.create",
  "category.update",
  "category.delete",
  "video.view",
  "video.create",
  "video.update",
  "video.delete",
] as const

export type BackendAdminPermission = (typeof BACKEND_ADMIN_PERMISSIONS)[number]

export const ADMIN_PERMISSION_GROUP_ORDER = [
  "users",
  "documents",
  "categories",
  "videos",
  "administration",
] as const

export type AdminPermissionGroup = (typeof ADMIN_PERMISSION_GROUP_ORDER)[number]

export const ADMIN_PERMISSION_GROUPS: Record<
  AdminPermissionGroup,
  readonly BackendAdminPermission[]
> = {
  users: ["user.view", "user.create", "user.update", "user.delete"],
  documents: [
    "document.read",
    "document.create",
    "document.update",
    "document.delete",
    "document.download",
  ],
  categories: [
    "category.view",
    "category.create",
    "category.update",
    "category.delete",
  ],
  videos: ["video.view", "video.create", "video.update", "video.delete"],
  administration: ["admin.create", "role.assign"],
}

const ADMIN_BASE_PERMISSIONS: readonly BackendAdminPermission[] = [
  "admin.access",
]

export function isBackendAdminPermission(value: string): value is BackendAdminPermission {
  return BACKEND_ADMIN_PERMISSIONS.includes(value as BackendAdminPermission)
}

export function getPermissionGroupsForRole(role: BackendAdminRole): AdminPermissionGroup[] {
  if (role === "super-admin") {
    return [...ADMIN_PERMISSION_GROUP_ORDER]
  }

  return ADMIN_PERMISSION_GROUP_ORDER.filter(
    (group) => group !== "administration"
  ) as AdminPermissionGroup[]
}

export function resolveAdminPermissionsForRole(
  role: BackendAdminRole,
  groups: AdminPermissionGroup[]
): BackendAdminPermission[] {
  const effectiveGroups = role === "super-admin" ? ADMIN_PERMISSION_GROUP_ORDER : groups
  const permissions = new Set<BackendAdminPermission>(ADMIN_BASE_PERMISSIONS)

  effectiveGroups.forEach((group) => {
    ADMIN_PERMISSION_GROUPS[group].forEach((permission) => {
      permissions.add(permission)
    })
  })

  return Array.from(permissions)
}

export function mapPermissionsToGroups(
  permissions: readonly BackendAdminPermission[]
): AdminPermissionGroup[] {
  const permissionSet = new Set(permissions)

  return ADMIN_PERMISSION_GROUP_ORDER.filter((group) =>
    ADMIN_PERMISSION_GROUPS[group].some((permission) =>
      permissionSet.has(permission)
    )
  )
}
