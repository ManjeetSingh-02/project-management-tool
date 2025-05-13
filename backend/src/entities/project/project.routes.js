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
import { projectCreationValidator } from "../../utils/validator/projectValidators.js";
import { validate } from "../../utils/validator/index.js";
import { isLoggedIn } from "../../utils/route-protector.js";

const router = Router();

router.get("/", isLoggedIn, getProjects);
router.get("/:id", isLoggedIn, getProjectById);
router.post("/", isLoggedIn, projectCreationValidator(), validate, createProject);
router.patch("/:id", isLoggedIn, projectCreationValidator(), validate, updateProject);
router.delete("/:id", isLoggedIn, deleteProject);
router.get("/:id/members", isLoggedIn, getProjectMembers);
router.post("/:id/members", isLoggedIn, addMemberToProject);
router.patch("/:id/members/:memberId", isLoggedIn, updateMemberRole);
router.delete("/:id/members/:memberId", isLoggedIn, deleteMemberFromProject);

export default router;
