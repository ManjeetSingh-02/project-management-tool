import { asyncHandler } from "../../utils/async-handler.js";
import { User } from "./user.models.js";
import { APIError } from "../../utils/api/apiError.js";
import { APIResponse } from "../../utils/api/apiResponse.js";
import { sendMail } from "../../utils/mail/index.js";
import {
  verificationMailContentGenerator,
  forgotPasswordMailContentGenerator,
} from "../../utils/mail/mailGenContent.js";
import ms from "ms";
import jwt from "jsonwebtoken";

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

export const loginUser = asyncHandler(async (req, res) => {
  // get data
  const { email, password } = req.body;

  // check if user exists
  const existingUser = await User.findOne({ email });
  if (!existingUser) throw new APIError(400, "Login Error", "User doesn't exist");

  // check if password is correct
  const isPasswordCorrect = await existingUser.isPasswordCorrect(password);
  if (!isPasswordCorrect) throw new APIError(400, "Login Error", "Invalid credentials");

  // check if user is verified
  if (!existingUser.isEmailVerified) throw new APIError(400, "Login Error", "Email not verified");

  // generate access token
  const accessToken = existingUser.generateAccessToken();

  // generate refresh token
  const refreshToken = existingUser.generateRefreshToken();

  // store refresh token in db
  existingUser.refreshToken = refreshToken;

  // update user in db
  await existingUser.save({ validateBeforeSave: false });

  // success status to user, save accessToken and refreshToken into cookies
  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: ms(process.env.ACCESS_TOKEN_EXPIRY),
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: ms(process.env.REFRESH_TOKEN_EXPIRY),
    })
    .json(new APIResponse(200, "Login Successful"));
});

export const logoutUser = asyncHandler(async (req, res) => {
  // get user from request
  const { id } = req.user;

  // get user from db
  const existingUser = await User.findById(id);
  if (!existingUser) throw new APIError(400, "Logout Error", "User doesn't exist");

  // remove refresh token from db
  existingUser.refreshToken = undefined;

  // update user in db
  await existingUser.save({ validateBeforeSave: false });

  // success status to user, clear cookies
  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new APIResponse(200, "Logout Successful"));
});

export const verifyAccount = asyncHandler(async (req, res) => {
  // get token from params
  const { token } = req.params;

  // check if token is valid
  const existingUser = await User.findOne({ emailVerificationToken: token });
  if (!existingUser) throw new APIError(400, "Verification Error", "Invalid token");

  // check if token is expired
  const isTokenExpired = existingUser.emailVerificationExpiry < Date.now();
  if (isTokenExpired)
    throw new APIError(
      400,
      "Verification Error",
      "Token expired, please resend the verification email",
    );

  // mark the user verified and remove the token and its expiry
  existingUser.isEmailVerified = true;
  existingUser.emailVerificationToken = undefined;
  existingUser.emailVerificationExpiry = undefined;

  // update user in db
  await existingUser.save();

  // success status to user
  return res.status(200).json(new APIResponse(200, "Email verified successfully"));
});

export const resendEmailVerification = asyncHandler(async (req, res) => {
  // get email
  const { email } = req.body;

  // check if user exists
  const existingUser = await User.findOne({ email });
  if (!existingUser) throw new APIError(400, "Verification Error", "User doesn't exist");

  // check if user is verified
  if (existingUser.isEmailVerified)
    throw new APIError(400, "Verification Error", "User already verified");

  // generate new email verification token
  const { token, tokenExpiry } = existingUser.generateTemporaryToken();

  // store in db
  existingUser.emailVerificationToken = token;
  existingUser.emailVerificationExpiry = tokenExpiry;

  // update user in db
  await existingUser.save();

  // send to user in email
  await sendMail({
    email: existingUser.email,
    subject: "Verify your account - Project Management Tool",
    mailGenContent: verificationMailContentGenerator(existingUser.username, token),
  });

  // success status to user
  return res.status(200).json(new APIResponse(200, "Verification Mail sent successfully"));
});

export const forgotPasswordRequest = asyncHandler(async (req, res) => {
  // get email
  const { email } = req.body;

  // check if user exists
  const existingUser = await User.findOne({ email });
  if (!existingUser) throw new APIError(400, "Forgot Password Request Error", "User doesn't exist");

  // generate new password reset token
  const { token, tokenExpiry } = existingUser.generateTemporaryToken();

  // store in db
  existingUser.forgotPasswordToken = token;
  existingUser.forgotPasswordExpiry = tokenExpiry;

  // update user in db
  await existingUser.save();

  // send to user in email
  await sendMail({
    email: existingUser.email,
    subject: "Reset Your Password - Project Management Tool",
    mailGenContent: forgotPasswordMailContentGenerator(existingUser.username, token),
  });

  // success status to user
  return res.status(200).json(new APIResponse(200, "Password reset mail sent successfully"));
});

export const resetForgottenPassword = asyncHandler(async (req, res) => {
  // get token from params
  const { token } = req.params;

  // get new password
  const { newPassword } = req.body;

  // check if token is valid
  const existingUser = await User.findOne({ forgotPasswordToken: token });
  if (!existingUser) throw new APIError(400, "Reset Password Error", "Invalid token");

  // check if token is expired
  const isTokenExpired = existingUser.forgotPasswordExpiry < Date.now();
  if (isTokenExpired)
    throw new APIError(400, "Reset Password Error", "Token expired, please request again");

  // check if password is same as old password
  const isSamePassword = await existingUser.isPasswordCorrect(newPassword);
  if (isSamePassword)
    throw new APIError(400, "Reset Password Error", "New password cannot be same as old password");

  // update password
  existingUser.password = newPassword;

  // remove the token and its expiry
  existingUser.forgotPasswordToken = undefined;
  existingUser.forgotPasswordExpiry = undefined;

  // update user in db
  await existingUser.save();

  // success status to user
  return res.status(200).json(new APIResponse(200, "Password reset successfully"));
});

export const changeCurrentPassword = asyncHandler(async (req, res) => {
  // get user from request
  const { id } = req.user;

  // check if user exists
  const existingUser = await User.findById(id);
  if (!existingUser) throw new APIError(400, "Change Password Error", "User doesn't exist");

  // get old password and new password
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    throw new APIError(400, "Change Password Error", "Please provide both old and new password");

  // check if old password is correct
  const isOldPasswordCorrect = await existingUser.isPasswordCorrect(oldPassword);
  if (!isOldPasswordCorrect)
    throw new APIError(400, "Change Password Error", "Old password is incorrect");

  // check if new password is same as old password
  const isSamePassword = await existingUser.isPasswordCorrect(newPassword);
  if (isSamePassword)
    throw new APIError(400, "Change Password Error", "New password cannot be same as old password");

  // update password
  existingUser.password = newPassword;

  // update user in db
  await existingUser.save();

  // success status to user
  return res.status(200).json(new APIResponse(200, "Password changed successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  // get user from request
  const { id } = req.user;

  // get user from db
  const existingUser = await User.findById(id);

  // success status to user
  return res.status(200).json(
    new APIResponse(200, "User fetched successfully", {
      id: existingUser._id,
      username: existingUser.username,
      email: existingUser.email,
      fullname: existingUser.fullname,
      avatar: existingUser.avatar,
    }),
  );
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  // get refresh token from cookies
  const { refreshToken } = req.cookies;
  if (!refreshToken) throw new APIError(400, "Authentication Error", "Unauthorized");

  // decode refresh token
  const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  // check if user exists
  const existingUser = await User.findById(decodedToken?.id);
  if (!existingUser) throw new APIError(400, "Authentication Error", "Invalid Refresh Token");

  // check if refresh token is valid
  if (existingUser.refreshToken !== refreshToken)
    throw new APIError(400, "Authentication Error", "Invalid Refresh Token");

  // generate access token
  const accessToken = existingUser.generateAccessToken();

  // generate refresh token
  const newRefreshToken = existingUser.generateRefreshToken();

  // store refresh token in db
  existingUser.refreshToken = newRefreshToken;

  // update user in db
  await existingUser.save({ validateBeforeSave: false });

  // success status to user, save accessToken and refreshToken into cookies
  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: ms(process.env.ACCESS_TOKEN_EXPIRY),
    })
    .cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: ms(process.env.REFRESH_TOKEN_EXPIRY),
    })
    .json(
      new APIResponse(200, "Access Token refreshed successfully", { accessToken, newRefreshToken }),
    );
});
