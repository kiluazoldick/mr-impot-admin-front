"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { UserChart } from "./_components/user-chart";
import { DateFilter } from "./_components/date-filter";
import { PageHeader } from "./_components/page-header";
import { StatCards, StatData } from "./_components/stat-cards";
import { authApi, adminDocumentsApi, adminUsersApi } from "@/lib/api-client";
import { Users, FileText, Download, Search } from "lucide-react";

export default function DashboardPage() {
  const t = useTranslations("Dashboard.Page");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatData[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Récupérer les stats réelles
        const [documentsResult, usersResult] = await Promise.allSettled([
          adminDocumentsApi.getAll({ page: "1", limit: "1" }),
          adminUsersApi.getAll(),
        ]);

        const totalDocs =
          documentsResult.status === "fulfilled"
            ? documentsResult.value?.total || 0
            : 0;

        // Compter les utilisateurs (non-admin)
        let totalUsers = 0;
        let activeUsers = 0;
        if (usersResult.status === "fulfilled") {
          const users = Array.isArray(usersResult.value)
            ? usersResult.value
            : usersResult.value?.data || [];
          const regularUsers = users.filter((u: any) => u.role !== "admin");
          totalUsers = regularUsers.length;
          activeUsers = regularUsers.filter((u: any) => u.is_active).length;
        }

        // Calculer les téléchargements totaux
        const allDocsResult = await adminDocumentsApi.getAll({
          page: "1",
          limit: "100",
        });
        const allDocs = allDocsResult?.data || [];
        const totalDownloads = allDocs.reduce(
          (sum: number, doc: any) => sum + (doc.download_count || 0),
          0,
        );

        setStats([
          {
            title: t("total_documents"),
            value: totalDocs,
            icon: FileText,
            bgColor: "bg-[#38bdf8]",
          },
          {
            title: t("downloads_today"),
            value: totalDownloads,
            icon: Download,
            bgColor: "bg-[#38bdf8]",
          },
          {
            title: t("searches_today"),
            value: "-",
            icon: Search,
            bgColor: "bg-[#38bdf8]",
          },
          {
            title: t("active_users"),
            value: activeUsers,
            icon: Users,
            bgColor: "bg-[#38bdf8]",
          },
        ]);

        // Activités récentes (derniers documents)
        const recentResult = await adminDocumentsApi.getAll({
          page: "1",
          limit: "4",
        });
        const recentDocs = recentResult?.data || [];
        setActivities(
          recentDocs.map((doc: any) => ({
            name: "Document",
            action: "ajouté",
            target: doc.title_fr || doc.title_en || "Sans titre",
            time: doc.created_at
              ? new Date(doc.created_at).toLocaleDateString()
              : "-",
          })),
        );
      } catch (error) {
        console.error("Erreur chargement dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
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
      className="flex flex-col gap-3 w-full max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title={t("title")}
          description={t("subtitle")}
          action={<DateFilter />}
          className="py-5 sm:py-0 sm:min-h-[100px] transition duration-300"
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {t("statistics")}
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`stat-skeleton-${i}`}
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
          <StatCards items={stats} />
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm"
        >
          {isLoading ? (
            <div className="w-full h-full flex flex-col gap-4">
              <div className="flex items-center justify-between mb-2">
                <div className="h-6 bg-slate-200 rounded w-32 animate-pulse" />
                <div className="h-8 bg-slate-200 rounded w-40 animate-pulse" />
              </div>
              <div className="w-full h-[300px] mt-4 min-h-[300px] bg-slate-100 animate-pulse rounded-xl" />
            </div>
          ) : (
            <UserChart />
          )}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl p-6 lg:col-span-1"
        >
          <h2 className="text-base font-bold text-slate-800 mb-4">
            {t("recent_activity")}
          </h2>
          <motion.div
            className="flex flex-col gap-3"
            variants={containerVariants}
          >
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  variants={itemVariants}
                  key={`activity-skeleton-${i}`}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
                >
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2 animate-pulse" />
                  <div className="h-3 bg-slate-200 rounded w-1/4 animate-pulse" />
                </motion.div>
              ))
            ) : activities.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                Aucune activité récente
              </p>
            ) : (
              activities.map((act, i) => (
                <motion.div
                  variants={itemVariants}
                  key={i}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
                >
                  <p className="text-sm text-slate-600 font-medium">
                    {act.name} {act.action} : {act.target}
                  </p>
                  <p className="text-xs text-[#38bdf8] mt-2 font-medium">
                    {act.time}
                  </p>
                </motion.div>
              ))
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
