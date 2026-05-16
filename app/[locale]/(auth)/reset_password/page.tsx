'use client';

import { useState } from "react";
import { useTranslations } from "next-intl";
import { resetPasswordSchema, ResetPasswordValues } from "@/lib/validations/auth";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { PasswordInput } from "../_components/passwordinput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";

const ResetPassword = () => {
    const t = useTranslations('Auth');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { password: "", confirmPassword: "" }
    });

    const onSubmit = async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-3/4 flex flex-col items-center space-y-6 bg-slate-50 p-8 rounded-xl border border-slate-100"
            >
                <CheckCircle2 className="w-16 h-16 text-green-500" />
                <h2 className="text-2xl font-bold">{t('ResetPassword.success_title')}</h2>
                <Button className="w-full h-14 bg-(--default-color) hover:bg-(--default-color)/80 shadow-lg transition-all">
                    <Link href="/login">{t('ResetPassword.go_to_login')}</Link>
                </Button>
            </motion.div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-3/4 space-y-8"
        >
            <div className="text-center">
                <h1 className='text-4xl font-bold mb-2'>{t('ResetPassword.title')}</h1>
                <p className="text-slate-500 text-lg">{t('ResetPassword.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Nouveau mot de passe */}
                <div className="space-y-2">
                    <Label htmlFor="password">{t('ResetPassword.new_password_label')}</Label>
                    <PasswordInput 
                        id="password" 
                        {...register("password")} 
                    />
                    {errors.password && (
                        <p className="text-sm font-medium text-red-500">
                            {t(`ResetPassword.errors.${errors.password.message}`)}
                        </p>
                    )}
                </div>

                {/* Confirmation */}
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('ResetPassword.confirm_password_label')}</Label>
                    <PasswordInput 
                        id="confirmPassword" 
                        {...register("confirmPassword")} 
                    />
                    {errors.confirmPassword && (
                        <p className="text-sm font-medium text-red-500">
                            {t(`ResetPassword.errors.${errors.confirmPassword.message}`)}
                        </p>
                    )}
                </div>

                <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-14 text-xl font-bold bg-(--default-color) hover:bg-(--default-color)/80 shadow-lg transition-all"
                >
                    {isSubmitting ? (
                        <Loader2 className='w-6 h-6 animate-spin' />
                    ) : (
                        <>
                            {t('ResetPassword.submit_button')}
                            <ShieldCheck className="ml-2 h-6 w-6" />
                        </>
                    )}
                </Button>
            </form>
        </motion.div>
    );
};

export default ResetPassword;