"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import LocaleSwitcher from "@/components/macro_componets/localeswitcher";
import { Sidebar } from "./sidebar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
}

interface TopbarProps {
  profile: Profile | null;
}

function getInitials(firstName?: string, lastName?: string) {
  const parts = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (!parts) return "U";

  const initials = parts
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "U";
}

export function Topbar({ profile }: Readonly<TopbarProps>) {
  const t = useTranslations("Dashboard.Topbar");
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
      profile.email
    : "Admin";

  const displayEmail = profile?.email || "";
  const avatarInitials = useMemo(
    () => getInitials(profile?.first_name, profile?.last_name),
    [profile],
  );

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Supprimer les cookies en les expirant
      document.cookie = "sb-access-token=; path=/; max-age=0";
      document.cookie = "sb-refresh-token=; path=/; max-age=0";
      toast.success(t("logout_success"));
      router.replace("/login");
    } catch {
      toast.error(t("logout_error"));
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="h-20 flex items-center justify-between px-2 z-10 top-0">
      <div className="flex items-center justify-between w-full bg-white rounded-xl my-3 p-4 gap-4">
        <div className="lg:hidden flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 text-slate-500 hover:text-slate-700 bg-slate-50 rounded-lg transition-colors cursor-pointer">
                <Menu size={20} />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 border-none w-64 bg-transparent outline-none"
            >
              <SheetTitle className="sr-only">Menu principal</SheetTitle>
              <Sidebar className="w-full flex-1 rounded-r-2xl" />
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex-1 max-w-xl relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("search_placeholder")}
            className="w-full bg-slate-50 border-none outline-none focus:ring-0 text-sm h-10 pl-10 pr-4 rounded-full text-slate-700 font-medium"
          />
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <LocaleSwitcher />
          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer select-none">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                  <span className="text-xs font-semibold text-slate-600">
                    {avatarInitials}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">
                    {displayName}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {displayEmail}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>{t("profile")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>{t("settings")}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-700"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
