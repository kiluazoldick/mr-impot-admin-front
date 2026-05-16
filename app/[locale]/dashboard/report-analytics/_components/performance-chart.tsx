"use client"

import { useMemo } from "react"
import { useLocale, useTranslations } from "next-intl"
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { TrendDataPoint } from "@/data/report-analytics"
import { cn } from "@/lib/utils"
import { IndicatorInfo } from "./indicator-info"

export type ChartMetric = "activeUsers" | "newSubscriptions" | "supportTickets" | "revenue"

interface PerformanceChartProps {
  data: TrendDataPoint[]
  metric: ChartMetric
  compareEnabled: boolean
  onMetricChange: (metric: ChartMetric) => void
}

const metricOptions: ChartMetric[] = ["activeUsers", "newSubscriptions", "supportTickets", "revenue"]

const metricColors: Record<ChartMetric, string> = {
  activeUsers: "#33a1db",
  newSubscriptions: "#0ea5e9",
  supportTickets: "#f97316",
  revenue: "#10b981",
}

function formatMetricValue(value: number, metric: ChartMetric, locale: string) {
  if (metric === "revenue") {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(value)
}

export function PerformanceChart({ data, metric, compareEnabled, onMetricChange }: PerformanceChartProps) {
  const t = useTranslations("Dashboard.ReportAnalytics.chart")
  const locale = useLocale()

  const chartData = useMemo(
    () =>
      data.map((item, index) => {
        const current = item[metric]
        const baselineMultiplier = metric === "supportTickets" ? 1.12 : metric === "revenue" ? 0.9 : 0.88
        const variance = index % 2 === 0 ? 0.02 : -0.01
        const previous = Math.round(current * (baselineMultiplier + variance))

        return {
          label: t(`labels.${item.labelKey}` as Parameters<typeof t>[0]),
          current,
          previous,
        }
      }),
    [data, metric, t]
  )

  const yAxisFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        notation: "compact",
        maximumFractionDigits: 1,
      }),
    [locale]
  )

  const metricColor = metricColors[metric]

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t("title")}</h2>
          <p className="text-sm text-slate-500 mt-1">{t("description")}</p>
        </div>

        <div className="grid grid-cols-2 sm:flex gap-2">
          {metricOptions.map((option) => {
            const label = t(`metrics.${option}` as Parameters<typeof t>[0])

            return (
              <div key={option} className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onMetricChange(option)}
                  className={cn(
                    "h-8 px-3 rounded-md text-xs font-medium border transition-colors",
                    metric === option
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {label}
                </button>
                <IndicatorInfo
                  label={label}
                  description={t(`metric_definitions.${option}` as Parameters<typeof t>[0])}
                  align="end"
                />
              </div>
            )
          })}
        </div>
      </div>

      <div className="h-75 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: -15,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="reportChartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metricColor} stopOpacity={0.25} />
                <stop offset="100%" stopColor={metricColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dy={10} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickFormatter={(value) => yAxisFormatter.format(Number(value))}
            />
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              formatter={(value, name) => {
                const normalizedValue = typeof value === "number" ? value : Number(value ?? 0)

                return [
                  formatMetricValue(normalizedValue, metric, locale),
                  name === "current" ? t("series_current") : t("series_previous"),
                ]
              }}
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 8px 20px -10px rgba(15, 23, 42, 0.35)",
              }}
            />
            <Area
              type="monotone"
              dataKey="current"
              stroke={metricColor}
              strokeWidth={2.5}
              fill="url(#reportChartGradient)"
              dot={{ r: 3, fill: metricColor, strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 4 }}
            />
            {compareEnabled && (
              <Line
                type="monotone"
                dataKey="previous"
                stroke="#94a3b8"
                strokeDasharray="6 6"
                strokeWidth={2}
                dot={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <div className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: metricColor }} />
          {t("series_current")}
        </div>
        {compareEnabled ? (
          <div className="inline-flex items-center gap-2">
            <span className="h-0.5 w-4 bg-slate-400 rounded" />
            {t("series_previous")}
          </div>
        ) : (
          <span>{t("comparison_off")}</span>
        )}
      </div>
    </section>
  )
}
