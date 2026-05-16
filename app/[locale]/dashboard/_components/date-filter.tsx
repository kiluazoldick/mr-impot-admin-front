"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { format } from "date-fns"
import { fr, enUS } from "date-fns/locale"

import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DateFilter() {
  const t = useTranslations("Dashboard.Page")
  const localeStr = useLocale()
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  const locale = localeStr === "fr" ? fr : enUS

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex items-center justify-between sm:justify-start gap-2 bg-[#33a1db] hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg hover:cursor-pointer text-sm font-semibold transition-colors w-full sm:w-auto min-w-45 sm:min-w-50 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <CalendarIcon size={18} className="shrink-0" />
            <div className="flex flex-col items-start leading-tight">
              <span>{t("filter_period")}</span>
              <span className="text-xs font-normal opacity-80 capitalize">
                {date ? format(date, "MMMM yyyy", { locale }) : format(new Date(), "MMMM yyyy", { locale })}
              </span>
            </div>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          locale={locale}
        />
      </PopoverContent>
    </Popover>
  )
}