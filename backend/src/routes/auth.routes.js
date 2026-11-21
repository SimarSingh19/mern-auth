import router from "express";
import * as authController from "../controllers/auth.controller.js";

import { uploadProfilePicture } from "../middlewares/uploadProfilePicture.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { validateUserId } from "../middlewares/validateUserId.js";
import { validateRegister } from "../middlewares/validateRegister.js";
import { validateLogin } from "../middlewares/validateLogin.js"
import { validateVerifyEmail } from "../middlewares/validateVerifyEmail.js";
import { validateEmail } from "../middlewares/validateEmail.js";
import { validateResetPassword } from "../middlewares/validateResetPassword.js";
import { uploadToImageKit } from "../middlewares/uploadToImageKit.js";

const authRouter = router();

authRouter.post("/register", validateRegister, authController.register);
authRouter.post("/login", validateLogin, authController.login);
authRouter.get("/get-me", authController.getMe);

authRouter.post("/logout", authController.logout);
authRouter.post("/logout-all", authController.logoutAll);
authRouter.post("/verify-email", validateVerifyEmail, authController.verifyEmail);

authRouter.post("/send-verification-otp", validateEmail, authController.sendVerificationOtp);

authRouter.post("/forgot-password", validateEmail, authController.forgotPassword);
authRouter.post("/reset-password", validateResetPassword, authController.resetPassword);


authRouter.patch("/profile/picture", requireAuth, uploadProfilePicture, uploadToImageKit, authController.updateProfilePicture);
authRouter.patch("/profile", requireAuth, uploadProfilePicture, uploadToImageKit, authController.updateProfile);

authRouter.get("/admin/users", requireAdmin, authController.listUsers);
authRouter.delete("/admin/users/:userId", requireAdmin, validateUserId, authController.deleteAdminUser);
authRouter.patch("/admin/users/:userId", requireAdmin, validateUserId, authController.updateAdminUser);

export default authRouter;
