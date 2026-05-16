"use client"

import { Download, FileSpreadsheet, FileText } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type ExportFormat = "csv" | "xlsx" | "pdf"

interface ExportReportMenuProps {
  onExport: (format: ExportFormat) => void
  disabled?: boolean
}

const formatIconMap: Record<ExportFormat, typeof FileText> = {
  csv: FileText,
  xlsx: FileSpreadsheet,
  pdf: FileText,
}

const exportFormats: ExportFormat[] = ["csv", "xlsx", "pdf"]

export function ExportReportMenu({ onExport, disabled = false }: ExportReportMenuProps) {
  const t = useTranslations("Dashboard.ReportAnalytics.export")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 px-4 border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          disabled={disabled}
        >
          <Download className="w-4 h-4 mr-2" />
          {t("trigger")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {exportFormats.map((format) => {
          const Icon = formatIconMap[format]

          return (
            <DropdownMenuItem
              key={format}
              onSelect={() => onExport(format)}
              className="text-slate-700"
            >
              <Icon className="w-4 h-4 mr-2" />
              {t(`formats.${format}` as Parameters<typeof t>[0])}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
