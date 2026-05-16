"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, ShieldPlus } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { Link, useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const adminSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères"),
})

type AdminFormValues = z.infer<typeof adminSchema>

export function AdminAccountForm() {
  const t = useTranslations("Dashboard.UserManagement.CreateAdmin")
  const router = useRouter()

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  const onSubmit = async (values: AdminFormValues) => {
    try {
      const response = await fetch("http://localhost:3000/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
        credentials: "include",
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Erreur création")
      }

      toast.success(t("success_message"))
      router.push("/dashboard/user-management")
    } catch (error: any) {
      toast.error(error.message || t("error_message"))
    }
  }

  return (
    <motion.div className="flex-1 space-y-6 max-w-350 mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Link href="/dashboard/user-management" className="inline-flex pt-2 pl-6 items-center text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("back")}
      </Link>

      <section className="space-y-6 bg-white rounded-xl p-6 md:p-8 border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("subtitle")}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.full_name")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t("form.full_name_placeholder")} className="h-11 bg-slate-50/50 border-slate-200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.email")}</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder={t("form.email_placeholder")} className="h-11 bg-slate-50/50 border-slate-200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.password")}</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder={t("form.password_placeholder")} className="h-11 bg-slate-50/50 border-slate-200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button type="button" variant="outline" className="h-11 px-5" onClick={() => router.push("/dashboard/user-management")}>
                {t("form.cancel")}
              </Button>
              <Button type="submit" className="h-11 px-5 bg-[#33a1db] hover:bg-[#2f90c4] text-white" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldPlus className="w-4 h-4" />}
                {t("form.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </section>
    </motion.div>
  )
}