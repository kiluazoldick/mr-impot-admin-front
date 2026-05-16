import { useTranslations } from "next-intl"
import { Construction } from "lucide-react"

export default function ComingSoon({ title }: { title: string }) {
  const t = useTranslations("Dashboard.ComingSoon")

  return (
    <div className="relative w-full h-[calc(100vh-120px)] flex items-center justify-center overflow-hidden rounded-xl bg-slate-50 border border-slate-200">
      
      {/* Decorative localized ambient glowing backgrounds for glassmorphism contrast */}
      <div className="absolute top-1/4 -left-10 w-96 h-96 bg-blue-300/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-10 right-1/4 w-96 h-96 bg-[#33a1db]/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Blurred "fake content" background to simulate the UI that will be there */}
      <div className="absolute inset-0 p-8 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40 blur-[4px] pointer-events-none select-none">
        <div className="col-span-1 md:col-span-3 h-32 bg-slate-300/80 rounded-2xl shadow-inner" />
        <div className="col-span-1 md:col-span-2 h-64 bg-slate-300/80 rounded-2xl shadow-inner" />
        <div className="col-span-1 h-64 bg-slate-300/80 rounded-2xl shadow-inner" />
        <div className="col-span-1 md:col-span-3 h-48 bg-slate-300/80 rounded-2xl shadow-inner" />
      </div>

      {/* Floating Card (True Glassmorphism) */}
      <div className="relative z-10 flex flex-col items-center justify-center p-10 text-center bg-white/50 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] max-w-md mx-4 overflow-hidden">
        
        {/* Subtle internal highlight to make the "glass" pop */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none" />
        
        <div className="relative z-10 w-20 h-20 bg-white/60 text-[#33a1db] rounded-full flex items-center justify-center mb-6 shadow-sm border border-white/80 backdrop-blur-md">
          <Construction size={36} />
        </div>
        
        <h2 className="relative z-10 text-2xl font-bold text-slate-800 mb-3">
          {title} - {t("title")}
        </h2>
        
        <p className="relative z-10 text-slate-700 font-medium mb-4 leading-relaxed">
          {t("subtitle")}
        </p>
      </div>
    </div>
  )
}
