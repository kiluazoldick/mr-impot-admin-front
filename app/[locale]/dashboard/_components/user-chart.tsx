"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bar,
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { adminDocumentsApi } from "@/lib/api-client";

interface ChartDataPoint {
  name: string;
  Documents: number;
  Téléchargés: number;
}

export function UserChart() {
  const t = useTranslations("Dashboard.Page");
  const [view, setView] = useState<"weekly" | "monthly">("monthly");
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const result = await adminDocumentsApi.getAll({
          page: "1",
          limit: "100",
        });
        const docs = result?.data || [];

        const grouped: Record<string, { created: number; downloads: number }> =
          {};

        docs.forEach((doc: any) => {
          if (doc.created_at) {
            const date = new Date(doc.created_at);
            const key =
              view === "monthly"
                ? date.toLocaleString("fr", { month: "short", year: "2-digit" })
                : `${date.getDate()}/${date.getMonth() + 1}`;

            if (!grouped[key]) grouped[key] = { created: 0, downloads: 0 };
            grouped[key].created++;
            grouped[key].downloads += doc.download_count || 0;
          }
        });

        const chartData: ChartDataPoint[] = Object.entries(grouped)
          .slice(-6)
          .map(([name, values]) => ({
            name,
            Documents: values.created,
            Téléchargés: values.downloads,
          }));

        setData(
          chartData.length > 0
            ? chartData
            : [
                { name: "Jan", Documents: 0, Téléchargés: 0 },
                { name: "Fév", Documents: 0, Téléchargés: 0 },
                { name: "Mar", Documents: 0, Téléchargés: 0 },
              ],
        );
      } catch (error) {
        console.error("Erreur chargement graphique:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [view]);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-3 sm:gap-0">
        <h2 className="text-base font-bold text-slate-800">
          {t("user_statistics")}
        </h2>
        <div className="flex w-full sm:w-auto relative bg-slate-50 p-1 rounded-lg border border-slate-100">
          {(["weekly", "monthly"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`relative flex-1 sm:flex-none px-3 py-1 text-sm rounded-md transition-colors z-10 ${
                view === tab
                  ? "font-bold text-slate-800"
                  : "font-medium text-slate-400 hover:text-slate-600"
              }`}
            >
              {view === tab && (
                <motion.div
                  layoutId="activeTabBackground"
                  className="absolute inset-0 bg-white shadow-sm rounded-md -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {t(tab)}
            </button>
          ))}
        </div>
      </div>
      <div className="relative w-full h-[300px] mt-4 min-h-[300px]">
        {loading ? (
          <div className="w-full h-full bg-slate-100 animate-pulse rounded-xl" />
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <div className="w-full h-full overflow-x-auto overflow-y-hidden pb-4">
                <div className="min-w-[600px] sm:min-w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={data}
                      margin={{ top: 20, right: 10, left: -15, bottom: 0 }}
                    >
                      <CartesianGrid vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748b",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748b",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      />
                      <Tooltip
                        cursor={{ fill: "#f8fafc" }}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          fontSize: "13px",
                        }}
                      />
                      <Bar
                        dataKey="Documents"
                        name="Documents"
                        fill="#F49600"
                        barSize={20}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="Téléchargés"
                        name="Téléchargés"
                        fill="#F49600"
                        fillOpacity={0.4}
                        barSize={20}
                        radius={[4, 4, 0, 0]}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </>
  );
}
