"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Sidebar } from "./_components/sidebar";
import { Topbar } from "./_components/topbar";
import { authApi } from "@/lib/api-client";
import { Loader2 } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await authApi.me();
        setProfile(data.profile);
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#EDF2F0]">
        <Loader2 className="h-8 w-8 animate-spin text-[#33a1db]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#EDF2F0] text-slate-900 overflow-hidden">
      <Sidebar className="hidden lg:flex" />
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden w-full">
        <Topbar profile={profile} />
        <main className="p-2 pb-4 w-full max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
