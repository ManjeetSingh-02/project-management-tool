import { APIError } from "./api/apiError.js";
import { asyncHandler } from "./async-handler.js";
import jwt from "jsonwebtoken";
import { User } from "../entities/user/user.models.js";

// function to check for any validation errors
export const isLoggedIn = asyncHandler(async (req, _, next) => {
  // get access token
  const accessToken = req.cookies.accessToken;
  if (!accessToken) throw new APIError(401, "Security Error", "Unauthorized");

  // decode access token
  const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

  // check if user exists
  const loggedInUser = await User.findById(decodedToken?.id);
  if (!loggedInUser) throw new APIError(400, "Security Error", "Invalid Access Token");

  // set user in request object
  req.user = {
    id: loggedInUser._id,
    email: loggedInUser.email,
  };

  // forward request to next middleware
  next();
});
