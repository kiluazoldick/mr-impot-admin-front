import { redirect } from "@/i18n/navigation"

type Props = {
  params: Promise<{ locale: string }>
}

export default async function IndexPage({ params }: Props) {
  const { locale } = await params;
  
  redirect({
    href: '/login',
    locale: locale
  })

  return null
}
