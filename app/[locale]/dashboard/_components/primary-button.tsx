import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  icon?: LucideIcon
}

export function PrimaryButton({ children, icon: Icon, className, ...props }: PrimaryButtonProps) {
  return (
    <Button 
      className={cn(
        "bg-[#33a1db] hover:bg-blue-500 text-white font-semibold transition-colors shadow-sm",
        "w-full sm:w-auto min-w-[180px] sm:min-w-[200px] h-12 px-5 rounded-lg",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 mr-2 shrink-0" />}
      <span className="truncate">{children}</span>
    </Button>
  )
}
