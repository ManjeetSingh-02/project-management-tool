import { body, param } from "express-validator";
import { AvailableUserRoles } from "../constants.js";

export const projectMemberValidator = () => {
  return [
    body("memberId").trim().isMongoId().withMessage("project member id is invalid"),
    body("role")
      .trim()
      .optional()
      .isIn(AvailableUserRoles)
      .withMessage("project member role should be either admin, project_admin or member"),
  ];
};

// function to check for project member id validation errors
export const projectMemberIdValidator = () => {
  return [param("memberId").trim().isMongoId().withMessage("project member id is invalid")];
};

// function to check for project member role validation errors
export const projectMemberRoleValidator = () => {
  return [
    body("role")
      .trim()
      .notEmpty()
      .withMessage("project member role is required")
      .isIn(AvailableUserRoles)
      .withMessage("project member role should be either admin, project_admin or member"),
  ];
};
