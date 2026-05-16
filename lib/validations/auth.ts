import * as z from 'zod'

export const loginSchema = z.object({
  email: z.email("invalid_email"),
  password: z.string().min(1, "password_required"),
})

export const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, { message: "password_too_short" })
        .regex(/[A-Z]/, { message: "password_no_uppercase" })
        .regex(/[a-z]/, { message: "password_no_lowercase" })
        .regex(/[0-9]/, { message: "password_no_number" })
        .regex(/[@$!%*?&]/, { message: "password_no_special_char" }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "passwords_mismatch",
    path: ["confirmPassword"],
})

export type LoginValues = z.infer<typeof loginSchema>
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>