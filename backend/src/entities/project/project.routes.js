import { Router } from "express";
import { validate } from "../../utils/validator/index.js";
import { isLoggedIn, hasRolePermission } from "../../utils/route-protector.js";
import { UserRolesEnum } from "../../utils/constants.js";

// project validators
import { projectValidator, projectIdValidator } from "../../utils/validator/project.validators.js";

// project members validators
import {
  projectMemberIdValidator,
  projectMemberValidator,
  projectMemberRoleValidator,
} from "../../utils/validator/projectmember.validators.js";

// project notes validators
import { projectNoteIdValidator } from "../../utils/validator/note.validators.js";

// project controllers
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "./project.controllers.js";

// project members controllers
import {
  getProjectMembers,
  addMemberToProject,
  deleteMemberFromProject,
  updateMemberRole,
} from "./projectmember/projectmember.controllers.js";

// project notes controllers
import { getNotes, getNoteById } from "./note/note.controllers.js";

const router = Router();

// Project routes
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

// Project members routes
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

// Project notes routes
router.get(
  "/:id/notes",
  isLoggedIn,
  projectIdValidator(),
  validate,
  hasRolePermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN, UserRolesEnum.MEMBER]),
  getNotes,
);

router.get(
  "/:id/notes/:noteId",
  isLoggedIn,
  projectIdValidator(),
  projectNoteIdValidator(),
  validate,
  hasRolePermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN, UserRolesEnum.MEMBER]),
  getNoteById,
);

export default router;
