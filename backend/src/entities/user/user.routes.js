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
  verifyEmail,
} from "./user.controllers.js";
import { validate } from "../../utils/validator/index.js";
import { userRegistrationValidator, userLoginValidator } from "../../utils/validator/validators.js";

const router = Router();

router.post("/register", userRegistrationValidator(), validate, registerUser);

export default router;
