"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Eye,
  Search,
  ShieldCheck,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { authApi } from "@/lib/api-client";
import { adminUsersApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { PageHeader } from "../../_components/page-header";
import { StatCards, StatData } from "../../_components/stat-cards";

interface UserRow {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  plan: string;
  joinedOn: string;
  avatar: string | null;
}

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserManagementPageView() {
  const t = useTranslations("Dashboard.UserManagement");
  const tStats = useTranslations("Dashboard.UserManagement.stats");
  const tPagination = useTranslations("Dashboard.UserManagement.pagination");
  const tRoles = useTranslations("Dashboard.UserManagement.roles");
  const tPlans = useTranslations("Dashboard.UserManagement.plans");
  const tStatus = useTranslations("Dashboard.UserManagement.status");

  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [adminSearch, setAdminSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const data = await adminUsersApi.getAll();
        const list = Array.isArray(data) ? data : data?.data || [];
        setUsers(
          list.map((u: any) => ({
            id: u.id,
            fullName:
              [u.first_name, u.last_name].filter(Boolean).join(" ") ||
              u.email ||
              "Utilisateur",
            email: u.email || "",
            role: u.role || "user",
            status: u.is_active ? "active" : "suspended",
            plan: "free",
            joinedOn: u.created_at
              ? new Date(u.created_at).toLocaleDateString()
              : "-",
            avatar: u.avatar_url || null,
          })),
        );
      } catch (error) {
        console.error("Erreur chargement utilisateurs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const admins = useMemo(
    () => users.filter((u) => u.role === "admin"),
    [users],
  );
  const regularUsers = useMemo(
    () => users.filter((u) => u.role !== "admin"),
    [users],
  );

  const filteredAdmins = useMemo(() => {
    const query = adminSearch.trim().toLowerCase();
    if (!query) return admins;
    return admins.filter(
      (a) =>
        a.fullName.toLowerCase().includes(query) ||
        a.email.toLowerCase().includes(query),
    );
  }, [admins, adminSearch]);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return regularUsers;
    return regularUsers.filter(
      (u) =>
        u.fullName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query),
    );
  }, [regularUsers, userSearch]);

  const formattedStats: StatData[] = useMemo(() => {
    return [
      {
        title: tStats("total_accounts"),
        value: users.length,
        icon: Users,
        bgColor: "bg-blue-500",
      },
      {
        title: tStats("admin_accounts"),
        value: admins.length,
        icon: UserCog,
        bgColor: "bg-blue-400",
      },
      {
        title: tStats("active_users"),
        value: users.filter((u) => u.status === "active").length,
        icon: UserCheck,
        bgColor: "bg-blue-400",
      },
      {
        title: tStats("new_this_month"),
        value: "-",
        icon: ShieldCheck,
        bgColor: "bg-blue-400",
      },
    ];
  }, [users, admins, tStats]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <motion.div
      className="flex-1 space-y-4 max-w-350 mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title={t("title")}
          description={t("description")}
          action={
            <Button
              asChild
              className="h-10 bg-[#33a1db] hover:bg-blue-500 text-white font-medium px-4 hover:cursor-pointer"
            >
              <Link href="/dashboard/user-management/add">
                <UserPlus className="w-4 h-4 mr-1" />
                {t("create_admin_action")}
              </Link>
            </Button>
          }
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="space-y-4 bg-white rounded-xl p-6 border border-slate-100 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-800 px-1">
          {t("statistics")}
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-xl shrink-0 bg-slate-200 animate-pulse" />
                <div className="flex flex-col gap-2 w-full">
                  <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse" />
                  <div className="h-6 bg-slate-200 rounded w-1/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <StatCards items={formattedStats} />
        )}
      </motion.div>

      {/* Admins */}
      <motion.section
        variants={itemVariants}
        className="space-y-4 bg-white rounded-xl p-6 border border-slate-100 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {t("admins_panel_title")}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t("admins_panel_description", { count: filteredAdmins.length })}
            </p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              placeholder={t("search_admin_placeholder")}
              className="pl-10 h-10 w-full"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#33a1db] hover:bg-[#33a1db] border-none">
                  <TableHead className="text-white font-medium pl-6">
                    {t("table.avatar")}
                  </TableHead>
                  <TableHead className="text-white font-medium">
                    {t("table.admin_name")}
                  </TableHead>
                  <TableHead className="text-white font-medium">
                    {t("table.email")}
                  </TableHead>
                  <TableHead className="text-white font-medium">
                    {t("table.role")}
                  </TableHead>
                  <TableHead className="text-white font-medium pr-6">
                    {t("table.action")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <TableRow key={`admin-sk-${i}`} className="animate-pulse">
                      <TableCell className="pl-6 py-4">
                        <div className="h-9 w-9 rounded-full bg-slate-200" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-slate-200 rounded w-11/12" />
                      </TableCell>
                      <TableCell>
                        <div className="h-6 bg-slate-200 rounded-full w-2/3" />
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="h-8 w-8 bg-slate-200 rounded-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-20 text-center text-slate-500"
                    >
                      {t("empty_admins")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmins.map((admin) => (
                    <TableRow key={admin.id} className="hover:bg-slate-50/50">
                      <TableCell className="pl-6 py-4">
                        <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold">
                          {getInitials(admin.fullName)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {admin.fullName}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {admin.email}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                          {tRoles(admin.role)}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6">
                        <Link href={`/dashboard/user-management/${admin.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-slate-100 text-slate-600 rounded-full h-8 w-8"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </motion.section>

      {/* Users */}
      <motion.section
        variants={itemVariants}
        className="space-y-4 bg-white rounded-xl p-6 border border-slate-100 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {t("users_panel_title")}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t("users_panel_description", { count: filteredUsers.length })}
            </p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder={t("search_user_placeholder")}
              className="pl-10 h-10 w-full"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#33a1db] hover:bg-[#33a1db] border-none">
                  <TableHead className="text-white font-medium pl-6">
                    {t("table.user_name")}
                  </TableHead>
                  <TableHead className="text-white font-medium">
                    {t("table.email")}
                  </TableHead>
                  <TableHead className="text-white font-medium">
                    {t("table.subscription")}
                  </TableHead>
                  <TableHead className="text-white font-medium">
                    {t("table.joined_on")}
                  </TableHead>
                  <TableHead className="text-white font-medium">
                    {t("table.action")}
                  </TableHead>
                  <TableHead className="text-white font-medium pr-6">
                    {t("table.status")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={`user-sk-${i}`} className="animate-pulse">
                      <TableCell className="pl-6 py-4">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-slate-200 rounded w-11/12" />
                      </TableCell>
                      <TableCell>
                        <div className="h-6 bg-slate-200 rounded-full w-2/3" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-slate-200 rounded w-2/3" />
                      </TableCell>
                      <TableCell>
                        <div className="h-8 w-8 bg-slate-200 rounded-full" />
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="h-6 bg-slate-200 rounded-full w-2/3" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-20 text-center text-slate-500"
                    >
                      {t("empty_users")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-900 pl-6 py-4">
                        {user.fullName}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                          {tPlans(user.plan)}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {user.joinedOn}
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/user-management/${user.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-slate-100 text-slate-600 rounded-full h-8 w-8"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TableCell>
                      <TableCell className="pr-6">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                            user.status === "active"
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                              : "bg-rose-50 text-rose-700 ring-rose-600/20",
                          )}
                        >
                          {tStatus(user.status)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
