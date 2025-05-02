import { Router } from "express";
import {
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgottenPassword,
  verifyAccount,
} from "./user.controllers.js";
import { validate } from "../../utils/validator/index.js";
import {
  userRegistrationValidator,
  userLoginValidator,
  emailValidator,
  passwordValidator,
} from "../../utils/validator/validators.js";
import { isLoggedIn } from "../../utils/route-protector.js";

const router = Router();

router.post("/register", userRegistrationValidator(), validate, registerUser);
router.get("/verify-account/:token", verifyAccount);
router.post("/login", userLoginValidator(), validate, loginUser);
router.post("/resend-verification-email", emailValidator(), validate, resendEmailVerification);
router.post("/forgot-password", emailValidator(), validate, forgotPasswordRequest);
router.post("/reset-password/:token", passwordValidator(), validate, resetForgottenPassword);
router.post("/change-password", isLoggedIn, passwordValidator(), validate, changeCurrentPassword);
router.get("/profile", isLoggedIn, getCurrentUser);
router.get("/logout", isLoggedIn, logoutUser);

export default router;
