import { ShieldCheck, UserCheck, UserCog, Users } from "lucide-react"

import type { AdminPermissionGroup } from "@/lib/backend/contracts/admin-permissions"

export type AccountStatus = "active" | "invited" | "suspended" | "unknown"
export type AdminRole = "super-admin" | "admin"
export type UserPlan = "premium" | "standard" | "free"

export interface AdminAccount {
  id: string
  fullName: string
  email: string
  avatar?: string | null
  phone: string
  country: string
  role: AdminRole
  managedSections: AdminPermissionGroup[]
  createdBy: string
  createdOn: string
  lastActivity: string
  lastLogin: string
  status: AccountStatus
}

export interface UserAccount {
  id: string
  fullName: string
  email: string
  phone: string
  country: string
  plan: UserPlan
  joinedOn: string
  lastActivity: string
  documentsDownloaded: number
  reportsOpened: number
  status: AccountStatus
}

export type AccountDetails =
  | { kind: "admin"; account: AdminAccount }
  | { kind: "user"; account: UserAccount }

export const userManagementStatsData = [
  {
    titleKey: "total_accounts",
    value: 228,
    icon: Users,
    bgColor: "bg-blue-500",
  },
  {
    titleKey: "admin_accounts",
    value: 12,
    icon: UserCog,
    bgColor: "bg-blue-400",
  },
  {
    titleKey: "active_users",
    value: 196,
    icon: UserCheck,
    bgColor: "bg-blue-400",
  },
  {
    titleKey: "new_this_month",
    value: 34,
    icon: ShieldCheck,
    bgColor: "bg-blue-400",
  },
]

export const adminAccountsData: AdminAccount[] = [
  {
    id: "admin-1",
    fullName: "Amina Bensalem",
    email: "amina.bensalem@mrimpot.io",
    phone: "+223 70 12 45 80",
    country: "Mali",
    role: "super-admin",
    managedSections: [
      "users",
      "documents",
      "categories",
      "videos",
      "administration",
    ],
    createdBy: "System Owner",
    createdOn: "10/12/2025",
    lastActivity: "16/04/2026 10:05",
    lastLogin: "16/04/2026 09:42",
    status: "active",
  },
  {
    id: "admin-2",
    fullName: "Moussa Traore",
    email: "moussa.traore@mrimpot.io",
    phone: "+223 66 92 14 01",
    country: "Cote d'Ivoire",
    role: "admin",
    managedSections: ["users", "documents"],
    createdBy: "Amina Bensalem",
    createdOn: "19/01/2026",
    lastActivity: "16/04/2026 08:38",
    lastLogin: "15/04/2026 18:10",
    status: "active",
  },
  {
    id: "admin-3",
    fullName: "Sophie Diallo",
    email: "sophie.diallo@mrimpot.io",
    phone: "+33 7 58 24 61 45",
    country: "France",
    role: "admin",
    managedSections: ["documents", "categories"],
    createdBy: "Amina Bensalem",
    createdOn: "08/03/2026",
    lastActivity: "14/04/2026 15:22",
    lastLogin: "14/04/2026 11:25",
    status: "invited",
  },
  {
    id: "admin-4",
    fullName: "Ibrahim Konate",
    email: "ibrahim.konate@mrimpot.io",
    phone: "+225 01 40 77 92 11",
    country: "Cote d'Ivoire",
    role: "admin",
    managedSections: ["documents"],
    createdBy: "Moussa Traore",
    createdOn: "02/02/2026",
    lastActivity: "10/04/2026 07:58",
    lastLogin: "10/04/2026 07:58",
    status: "suspended",
  },
]

export const userAccountsData: UserAccount[] = [
  {
    id: "user-1",
    fullName: "Fatoumata Camara",
    email: "fatoumata.camara@gmail.com",
    phone: "+223 61 08 90 14",
    country: "Guinee",
    plan: "premium",
    joinedOn: "03/01/2026",
    lastActivity: "16/04/2026 09:10",
    documentsDownloaded: 42,
    reportsOpened: 18,
    status: "active",
  },
  {
    id: "user-2",
    fullName: "Jean Kouassi",
    email: "jean.kouassi@gmail.com",
    phone: "+225 07 04 95 83 20",
    country: "Cote d'Ivoire",
    plan: "standard",
    joinedOn: "24/02/2026",
    lastActivity: "15/04/2026 21:44",
    documentsDownloaded: 19,
    reportsOpened: 7,
    status: "active",
  },
  {
    id: "user-3",
    fullName: "Nadia El Idrissi",
    email: "nadia.elidrissi@gmail.com",
    phone: "+212 6 65 32 71 54",
    country: "Maroc",
    plan: "free",
    joinedOn: "11/03/2026",
    lastActivity: "14/04/2026 12:05",
    documentsDownloaded: 5,
    reportsOpened: 3,
    status: "invited",
  },
  {
    id: "user-4",
    fullName: "Pauline Ahoua",
    email: "pauline.ahoua@gmail.com",
    phone: "+225 05 44 72 81 39",
    country: "Cote d'Ivoire",
    plan: "premium",
    joinedOn: "28/03/2026",
    lastActivity: "16/04/2026 07:56",
    documentsDownloaded: 31,
    reportsOpened: 11,
    status: "active",
  },
  {
    id: "user-5",
    fullName: "Karim Benali",
    email: "karim.benali@gmail.com",
    phone: "+33 6 44 12 90 70",
    country: "France",
    plan: "standard",
    joinedOn: "05/04/2026",
    lastActivity: "13/04/2026 09:22",
    documentsDownloaded: 12,
    reportsOpened: 4,
    status: "suspended",
  },
]

export function getAccountDetailsById(id: string): AccountDetails | null {
  const admin = adminAccountsData.find((item) => item.id === id)
  if (admin) {
    return { kind: "admin", account: admin }
  }

  const user = userAccountsData.find((item) => item.id === id)
  if (user) {
    return { kind: "user", account: user }
  }

  return null
}