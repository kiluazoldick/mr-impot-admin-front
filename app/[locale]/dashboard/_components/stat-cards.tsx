import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

export interface StatData {
  title: string
  value: string | number
  icon: LucideIcon
  bgColor: string
}

interface StatCardsProps {
  items: StatData[]
  className?: string
}

export function StatCards({ items, className }: StatCardsProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {items.map((stat, idx) => (
        <Card key={idx} className="border-slate-100 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div
              className={cn(
                "w-14 h-14 rounded-xl shrink-0 flex items-center justify-center text-white",
                stat.bgColor
              )}
            >
              <stat.icon size={28} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-slate-500">
                {stat.title}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-slate-700">
                  {stat.value}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
