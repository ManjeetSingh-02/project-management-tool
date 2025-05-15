import { APIError } from "./api/apiError.js";
import { asyncHandler } from "./async-handler.js";
import jwt from "jsonwebtoken";
import { User } from "../entities/user/user.models.js";
import { ProjectMember } from "../entities/project/projectmember/projectmember.models.js";

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

// function for role based access control
export const hasRolePermission = (roles = []) =>
  asyncHandler(async (req, _, next) => {
    // get id from params
    const { id } = req.params;

    // check if project member exists
    const existingMember = await ProjectMember.findOne({ user: req.user.id, project: id });
    if (!existingMember) throw new APIError(400, "Security Error", "Invalid Project Id");

    // check if user has permission
    if (!roles.includes(existingMember.role))
      throw new APIError(403, "Security Error", "Access Denied for this action");

    // set user role in request object
    req.user.role = existingMember.role;

    // forward request to next middleware
    next();
  });
