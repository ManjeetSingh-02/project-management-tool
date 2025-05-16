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

// function for checking if user has required role
export const hasRequiredRole = roles =>
  asyncHandler(async (req, _, next) => {
    // get projectId from params
    const { projectId } = req.params;

    // check if project member exists
    const existingMember = await ProjectMember.findOne({ user: req.user.id, project: projectId });
    if (!existingMember) throw new APIError(400, "Security Error", "Invalid Project Id");

    // check if user has permission
    if (!roles.includes(existingMember.role))
      throw new APIError(403, "Security Error", "Access Denied for not having required role");

    // set user role in request object
    req.user.role = existingMember.role;

    // forward request to next middleware
    next();
  });

// function for role based access control
export const hasRequiredAccess = roles =>
  asyncHandler(async (req, _, next) => {
    // get action role from request
    const { role } = req.body;

    // check if user current role has permission to perform action
    if (roles[req.user.role] === undefined || !roles[req.user.role].includes(role))
      throw new APIError(403, "Security Error", "Access Denied for not having required perms");

    // forward request to next middleware
    next();
  });

// function to add the user role into request for projectmemberdeletion
export const addUserRoleToReqObj = asyncHandler(async (req, _, next) => {
  // get id and member id from params
  const { projectId, memberId } = req.params;

  // check if project member exists
  const existingMember = await ProjectMember.findOne({
    user: memberId,
    project: projectId,
  });
  if (!existingMember) throw new APIError(400, "Security Error", "Invalid Project Id");

  // add user role to request body for project member deletion
  req.body.role = existingMember.role;

  // forward request to next middleware
  next();
});
