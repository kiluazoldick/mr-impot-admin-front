import * as z from "zod"

import { ADMIN_PERMISSION_GROUP_ORDER } from "@/lib/backend/contracts/admin-permissions"

const adminRoleValues = ["admin", "super-admin"] as const

const adminPermissionGroupValues = ADMIN_PERMISSION_GROUP_ORDER

export const getAdminAccountSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().trim().min(1, t("full_name_required")),
    email: z
      .string()
      .trim()
      .min(1, t("email_required"))
      .email(t("invalid_email")),
    password: z.string().trim().min(8, t("password_min")),
    role: z.enum(adminRoleValues),
    permissions: z.array(z.enum(adminPermissionGroupValues)).min(1, t("sections_required")),
  })

export type AdminAccountFormValues = z.infer<ReturnType<typeof getAdminAccountSchema>>