"use client"

import * as React from "react"
import { CircleHelp } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface IndicatorInfoProps {
  label: string
  description: string
  align?: React.ComponentProps<typeof PopoverContent>["align"]
  iconClassName?: string
  contentClassName?: string
}

export function IndicatorInfo({
  label,
  description,
  align = "center",
  iconClassName,
  contentClassName,
}: IndicatorInfoProps) {
  const t = useTranslations("Dashboard.ReportAnalytics")

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex size-4 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33a1db]/40 focus-visible:ring-offset-2",
            iconClassName
          )}
          aria-label={t("indicator_info_aria", { indicator: label })}
        >
          <CircleHelp className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} className={cn("w-64 p-3", contentClassName)}>
        <p className="text-xs font-semibold text-slate-900">{label}</p>
        <p className="text-xs leading-relaxed text-slate-500">{description}</p>
      </PopoverContent>
    </Popover>
  )
}
