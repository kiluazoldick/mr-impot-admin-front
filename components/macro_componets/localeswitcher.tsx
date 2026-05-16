'use client';

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Globe } from "lucide-react"; 
import { cn } from "@/lib/utils"; 

export default function LocaleSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const handleLocaleChange = (nextLocale: string) => {
        router.replace(pathname, { locale: nextLocale });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 px-3 gap-2 text-slate-600 hover:text-slate-900 hover:cursor-pointer transition duration-300"
                >
                    <Globe className="h-4 w-4 opacity-70" />
                    <span className="text-sm font-medium uppercase tracking-wider">
                        {locale}
                    </span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-40 p-1">
                <DropdownMenuItem 
                    onClick={() => handleLocaleChange('fr')}
                    className={cn(
                        "flex justify-between items-center cursor-pointer",
                        locale === 'fr' && "bg-slate-100 font-semibold"
                    )}
                >
                    Français
                    {locale === 'fr' && <div className="h-1.5 w-1.5 rounded-full bg-slate-900" />}
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                    onClick={() => handleLocaleChange('en')}
                    className={cn(
                        "flex justify-between items-center cursor-pointer",
                        locale === 'en' && "bg-slate-100 font-semibold"
                    )}
                >
                    English
                    {locale === 'en' && <div className="h-1.5 w-1.5 rounded-full bg-slate-900" />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}