"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { adminUsersApi } from "@/lib/api-client";

interface UserAccountDetailViewProps {
  accountId: string;
}

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function UserAccountDetailView({
  accountId,
}: UserAccountDetailViewProps) {
  const t = useTranslations("Dashboard.UserManagement.Details");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await adminUsersApi.getAll();
        const list = Array.isArray(data) ? data : data?.data || [];
        const found = list.find((u: any) => u.id === accountId);
        setProfile(found || null);
      } catch (error) {
        console.error("Erreur chargement profil:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [accountId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#33a1db] border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <motion.div
        className="flex-1 space-y-4 max-w-350 mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Link
          href="/dashboard/user-management"
          className="inline-flex pt-2 pl-6 items-center text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Link>
        <section className="rounded-2xl border border-slate-100 bg-white shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            {t("not_found_title")}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {t("not_found_description")}
          </p>
        </section>
      </motion.div>
    );
  }

  const initials =
    [profile.first_name, profile.last_name]
      .filter(Boolean)
      .map((n) => n![0]?.toUpperCase())
      .join("") || profile.email[0]?.toUpperCase();

  const fullName =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    profile.email;

  return (
    <motion.div
      className="flex-1 space-y-4 max-w-350 mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Link
        href="/dashboard/user-management"
        className="inline-flex pt-2 pl-6 items-center text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("back")}
      </Link>

      <section className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-6 flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-[#33a1db] text-white flex items-center justify-center text-base font-semibold shadow-sm">
            {initials}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                {profile.role === "admin" ? t("type_admin") : t("type_user")}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${profile.is_active ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : "bg-rose-50 text-rose-700 ring-rose-600/20"}`}
              >
                {profile.is_active ? "Actif" : "Suspendu"}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{fullName}</h1>
            <p className="text-sm text-slate-500">
              {profile.role === "admin"
                ? t("subtitle_admin")
                : t("subtitle_user")}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            {t("account_info_title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {t("field_id")}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {profile.id}
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {t("field_email")}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {profile.email}
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {t("field_role")}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {profile.role}
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {t("field_joined_on")}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
