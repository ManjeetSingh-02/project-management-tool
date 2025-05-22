import { Router } from "express";
import { validate } from "../../utils/validator/index.js";
import {
  isLoggedIn,
  hasRequiredRole,
  hasRequiredAccess,
  addUserRoleToReqObj,
  validateUserAccess,
  validateTaskAccess,
} from "../../utils/route-protector.js";
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
import {
  projectNoteIdValidator,
  projectNoteValidator,
} from "../../utils/validator/note.validators.js";

// project tasks validators
import {
  taskIdValidator,
  taskStatusValidator,
  taskValidator,
} from "../../utils/validator/task.validators.js";

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
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from "./note/note.controllers.js";

// project tasks controllers
import { getTaskById, getTasks, createTask, updateTask } from "./task/task.controllers.js";

const router = Router();

// Project routes
router.get("/", isLoggedIn, getProjects);
router.get(
  "/:projectId",
  isLoggedIn,
  projectIdValidator(),
  validate,
  hasRequiredRole([UserRolesEnum.ADMIN, UserRolesEnum.MANAGER, UserRolesEnum.MEMBER]),
  getProjectById,
);
router.post("/", isLoggedIn, projectValidator(), validate, createProject);
router.patch(
  "/:projectId",
  isLoggedIn,
  projectIdValidator(),
  projectValidator(),
  validate,
  hasRequiredRole([UserRolesEnum.ADMIN]),
  updateProject,
);
router.delete(
  "/:projectId",
  isLoggedIn,
  projectIdValidator(),
  validate,
  hasRequiredRole([UserRolesEnum.ADMIN]),
  deleteProject,
);

// Project members routes
router.get(
  "/:projectId/members",
  isLoggedIn,
  projectIdValidator(),
  validate,
  hasRequiredRole([UserRolesEnum.ADMIN, UserRolesEnum.MANAGER]),
  getProjectMembers,
);
router.post(
  "/:projectId/members",
  isLoggedIn,
  projectIdValidator(),
  projectMemberValidator(),
  validate,
  hasRequiredRole([UserRolesEnum.ADMIN, UserRolesEnum.MANAGER]),
  hasRequiredAccess({
    [UserRolesEnum.ADMIN]: [UserRolesEnum.MANAGER, UserRolesEnum.MEMBER],
    [UserRolesEnum.MANAGER]: [UserRolesEnum.MEMBER],
  }),
  addMemberToProject,
);
router.patch(
  "/:projectId/members/:memberId",
  isLoggedIn,
  projectIdValidator(),
  projectMemberIdValidator(),
  projectMemberRoleValidator(),
  validate,
  hasRequiredRole([UserRolesEnum.ADMIN]),
  hasRequiredAccess({
    [UserRolesEnum.ADMIN]: [UserRolesEnum.MANAGER, UserRolesEnum.MEMBER],
  }),
  updateMemberRole,
);
router.delete(
  "/:projectId/members/:memberId",
  isLoggedIn,
  projectIdValidator(),
  projectMemberIdValidator(),
  validate,
  hasRequiredRole([UserRolesEnum.ADMIN, UserRolesEnum.MANAGER]),
  addUserRoleToReqObj,
  hasRequiredAccess({
    [UserRolesEnum.ADMIN]: [UserRolesEnum.MANAGER, UserRolesEnum.MEMBER],
    [UserRolesEnum.MANAGER]: [UserRolesEnum.MEMBER],
  }),
  deleteMemberFromProject,
);

// Project notes routes
router.get(
  "/:projectId/notes",
  isLoggedIn,
  projectIdValidator(),
  validate,
  hasRequiredRole([UserRolesEnum.ADMIN, UserRolesEnum.MANAGER, UserRolesEnum.MEMBER]),
  getNotes,
);
router.get(
  "/:projectId/notes/:noteId",
  isLoggedIn,
  projectIdValidator(),
  projectNoteIdValidator(),
  validate,
  hasRequiredRole([UserRolesEnum.ADMIN, UserRolesEnum.MANAGER, UserRolesEnum.MEMBER]),
  getNoteById,
);
router.post(
  "/:projectId/notes",
  isLoggedIn,
  projectIdValidator(),
  projectNoteValidator(),
  validate,
  hasRequiredRole([UserRolesEnum.ADMIN, UserRolesEnum.MANAGER, UserRolesEnum.MEMBER]),
  createNote,
);
router.patch(
  "/:projectId/notes/:noteId",
  isLoggedIn,
  projectIdValidator(),
  projectNoteIdValidator(),
  projectNoteValidator(),
  validate,
  hasRequiredRole([UserRolesEnum.ADMIN, UserRolesEnum.MANAGER, UserRolesEnum.MEMBER]),
  updateNote,
);
router.delete(
  "/:projectId/notes/:noteId",
  isLoggedIn,
  projectIdValidator(),
  projectNoteIdValidator(),
  validate,
  hasRequiredRole([UserRolesEnum.ADMIN, UserRolesEnum.MANAGER, UserRolesEnum.MEMBER]),
  deleteNote,
);

// project tasks routes
router.get(
  "/:projectId/tasks",
  isLoggedIn,
  projectIdValidator(),
  validate,
  hasRequiredRole([UserRolesEnum.ADMIN, UserRolesEnum.MANAGER, UserRolesEnum.MEMBER]),
  getTasks,
);
router.get(
  "/:projectId/tasks/:taskId",
  isLoggedIn,
  projectIdValidator(),
  taskIdValidator(),
  validate,
  hasRequiredRole([UserRolesEnum.ADMIN, UserRolesEnum.MANAGER, UserRolesEnum.MEMBER]),
  getTaskById,
);
router.post(
  "/:projectId/tasks",
  isLoggedIn,
  projectIdValidator(),
  taskValidator(),
  validate,
  hasRequiredRole([UserRolesEnum.ADMIN, UserRolesEnum.MANAGER]),
  validateUserAccess({
    [UserRolesEnum.ADMIN]: [UserRolesEnum.ADMIN, UserRolesEnum.MANAGER, UserRolesEnum.MEMBER],
    [UserRolesEnum.MANAGER]: [UserRolesEnum.MANAGER, UserRolesEnum.MEMBER],
  }),
  createTask,
);
router.patch(
  "/:projectId/tasks/:taskId",
  isLoggedIn,
  projectIdValidator(),
  taskIdValidator(),
  taskStatusValidator(),
  validate,
  hasRequiredRole([UserRolesEnum.ADMIN, UserRolesEnum.MANAGER]),
  validateTaskAccess,
  updateTask,
);

export default router;
