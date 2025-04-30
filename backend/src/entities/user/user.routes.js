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
import { userRegistrationValidator, userLoginValidator } from "../../utils/validator/validators.js";

const router = Router();

router.post("/register", userRegistrationValidator(), validate, registerUser);
router.get("/verify-account/:token", verifyAccount);
router.post("/login", userLoginValidator(), validate, loginUser);

export default router;
