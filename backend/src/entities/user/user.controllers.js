import { asyncHandler } from "../../utils/async-handler.js";
import { User } from "./user.models.js";
import { APIError } from "../../utils/api/apiError.js";
import { APIResponse } from "../../utils/api/apiResponse.js";
import { sendMail } from "../../utils/mail/index.js";
import { verificationMailContentGenerator } from "../../utils/mail/mailGenContent.js";

export const registerUser = asyncHandler(async (req, res) => {
  // get data
  const { username, email, password, fullname } = req.body;

  // check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new APIError(400, "Registration Error", "User already exists");

  // create user in db
  const newUser = await User.create({ username, email, fullname, password });
  if (!newUser) throw new APIError(400, "Registration Error", "Error creating user");

  // generate email verification token
  const { token, tokenExpiry } = newUser.generateTemporaryToken();

  // store in db
  newUser.emailVerificationToken = token;
  newUser.emailVerificationExpiry = tokenExpiry;

  // update user in db
  await newUser.save();

  // send to user in email
  await sendMail({
    email: newUser.email,
    subject: "Verify your account - Project Management Tool",
    mailGenContent: verificationMailContentGenerator(newUser.username, token),
  });

  // success status to user
  return res.status(201).json(new APIResponse(201, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {});

export const logoutUser = asyncHandler(async (req, res) => {});

export const verifyEmail = asyncHandler(async (req, res) => {});

export const resendEmailVerification = asyncHandler(async (req, res) => {});

export const forgotPasswordRequest = asyncHandler(async (req, res) => {});

export const resetForgottenPassword = asyncHandler(async (req, res) => {});

export const changeCurrentPassword = asyncHandler(async (req, res) => {});

export const getCurrentUser = asyncHandler(async (req, res) => {});

export const refreshAccessToken = asyncHandler(async (req, res) => {});
