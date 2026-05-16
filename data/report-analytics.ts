import type { LucideIcon } from "lucide-react"
import {
  BadgePercent,
  CircleCheckBig,
  FileChartColumnIncreasing,
  TriangleAlert,
  Users,
} from "lucide-react"

export type AnalyticsPeriod = "7d" | "30d" | "90d"

export type AnalyticsSegment = "all" | "admins" | "paid" | "free"

export type ReportKpiId =
  | "active_accounts"
  | "conversion_rate"
  | "subscription_revenue"
  | "support_resolution_rate"
  | "documents_published"
  | "critical_alerts"

export interface ReportKpiDefinition {
  id: ReportKpiId
  titleKey: string
  icon: LucideIcon
  bgColor: string
  valueType: "number" | "percent" | "currency"
  values: Record<AnalyticsPeriod, number>
  deltas: Record<AnalyticsPeriod, number>
  invertDelta?: boolean
}

export const reportKpis: ReportKpiDefinition[] = [
  {
    id: "active_accounts",
    titleKey: "active_accounts",
    icon: Users,
    bgColor: "bg-[#33a1db]",
    valueType: "number",
    values: {
      "7d": 482,
      "30d": 1946,
      "90d": 5610,
    },
    deltas: {
      "7d": 8.2,
      "30d": 11.4,
      "90d": 14.9,
    },
  },
  {
    id: "conversion_rate",
    titleKey: "conversion_rate",
    icon: BadgePercent,
    bgColor: "bg-cyan-500",
    valueType: "percent",
    values: {
      "7d": 12.7,
      "30d": 11.8,
      "90d": 10.9,
    },
    deltas: {
      "7d": 1.3,
      "30d": 0.9,
      "90d": 0.5,
    },
  },
  {
    id: "subscription_revenue",
    titleKey: "subscription_revenue",
    icon: FileChartColumnIncreasing,
    bgColor: "bg-emerald-500",
    valueType: "currency",
    values: {
      "7d": 24680,
      "30d": 99540,
      "90d": 283700,
    },
    deltas: {
      "7d": 6.4,
      "30d": 9.2,
      "90d": 12.1,
    },
  },
  {
    id: "support_resolution_rate",
    titleKey: "support_resolution_rate",
    icon: CircleCheckBig,
    bgColor: "bg-blue-500",
    valueType: "percent",
    values: {
      "7d": 91.3,
      "30d": 89.8,
      "90d": 87.2,
    },
    deltas: {
      "7d": 1.7,
      "30d": 2.5,
      "90d": 3.8,
    },
  },
  {
    id: "documents_published",
    titleKey: "documents_published",
    icon: FileChartColumnIncreasing,
    bgColor: "bg-sky-500",
    valueType: "number",
    values: {
      "7d": 68,
      "30d": 255,
      "90d": 772,
    },
    deltas: {
      "7d": 5.1,
      "30d": 7.9,
      "90d": 10.8,
    },
  },
  {
    id: "critical_alerts",
    titleKey: "critical_alerts",
    icon: TriangleAlert,
    bgColor: "bg-rose-500",
    valueType: "number",
    values: {
      "7d": 7,
      "30d": 19,
      "90d": 58,
    },
    deltas: {
      "7d": -18.2,
      "30d": -12.7,
      "90d": -9.6,
    },
    invertDelta: true,
  },
]

export const segmentKpiMultipliers: Record<AnalyticsSegment, Record<ReportKpiId, number>> = {
  all: {
    active_accounts: 1,
    conversion_rate: 1,
    subscription_revenue: 1,
    support_resolution_rate: 1,
    documents_published: 1,
    critical_alerts: 1,
  },
  admins: {
    active_accounts: 0.18,
    conversion_rate: 1.06,
    subscription_revenue: 0.24,
    support_resolution_rate: 1.08,
    documents_published: 0.62,
    critical_alerts: 0.58,
  },
  paid: {
    active_accounts: 0.56,
    conversion_rate: 1.18,
    subscription_revenue: 1.23,
    support_resolution_rate: 1.05,
    documents_published: 0.72,
    critical_alerts: 0.82,
  },
  free: {
    active_accounts: 0.44,
    conversion_rate: 0.76,
    subscription_revenue: 0.16,
    support_resolution_rate: 0.87,
    documents_published: 0.39,
    critical_alerts: 1.28,
  },
}

export interface TrendDataPoint {
  labelKey: string
  activeUsers: number
  newSubscriptions: number
  supportTickets: number
  revenue: number
}

export const trendDataByPeriod: Record<AnalyticsPeriod, TrendDataPoint[]> = {
  "7d": [
    { labelKey: "monday", activeUsers: 412, newSubscriptions: 33, supportTickets: 18, revenue: 3120 },
    { labelKey: "tuesday", activeUsers: 430, newSubscriptions: 36, supportTickets: 21, revenue: 3380 },
    { labelKey: "wednesday", activeUsers: 451, newSubscriptions: 39, supportTickets: 17, revenue: 3510 },
    { labelKey: "thursday", activeUsers: 463, newSubscriptions: 43, supportTickets: 16, revenue: 3720 },
    { labelKey: "friday", activeUsers: 488, newSubscriptions: 46, supportTickets: 24, revenue: 3860 },
    { labelKey: "saturday", activeUsers: 472, newSubscriptions: 35, supportTickets: 19, revenue: 3480 },
    { labelKey: "sunday", activeUsers: 467, newSubscriptions: 34, supportTickets: 14, revenue: 3610 },
  ],
  "30d": [
    { labelKey: "week_1", activeUsers: 1580, newSubscriptions: 119, supportTickets: 85, revenue: 23800 },
    { labelKey: "week_2", activeUsers: 1640, newSubscriptions: 127, supportTickets: 78, revenue: 24720 },
    { labelKey: "week_3", activeUsers: 1725, newSubscriptions: 132, supportTickets: 93, revenue: 25510 },
    { labelKey: "week_4", activeUsers: 1810, newSubscriptions: 145, supportTickets: 81, revenue: 27390 },
    { labelKey: "week_5", activeUsers: 1946, newSubscriptions: 154, supportTickets: 76, revenue: 28120 },
  ],
  "90d": [
    { labelKey: "month_jan", activeUsers: 4980, newSubscriptions: 413, supportTickets: 287, revenue: 82800 },
    { labelKey: "month_feb", activeUsers: 5140, newSubscriptions: 426, supportTickets: 274, revenue: 87430 },
    { labelKey: "month_mar", activeUsers: 5310, newSubscriptions: 447, supportTickets: 262, revenue: 91220 },
    { labelKey: "month_apr", activeUsers: 5610, newSubscriptions: 468, supportTickets: 249, revenue: 94150 },
  ],
}

export type ModuleTrend = "up" | "down" | "stable"

export interface ModuleHealthItem {
  id: "user_management" | "documents" | "support" | "subscriptions"
  summaryKey: string
  score: number
  adoption: number
  incidents: number
  trend: ModuleTrend
}

export const moduleHealthData: ModuleHealthItem[] = [
  {
    id: "user_management",
    summaryKey: "user_management_summary",
    score: 92,
    adoption: 84,
    incidents: 2,
    trend: "up",
  },
  {
    id: "documents",
    summaryKey: "documents_summary",
    score: 88,
    adoption: 79,
    incidents: 3,
    trend: "up",
  },
  {
    id: "support",
    summaryKey: "support_summary",
    score: 73,
    adoption: 67,
    incidents: 8,
    trend: "down",
  },
  {
    id: "subscriptions",
    summaryKey: "subscriptions_summary",
    score: 81,
    adoption: 74,
    incidents: 4,
    trend: "stable",
  },
]

export type InsightSeverity = "high" | "medium" | "low"

export interface InsightItem {
  id: string
  titleKey: string
  descriptionKey: string
  severity: InsightSeverity
  delta: number
  actionKey: string
}

export const insightItems: InsightItem[] = [
  {
    id: "ticket-spike",
    titleKey: "ticket_spike_title",
    descriptionKey: "ticket_spike_description",
    severity: "high",
    delta: 18.6,
    actionKey: "open_support_queue",
  },
  {
    id: "conversion-dip",
    titleKey: "conversion_dip_title",
    descriptionKey: "conversion_dip_description",
    severity: "medium",
    delta: -4.2,
    actionKey: "review_checkout_flow",
  },
  {
    id: "doc-uptake",
    titleKey: "doc_uptake_title",
    descriptionKey: "doc_uptake_description",
    severity: "low",
    delta: 9.4,
    actionKey: "promote_best_content",
  },
]

export interface AcquisitionItem {
  id: string
  sourceKey: string
  sessions: number
  conversionRate: number
  revenue: number
}

export const acquisitionData: AcquisitionItem[] = [
  { id: "organic", sourceKey: "organic_search", sessions: 4180, conversionRate: 10.8, revenue: 29400 },
  { id: "newsletter", sourceKey: "newsletter", sessions: 1670, conversionRate: 17.4, revenue: 22650 },
  { id: "social", sourceKey: "social_media", sessions: 2390, conversionRate: 8.1, revenue: 14890 },
  { id: "referral", sourceKey: "referrals", sessions: 980, conversionRate: 14.9, revenue: 11780 },
]
