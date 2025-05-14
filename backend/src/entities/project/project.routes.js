import { Router } from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectMembers,
  addMemberToProject,
  deleteMemberFromProject,
  updateMemberRole,
} from "./project.controllers.js";
import {
  projectValidator,
  projectIdValidator,
  projectMemberIdValidator,
  projectMemberValidator,
  projectMemberRoleValidator,
} from "../../utils/validator/projectValidators.js";
import { validate } from "../../utils/validator/index.js";
import { isLoggedIn, hasRolePermission } from "../../utils/route-protector.js";
import { UserRolesEnum } from "../../utils/constants.js";

const router = Router();

router.get("/", isLoggedIn, getProjects);
router.get(
  "/:id",
  isLoggedIn,
  projectIdValidator(),
  validate,
  hasRolePermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN, UserRolesEnum.MEMBER]),
  getProjectById,
);
router.post("/", isLoggedIn, projectValidator(), validate, createProject);
router.patch(
  "/:id",
  isLoggedIn,
  projectIdValidator(),
  projectValidator(),
  validate,
  hasRolePermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
  updateProject,
);
router.delete(
  "/:id",
  isLoggedIn,
  projectIdValidator(),
  validate,
  hasRolePermission([UserRolesEnum.ADMIN]),
  deleteProject,
);

router.get(
  "/:id/members",
  isLoggedIn,
  projectIdValidator(),
  validate,
  hasRolePermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
  getProjectMembers,
);
router.post(
  "/:id/members",
  isLoggedIn,
  projectIdValidator(),
  projectMemberValidator(),
  validate,
  hasRolePermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
  addMemberToProject,
);
router.patch(
  "/:id/members/:memberId",
  isLoggedIn,
  projectIdValidator(),
  projectMemberIdValidator(),
  projectMemberRoleValidator(),
  validate,
  hasRolePermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
  updateMemberRole,
);
router.delete(
  "/:id/members/:memberId",
  isLoggedIn,
  projectIdValidator(),
  projectMemberIdValidator(),
  validate,
  hasRolePermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
  deleteMemberFromProject,
);

export default router;
