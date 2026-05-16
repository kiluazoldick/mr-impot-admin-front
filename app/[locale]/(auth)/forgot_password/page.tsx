'use client';

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import InputIconWrapper from "../_components/inputiconwrapper";
import { ArrowRight, Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";

const ForgotPassword = () => {
    const t = useTranslations('Auth');
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    const simulateError = true; 

                    if (simulateError) {
                        reject(new Error(t('ForgotPassword.error_message'))); 
                    } else {
                        resolve("Succès")
                    }
                }, 2000)
            });

            setIsSubmitted(true);
        } catch (err: unknown) {
            setError((err as Error).message || "Une erreur inattendue s'est produite.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-3/4 space-y-8"
        >
            <div>
                <h1 className='text-4xl font-bold mb-2 text-center'>
                    {t('ForgotPassword.forgot_password_title')}
                </h1>
                <p className="text-slate-500 text-lg text-center">
                    {t('ForgotPassword.forgot_password_subtitle')}
                </p>
            </div>

            {isSubmitted ? (
                <div className="flex flex-col items-center justify-center space-y-6 bg-slate-50 p-8 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-16 h-16 text-green-500" strokeWidth={1.5} />
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-slate-800">
                            {t('ForgotPassword.success_title')}
                        </h2>
                        <p className="text-slate-500">
                            {t('ForgotPassword.success_message')}
                        </p>
                    </div>
                    <Link
                        href="/login"
                        className="text-lg font-semibold text-[var(--default-color)] hover:underline mt-4"
                    >
                        {t('ForgotPassword.back_to_login')}
                    </Link>
                </div>
            ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                    
                    {/* --- BANNIÈRE D'ERREUR --- */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm tracking-wide">
                            {t('ForgotPassword.email_label')}
                        </Label>
                        <InputIconWrapper
                            icon={<Mail className='h-5 w-5 text-slate-400 group-focus-within:text-slate-600' />}
                        >
                            <Input
                                id="email"
                                type="email"
                                required
                                placeholder="Email"
                                className={`h-14 border-slate-200 ${error ? 'border-red-300 focus-visible:ring-red-500' : ''}`}
                            />
                        </InputIconWrapper>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={isLoading} 
                        className="w-full h-14 text-xl font-bold bg-[var(--default-color)] hover:bg-[var(--default-color)]/80 shadow-lg cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                    >
                        {isLoading ? (
                            <>
                                {t('ForgotPassword.sending_button')}
                                <Loader2 className='w-6 h-6 ml-2 animate-spin' strokeWidth={2.5} />
                            </>
                        ) : (
                            <>
                                {t('ForgotPassword.send_button')}
                                <ArrowRight className='w-6 h-6 ml-2' strokeWidth={2.5} />
                            </>
                        )}
                    </Button>

                    <Link
                        href="/login"
                        className="text-lg block text-center font-semibold hover:text-slate-600 transition-colors"
                    >
                        {t('ForgotPassword.back_to_login')}
                    </Link>
                </form>
            )}
        </motion.div>
    )
}

export default ForgotPassword;