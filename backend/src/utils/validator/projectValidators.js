import { body, param } from "express-validator";
import { AvailableUserRoles } from "../constants.js";

// function to check for project creation validation errors
export const projectValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("project name is required")
      .isLength({ min: 3 })
      .withMessage("project name should be atleast 3 chars")
      .isLength({ max: 13 })
      .withMessage("project name should not be more than 13 chars"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("project description is required")
      .isLength({ min: 10 })
      .withMessage("project description should be atleast 10 chars")
      .isLength({ max: 100 })
      .withMessage("project description should not be more than 100 chars"),
  ];
};

// function to check for project id validation errors
export const projectIdValidator = () => {
  return [param("id").trim().isMongoId().withMessage("project id is invalid")];
};

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
