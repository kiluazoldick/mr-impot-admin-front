"use client";

import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginValues } from "@/lib/validations/auth";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowRight, Mail, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useRouter } from "@/i18n/navigation";
import InputIconWrapper from "../_components/inputiconwrapper";
import { PasswordInput } from "../_components/passwordinput";
import { motion } from "framer-motion";
import { authApi } from "@/lib/api-client";

const LoginPage = () => {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginValues) => {
    clearErrors();

    try {
      const response = await authApi.login(data.email, data.password);

      // Stocker le token dans localStorage
      if (response?.session?.access_token) {
        localStorage.setItem("sb-access-token", response.session.access_token);
      }

      toast.success(t("Login.success_msg"));

      // Rediriger vers le dashboard
      router.push("/dashboard");
    } catch (error: any) {
      setError("root", {
        type: "server",
        message: error.message || t("Login.error_msg"),
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-3/4 space-y-8"
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">{t("Login.login_title")}</h1>
        <p className="text-slate-500 text-lg">{t("Login.login_subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {errors.root?.message && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errors.root.message}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">{t("Login.login_email")}</Label>
          <InputIconWrapper icon={<Mail className="h-5 w-5 text-slate-400" />}>
            <Input
              {...register("email")}
              id="email"
              placeholder="Email"
              className={`h-14 border-slate-200 ${errors.email ? "border-red-500" : ""}`}
            />
          </InputIconWrapper>
          {errors.email?.message && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t("Login.login_password")}</Label>
          <PasswordInput
            {...register("password")}
            id="password"
            placeholder="••••••••"
          />
          {errors.password?.message && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" className="border-slate-300" />
            <Label
              htmlFor="remember"
              className="text-sm font-semibold text-(--default-color) cursor-pointer"
            >
              {t("Login.remember_me")}
            </Label>
          </div>
          <Link
            href="/forgot_password"
            className="text-sm font-semibold underline text-(--default-color)"
          >
            {t("Login.forgot_password")}
          </Link>
        </div>

        <Button
          disabled={isSubmitting}
          className="w-full h-14 text-xl font-bold bg-(--default-color) hover:bg-(--default-color)/80 shadow-lg disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
        >
          {isSubmitting ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              {t("Login.login_button")}
              <ArrowRight className="w-8 h-8 ml-2" strokeWidth={2.5} />
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
};

export default LoginPage;
