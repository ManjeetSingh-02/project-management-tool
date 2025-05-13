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
import { isLoggedIn } from "../../utils/route-protector.js";

const router = Router();

router.get("/", isLoggedIn, getProjects);
router.get("/:id", isLoggedIn, projectIdValidator(), validate, getProjectById);
router.post("/", isLoggedIn, projectValidator(), validate, createProject);
router.patch("/:id", isLoggedIn, projectIdValidator(), projectValidator(), validate, updateProject);
router.delete("/:id", isLoggedIn, projectIdValidator(), validate, deleteProject);

router.get("/:id/members", isLoggedIn, projectIdValidator(), validate, getProjectMembers);
router.post(
  "/:id/members",
  isLoggedIn,
  projectIdValidator(),
  projectMemberValidator(),
  validate,
  addMemberToProject,
);
router.patch(
  "/:id/members/:memberId",
  isLoggedIn,
  projectIdValidator(),
  projectMemberIdValidator(),
  projectMemberRoleValidator(),
  validate,
  updateMemberRole,
);
router.delete(
  "/:id/members/:memberId",
  isLoggedIn,
  projectIdValidator(),
  projectMemberIdValidator(),
  validate,
  deleteMemberFromProject,
);

export default router;
