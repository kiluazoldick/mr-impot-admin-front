"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Globe, Bell, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "../_components/page-header";
import LocaleSwitcher from "@/components/macro_componets/localeswitcher";

export default function SettingsPage() {
  const t = useTranslations("Dashboard.Settings");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success(t("save_success"));
    }, 800);
  };

  return (
    <motion.div
      className="flex-1 space-y-6 max-w-350 mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader title={t("title")} description={t("subtitle")} />

      <div className="space-y-4">
        {/* Langue */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-blue-50">
              <Globe className="w-5 h-5 text-[#33a1db]" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-slate-900">
                {t("language")}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {t("language_desc")}
              </p>
              <div className="mt-3">
                <LocaleSwitcher />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-amber-50">
              <Bell className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-slate-900">
                {t("notifications")}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {t("notifications_desc")}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#33a1db]"></div>
                </label>
                <span className="text-sm text-slate-600">
                  {t("email_notifications")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sécurité */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-red-50">
              <Shield className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-slate-900">
                {t("security")}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {t("security_desc")}
              </p>
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-200"
                >
                  {t("change_password")}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-11 px-6 bg-[#33a1db] hover:bg-[#2f90c4] text-white gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {t("save")}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
