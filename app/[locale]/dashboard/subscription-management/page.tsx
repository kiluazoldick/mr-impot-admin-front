import { useTranslations } from "next-intl"
import ComingSoon from "@/components/macro_componets/coming-soon"

export default function SubscriptionManagementPage() {
  const t = useTranslations("Dashboard.Sidebar")
  return <ComingSoon title={t("subscription_management")} />
}