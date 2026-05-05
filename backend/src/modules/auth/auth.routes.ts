import { Router } from "express";
import { forgotPassword, login, logout, refresh, register, resendVerificationEmail, resetPassword, verifyEmail, } from "./auth.controller.ts";
import { validate } from "./auth.middleware.ts";
import { loginSchema, registerSchema } from "./auth.validation.ts";

export const authRouter = Router()

authRouter.post("/register", validate(registerSchema), register)
authRouter.post("/login", validate(loginSchema), login)
authRouter.post("/logout", logout)
authRouter.post("/refresh", refresh)

authRouter.post("/forgot-password", forgotPassword)
authRouter.post("/reset-password", resetPassword)

authRouter.post("/verify-email", verifyEmail)
authRouter.post("/resend-verification-email", resendVerificationEmail)
