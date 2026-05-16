"use client"

import * as React from "react"
import { useTranslations, useLocale } from "next-intl"
import { Calendar as CalendarIcon, ArrowDownUp } from "lucide-react"
import { format } from "date-fns"
import { fr, enUS } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type FilterTab = "category" | "subcategory" | "date"

export function DocumentsFilter() {
  const tDoc = useTranslations("Dashboard.Documents")
  const t = useTranslations("Dashboard.Documents.filter")
  const localeStr = useLocale()
  const dateLocale = localeStr === "fr" ? fr : enUS

  const [activeTab, setActiveTab] = React.useState<FilterTab>("category")
  const [fromDate, setFromDate] = React.useState<Date>()
  const [toDate, setToDate] = React.useState<Date>()

  const categories = [
    { id: "law", label: t("law") },
    { id: "decree", label: t("decree") },
    { id: "jurisprudence", label: t("jurisprudence") },
  ]

  const subcategories = [
    { id: "tax", label: t("tax_law") },
    { id: "civil", label: t("civil_law") },
    { id: "criminal", label: t("criminal_law") },
    { id: "international", label: t("international_law") },
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="text-slate-600 gap-2 h-10 px-4 shrink-0 rounded-lg shadow-sm hover:cursor-pointer">
          {tDoc("sort")}
          <ArrowDownUp className="w-4 h-4 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-95 p-0 rounded-2xl shadow-xl overflow-hidden border-slate-200" align="end" sideOffset={8}>
        <div className="flex min-h-55">
          {/* Left Sidebar */}
          <div className="w-35 bg-[#f8f9fa] flex flex-col shrink-0">
            <button
              onClick={() => setActiveTab("category")}
              className={cn(
                "text-left px-5 py-3.5 text-sm font-medium transition-colors border-b border-slate-200/80 outline-none",
                activeTab === "category" ? "bg-white text-black" : "text-slate-700 hover:bg-slate-200/40"
              )}
            >
              {t("category")}
            </button>
            <button
              onClick={() => setActiveTab("subcategory")}
              className={cn(
                "text-left px-5 py-3.5 text-sm font-medium transition-colors border-b border-slate-200/80 outline-none",
                activeTab === "subcategory" ? "bg-white text-black" : "text-slate-700 hover:bg-slate-200/40"
              )}
            >
              {t("subcategory")}
            </button>
            <button
              onClick={() => setActiveTab("date")}
              className={cn(
                "text-left px-5 py-3.5 text-sm font-medium transition-colors outline-none",
                activeTab === "date" ? "bg-white text-black" : "text-slate-700 hover:bg-slate-200/40"
              )}
            >
              {t("date")}
            </button>
          </div>

          {/* Right Content */}
          <div className="flex-1 bg-white p-5 overflow-y-auto">
            {activeTab === "category" && (
              <div className="flex flex-col gap-3">
                {categories.map((c) => (
                  <button key={c.id} className="text-left text-[15px] text-black hover:text-slate-500 font-medium transition-colors outline-none">
                    {c.label}
                  </button>
                ))}
              </div>
            )}
            
            {activeTab === "subcategory" && (
              <div className="flex flex-col gap-3">
                {subcategories.map((c) => (
                  <button key={c.id} className="text-left text-[15px] text-black hover:text-slate-500 font-medium transition-colors outline-none">
                    {c.label}
                  </button>
                ))}
              </div>
            )}

            {activeTab === "date" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-black">{t("from")}</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className={cn(
                        "relative border shadow-sm border-gray-400 rounded-md focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all",
                        "w-full pl-3 pr-10 py-2 text-sm font-medium text-left outline-none bg-transparent flex justify-between items-center",
                        !fromDate && "text-slate-500 font-normal"
                      )}>
                        {fromDate ? format(fromDate, "dd-MM-yyyy") : "DD-MM-YYYY"}
                        <CalendarIcon className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={fromDate}
                        onSelect={setFromDate}
                        defaultMonth={fromDate}
                        locale={dateLocale}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-black">{t("to")}</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className={cn(
                        "relative border shadow-sm border-gray-400 rounded-md focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all",
                        "w-full pl-3 pr-10 py-2 text-sm font-medium text-left outline-none bg-transparent flex justify-between items-center",
                        !toDate && "text-slate-500 font-normal"
                      )}>
                        {toDate ? format(toDate, "dd-MM-yyyy") : "DD-MM-YYYY"}
                        <CalendarIcon className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={toDate}
                        onSelect={setToDate}
                        defaultMonth={toDate}
                        locale={dateLocale}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
