"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart,
  Files,
  Tags,
  Newspaper,
  Video,
  Film,
  Play,
} from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import Image from "next/image";

export function Sidebar({ className }: { className?: string }) {
  const t = useTranslations("Dashboard.Sidebar");
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    {
      href: "/dashboard/user-management",
      label: t("user_management"),
      icon: Users,
    },
    {
      href: "/dashboard/documents",
      label: t("documents"),
      icon: FileText,
      subLinks: [
        {
          href: "/dashboard/documents",
          label: t("documents_list"),
          icon: Files,
        },
        {
          href: "/dashboard/documents/categories",
          label: t("categories"),
          icon: Tags,
        },
        {
          href: "/dashboard/documents/articles",
          label: t("articles"),
          icon: Newspaper,
        },
      ],
    },
    {
      href: "/dashboard/videos",
      label: t("videos"),
      icon: Video,
      subLinks: [
        { href: "/dashboard/videos", label: t("videos_list"), icon: Film },
        { href: "/dashboard/videos/add", label: t("add_video"), icon: Play },
      ],
    },
    {
      href: "/dashboard/report-analytics",
      label: t("report_analytics"),
      icon: BarChart,
    },
  ];

  return (
    <aside
      className={cn(
        "w-64 bg-white h-screen flex flex-col border-r border-slate-100",
        className,
      )}
    >
      <div className="flex justify-center items-center h-32 my-6 shrink-0">
        <div className="w-32 h-32 rounded-xl flex items-center justify-center">
          <Image
            src={"/logo.svg"}
            alt={"Logo mr impot"}
            width={40}
            height={40}
            loading="eager"
            className="w-full bg-slate-100 rounded-xl"
          />
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 px-4 overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:#33a1db_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#33a1db]/70 [&::-webkit-scrollbar-thumb]:hover:bg-[#33a1db] [&::-webkit-scrollbar-track]:bg-transparent">
        <nav className="flex flex-col gap-2 pb-4 pt-2">
          {links.map((link) => {
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === link.href ||
                  pathname.startsWith(link.href + "/");

            const Icon = link.icon;

            return (
              <div key={link.href} className="flex flex-col gap-1">
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#33a1db] text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <Icon
                    size={18}
                    className={cn(isActive ? "text-white" : "text-slate-400")}
                  />
                  {link.label}
                </Link>
                {link.subLinks && isActive && (
                  <div className="flex flex-col gap-1 ml-6 pl-3 border-l-2 border-slate-100 mt-1">
                    {link.subLinks.map((subLink) => {
                      const isSubActive = pathname === subLink.href;
                      const SubIcon = subLink.icon;

                      return (
                        <Link
                          key={subLink.href}
                          href={subLink.href}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                            isSubActive
                              ? "bg-blue-50 text-[#33a1db] font-medium"
                              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50",
                          )}
                        >
                          {SubIcon && (
                            <SubIcon
                              size={16}
                              className={cn(
                                isSubActive
                                  ? "text-[#33a1db]"
                                  : "text-slate-400",
                              )}
                            />
                          )}
                          {subLink.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-slate-100">
        <p className="text-center text-sm font-medium text-slate-400">
          {t("version")}
        </p>
      </div>
    </aside>
  );
}
