"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { useLocale, useTranslations } from "next-intl"
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import {
  acquisitionData,
  insightItems,
  moduleHealthData,
  reportKpis,
  segmentKpiMultipliers,
  trendDataByPeriod,
  type AnalyticsPeriod,
  type AnalyticsSegment,
  type InsightSeverity,
  type ModuleTrend,
} from "@/data/report-analytics"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { PageHeader } from "../../_components/page-header"
import { AnalyticsFilters } from "./analytics-filters"
import { ExportReportMenu, type ExportFormat } from "./export-report-menu"
import { IndicatorInfo } from "./indicator-info"
import { PerformanceChart, type ChartMetric } from "./performance-chart"

const severityClasses: Record<InsightSeverity, string> = {
  high: "bg-rose-50 text-rose-700 ring-rose-600/20",
  medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
  low: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
}

const moduleTrendClasses: Record<ModuleTrend, string> = {
  up: "text-emerald-600",
  down: "text-rose-600",
  stable: "text-slate-500",
}

function formatDeltaValue(value: number) {
  const rounded = Number(value.toFixed(1))
  if (rounded > 0) {
    return `+${rounded}%`
  }

  return `${rounded}%`
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value))
}

export function ReportAnalyticsPageView() {
  const t = useTranslations("Dashboard.ReportAnalytics")
  const tKpis = useTranslations("Dashboard.ReportAnalytics.kpis")
  const tFilters = useTranslations("Dashboard.ReportAnalytics.filters")
  const tInsights = useTranslations("Dashboard.ReportAnalytics.insights")
  const tModules = useTranslations("Dashboard.ReportAnalytics.modules")
  const tExport = useTranslations("Dashboard.ReportAnalytics.export")
  const tTable = useTranslations("Dashboard.ReportAnalytics.table")
  const locale = useLocale()

  const [period, setPeriod] = useState<AnalyticsPeriod>("30d")
  const [segment, setSegment] = useState<AnalyticsSegment>("all")
  const [compareEnabled, setCompareEnabled] = useState(true)
  const [metric, setMetric] = useState<ChartMetric>("activeUsers")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200)

    return () => clearTimeout(timer)
  }, [])

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        maximumFractionDigits: 0,
      }),
    [locale]
  )

  const decimalFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    [locale]
  )

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "XAF",
        maximumFractionDigits: 0,
      }),
    [locale]
  )

  const kpiCards = useMemo(() => {
    const multipliers = segmentKpiMultipliers[segment]

    return reportKpis.map((kpi) => {
      const multiplier = multipliers[kpi.id]
      const adjustedValue = kpi.values[period] * multiplier
      const adjustedDelta = kpi.deltas[period] * (0.88 + multiplier * 0.12)
      const normalizedPercentValue = clamp(adjustedValue, 0, 99.9)

      const valueLabel =
        kpi.valueType === "currency"
          ? currencyFormatter.format(adjustedValue)
          : kpi.valueType === "percent"
            ? `${decimalFormatter.format(normalizedPercentValue)}%`
            : numberFormatter.format(adjustedValue)

      const deltaLabel = formatDeltaValue(adjustedDelta)
      const isPositive = kpi.invertDelta ? adjustedDelta <= 0 : adjustedDelta >= 0

      return {
        ...kpi,
        title: tKpis(kpi.titleKey as Parameters<typeof tKpis>[0]),
        description: tKpis(`definitions.${kpi.titleKey}` as Parameters<typeof tKpis>[0]),
        valueLabel,
        deltaLabel,
        isPositive,
      }
    })
  }, [currencyFormatter, decimalFormatter, numberFormatter, period, segment, tKpis])

  const chartData = useMemo(() => {
    const multipliers = segmentKpiMultipliers[segment]

    return trendDataByPeriod[period].map((item) => ({
      ...item,
      activeUsers: Math.round(item.activeUsers * multipliers.active_accounts),
      newSubscriptions: Math.round(item.newSubscriptions * multipliers.conversion_rate),
      supportTickets: Math.round(item.supportTickets * multipliers.critical_alerts),
      revenue: Math.round(item.revenue * multipliers.subscription_revenue),
    }))
  }, [period, segment])

  const moduleCards = useMemo(() => {
    const scoreOffsetMap: Record<AnalyticsSegment, number> = {
      all: 0,
      admins: 4,
      paid: 2,
      free: -4,
    }

    const adoptionOffsetMap: Record<AnalyticsSegment, number> = {
      all: 0,
      admins: 3,
      paid: 5,
      free: -6,
    }

    const incidentMultiplierMap: Record<AnalyticsSegment, number> = {
      all: 1,
      admins: 0.72,
      paid: 0.86,
      free: 1.24,
    }

    return moduleHealthData.map((module) => ({
      ...module,
      score: clamp(module.score + scoreOffsetMap[segment], 45, 99),
      adoption: clamp(module.adoption + adoptionOffsetMap[segment], 35, 99),
      incidents: Math.max(0, Math.round(module.incidents * incidentMultiplierMap[segment])),
    }))
  }, [segment])

  const acquisitionRows = useMemo(() => {
    const sessionMultiplierMap: Record<AnalyticsSegment, number> = {
      all: 1,
      admins: 0.22,
      paid: 0.58,
      free: 0.42,
    }

    const conversionMultiplierMap: Record<AnalyticsSegment, number> = {
      all: 1,
      admins: 1.14,
      paid: 1.19,
      free: 0.78,
    }

    const revenueMultiplierMap: Record<AnalyticsSegment, number> = {
      all: 1,
      admins: 0.28,
      paid: 1.27,
      free: 0.14,
    }

    return acquisitionData.map((item) => ({
      ...item,
      sessions: Math.round(item.sessions * sessionMultiplierMap[segment]),
      conversionRate: Number((item.conversionRate * conversionMultiplierMap[segment]).toFixed(1)),
      revenue: Math.round(item.revenue * revenueMultiplierMap[segment]),
    }))
  }, [segment])

  const handleRefresh = () => {
    setIsRefreshing(true)

    const refreshPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, 800)
    })

    toast.promise(refreshPromise, {
      loading: t("refresh_loading"),
      success: t("refresh_success"),
      error: t("refresh_error"),
    })

    void refreshPromise.finally(() => {
      setIsRefreshing(false)
    })
  }

  const handleExport = (format: ExportFormat) => {
    setIsExporting(true)

    const exportPromise = new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const shouldFail = Math.random() < 0.06

        if (shouldFail) {
          reject(new Error("export failed"))
          return
        }

        resolve()
      }, 900)
    })

    const formattedPeriod = tFilters(`period_options.${period}` as Parameters<typeof tFilters>[0])
    const formattedSegment = tFilters(`segment_options.${segment}` as Parameters<typeof tFilters>[0])
    const formattedFormat = tExport(`formats.${format}` as Parameters<typeof tExport>[0])

    toast.promise(exportPromise, {
      loading: tExport("loading", { format: formattedFormat }),
      success: tExport("success", {
        format: formattedFormat,
        period: formattedPeriod,
        segment: formattedSegment,
      }),
      error: tExport("error"),
    })

    void exportPromise.finally(() => {
      setIsExporting(false)
    })
  }

  const handleInsightAction = (actionKey: string) => {
    toast.success(
      tInsights("action_success", {
        action: tInsights(`actions.${actionKey}` as Parameters<typeof tInsights>[0]),
      })
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.09 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 280, damping: 24 },
    },
  }

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
          action={(
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing || isExporting}
                className="h-10 px-4 border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
                {t("refresh_action")}
              </Button>
              <ExportReportMenu
                onExport={handleExport}
                disabled={isLoading || isRefreshing || isExporting}
              />
            </div>
          )}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <AnalyticsFilters
          period={period}
          segment={segment}
          compareEnabled={compareEnabled}
          onPeriodChange={setPeriod}
          onSegmentChange={setSegment}
          onCompareToggle={() => setCompareEnabled((current) => !current)}
          disabled={isLoading || isRefreshing || isExporting}
        />
      </motion.div>

      <motion.section
        variants={itemVariants}
        className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">{t("overview_title")}</h2>
          <p className="text-xs text-slate-500">{t("kpi_delta_context")}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`report-kpi-skeleton-${index}`}
                className="border border-slate-100 rounded-xl p-4 space-y-3 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-slate-200" />
                  <div className="w-16 h-5 rounded-full bg-slate-200" />
                </div>
                <div className="h-4 w-2/3 bg-slate-200 rounded" />
                <div className="h-7 w-1/2 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {kpiCards.map((kpi) => (
              <article key={kpi.id} className="border border-slate-100 rounded-xl p-4 shadow-sm bg-white">
                <div className="flex items-center justify-between gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white", kpi.bgColor)}>
                    <kpi.icon className="w-5 h-5" />
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                      kpi.isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    )}
                  >
                    {kpi.isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-1" />}
                    {kpi.deltaLabel}
                  </span>
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5">
                  <p className="text-sm text-slate-500">{kpi.title}</p>
                  <IndicatorInfo
                    label={kpi.title}
                    description={kpi.description}
                    align="start"
                  />
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-1">{kpi.valueLabel}</p>
              </article>
            ))}
          </div>
        )}
      </motion.section>

      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4">
        <motion.section variants={itemVariants} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-5 w-56 bg-slate-200 rounded" />
              <div className="h-4 w-72 bg-slate-200 rounded" />
              <div className="h-70 w-full bg-slate-100 rounded-xl" />
            </div>
          ) : (
            <PerformanceChart
              data={chartData}
              metric={metric}
              compareEnabled={compareEnabled}
              onMetricChange={setMetric}
            />
          )}
        </motion.section>

        <motion.section variants={itemVariants} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{tInsights("title")}</h2>
            <p className="text-sm text-slate-500 mt-1">{tInsights("description")}</p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`insight-skeleton-${index}`} className="animate-pulse border border-slate-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-20 rounded-full bg-slate-200" />
                    <div className="h-4 w-14 bg-slate-200 rounded" />
                  </div>
                  <div className="h-4 w-2/3 bg-slate-200 rounded" />
                  <div className="h-3 w-full bg-slate-200 rounded" />
                  <div className="h-8 w-36 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {insightItems.map((insight) => {
                const isPositiveDelta = insight.delta >= 0

                return (
                  <article key={insight.id} className="border border-slate-100 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
                          severityClasses[insight.severity]
                        )}
                      >
                        {tInsights(`severities.${insight.severity}` as Parameters<typeof tInsights>[0])}
                      </span>
                      <span className={cn("text-xs font-semibold", isPositiveDelta ? "text-emerald-600" : "text-rose-600")}>
                        {formatDeltaValue(insight.delta)}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900">
                      {tInsights(insight.titleKey as Parameters<typeof tInsights>[0])}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {tInsights(insight.descriptionKey as Parameters<typeof tInsights>[0])}
                    </p>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleInsightAction(insight.actionKey)}
                      className="border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      {tInsights(`actions.${insight.actionKey}` as Parameters<typeof tInsights>[0])}
                    </Button>
                  </article>
                )
              })}
            </div>
          )}
        </motion.section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4">
        <motion.section variants={itemVariants} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{tModules("title")}</h2>
            <p className="text-sm text-slate-500 mt-1">{tModules("description")}</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`module-skeleton-${index}`} className="animate-pulse border border-slate-100 rounded-xl p-4 space-y-3">
                  <div className="h-4 w-2/3 bg-slate-200 rounded" />
                  <div className="h-3 w-full bg-slate-200 rounded" />
                  <div className="h-2.5 w-full bg-slate-100 rounded-full" />
                  <div className="h-2.5 w-full bg-slate-100 rounded-full" />
                  <div className="h-3 w-1/2 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {moduleCards.map((module) => {
                const TrendIcon =
                  module.trend === "up" ? TrendingUp : module.trend === "down" ? TrendingDown : Minus

                return (
                  <article key={module.id} className="border border-slate-100 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {tModules(`labels.${module.id}` as Parameters<typeof tModules>[0])}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {tModules(`summaries.${module.summaryKey}` as Parameters<typeof tModules>[0])}
                        </p>
                      </div>
                      <span className={cn("inline-flex items-center text-xs font-semibold", moduleTrendClasses[module.trend])}>
                        <TrendIcon className="w-3.5 h-3.5 mr-1" />
                        {tModules(`trends.${module.trend}` as Parameters<typeof tModules>[0])}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          {tModules("score")}
                          <IndicatorInfo
                            label={tModules("score")}
                            description={tModules("definitions.score")}
                            align="start"
                          />
                        </span>
                        <span className="font-semibold text-slate-700">{module.score}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-[#33a1db]" style={{ width: `${module.score}%` }} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          {tModules("adoption")}
                          <IndicatorInfo
                            label={tModules("adoption")}
                            description={tModules("definitions.adoption")}
                            align="start"
                          />
                        </span>
                        <span className="font-semibold text-slate-700">{module.adoption}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-cyan-500" style={{ width: `${module.adoption}%` }} />
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <p>{tModules("incidents", { count: module.incidents })}</p>
                      <IndicatorInfo
                        label={tModules("incidents_label")}
                        description={tModules("definitions.incidents")}
                        align="start"
                      />
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </motion.section>

        <motion.section variants={itemVariants} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{tTable("title")}</h2>
            <p className="text-sm text-slate-500 mt-1">{tTable("description")}</p>
          </div>

          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#33a1db] hover:bg-[#33a1db] border-none">
                  <TableHead className="text-white font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      {tTable("source")}
                      <IndicatorInfo
                        label={tTable("source")}
                        description={tTable("definitions.source")}
                        align="start"
                        iconClassName="text-white/80 hover:text-white focus-visible:ring-white/40"
                      />
                    </span>
                  </TableHead>
                  <TableHead className="text-white font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      {tTable("sessions")}
                      <IndicatorInfo
                        label={tTable("sessions")}
                        description={tTable("definitions.sessions")}
                        align="start"
                        iconClassName="text-white/80 hover:text-white focus-visible:ring-white/40"
                      />
                    </span>
                  </TableHead>
                  <TableHead className="text-white font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      {tTable("conversion")}
                      <IndicatorInfo
                        label={tTable("conversion")}
                        description={tTable("definitions.conversion")}
                        align="start"
                        iconClassName="text-white/80 hover:text-white focus-visible:ring-white/40"
                      />
                    </span>
                  </TableHead>
                  <TableHead className="text-white font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      {tTable("revenue")}
                      <IndicatorInfo
                        label={tTable("revenue")}
                        description={tTable("definitions.revenue")}
                        align="start"
                        iconClassName="text-white/80 hover:text-white focus-visible:ring-white/40"
                      />
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={`acquisition-skeleton-${index}`} className="animate-pulse">
                      <TableCell><div className="h-4 w-2/3 bg-slate-200 rounded" /></TableCell>
                      <TableCell><div className="h-4 w-1/2 bg-slate-200 rounded" /></TableCell>
                      <TableCell><div className="h-4 w-1/3 bg-slate-200 rounded" /></TableCell>
                      <TableCell><div className="h-4 w-1/2 bg-slate-200 rounded" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  acquisitionRows.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/60">
                      <TableCell className="font-medium text-slate-800">
                        {tTable(`sources.${item.sourceKey}` as Parameters<typeof tTable>[0])}
                      </TableCell>
                      <TableCell className="text-slate-600">{numberFormatter.format(item.sessions)}</TableCell>
                      <TableCell className="text-slate-600">{decimalFormatter.format(item.conversionRate)}%</TableCell>
                      <TableCell className="text-slate-600">{currencyFormatter.format(item.revenue)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </motion.section>
      </div>
    </motion.div>
  )
}
