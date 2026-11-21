import { z } from "zod";

const username = z.string().trim().min(1, "Username is required");
const email = z.string().trim().email("Enter a valid email address");
const password = z.string().min(8, "Use at least 8 characters").max(72, "Use at most 72 characters")
.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;


export const registerSchema = z.object({
  username,
  email,
  password,
  confirmPassword: z.string().min(1, "Confirm your password"),
}).refine(values => values.password === values.confirmPassword, {
  message: "Passwords do not match", path: ["confirmPassword"],
});
export type RegisterFormValues = z.infer<typeof registerSchema>;


export const verifyEmailSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});
export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;


export const forgotPasswordSchema = z.object({
  email
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;


export const resetPasswordSchema = z.object({
    otp: z.string().regex(/^[0-9]{6}$/, "Enter the 6-digit code"),
    newPassword: password,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match", path: ["confirmPassword"],
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;