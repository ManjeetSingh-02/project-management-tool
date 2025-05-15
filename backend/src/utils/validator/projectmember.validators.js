import { body, param } from "express-validator";
import { UserRolesEnum } from "../constants.js";

export const projectMemberValidator = () => {
  return [
    body("memberId").trim().isMongoId().withMessage("project member id is invalid"),
    body("role")
      .trim()
      .optional()
      .isIn([UserRolesEnum.MANAGER, UserRolesEnum.MEMBER])
      .withMessage("project member role should be either manager or member"),
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
      .isIn([UserRolesEnum.MANAGER, UserRolesEnum.MEMBER])
      .withMessage("project member role should be either manager or member"),
  ];
};
