"use client"

import { GitCompareArrows } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AnalyticsPeriod, AnalyticsSegment } from "@/data/report-analytics"
import { cn } from "@/lib/utils"

interface AnalyticsFiltersProps {
  period: AnalyticsPeriod
  segment: AnalyticsSegment
  compareEnabled: boolean
  onPeriodChange: (nextPeriod: AnalyticsPeriod) => void
  onSegmentChange: (nextSegment: AnalyticsSegment) => void
  onCompareToggle: () => void
  disabled?: boolean
}

const periodOptions: AnalyticsPeriod[] = ["7d", "30d", "90d"]
const segmentOptions: AnalyticsSegment[] = ["all", "admins", "paid", "free"]

export function AnalyticsFilters({
  period,
  segment,
  compareEnabled,
  onPeriodChange,
  onSegmentChange,
  onCompareToggle,
  disabled = false,
}: AnalyticsFiltersProps) {
  const t = useTranslations("Dashboard.ReportAnalytics.filters")

  return (
    <section className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{t("title")}</h2>
        <p className="text-sm text-slate-500 mt-1">{t("description")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t("period_label")}</p>
          <Select
            value={period}
            onValueChange={(value) => onPeriodChange(value as AnalyticsPeriod)}
            disabled={disabled}
          >
            <SelectTrigger className="h-10 w-full border-slate-200 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {t(`period_options.${option}` as Parameters<typeof t>[0])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t("segment_label")}</p>
          <Select
            value={segment}
            onValueChange={(value) => onSegmentChange(value as AnalyticsSegment)}
            disabled={disabled}
          >
            <SelectTrigger className="h-10 w-full border-slate-200 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {segmentOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {t(`segment_options.${option}` as Parameters<typeof t>[0])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t("compare_label")}</p>
          <Button
            type="button"
            variant="outline"
            onClick={onCompareToggle}
            disabled={disabled}
            className={cn(
              "h-10 w-full justify-start border-slate-200",
              compareEnabled && "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100"
            )}
          >
            <GitCompareArrows className="w-4 h-4 mr-2" />
            {compareEnabled ? t("compare_toggle_on") : t("compare_toggle_off")}
          </Button>
        </div>
      </div>
    </section>
  )
}
