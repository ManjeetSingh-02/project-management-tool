import { Router } from "express";
import { createProject, getProjects, getProjectById } from "./project.controllers.js";
import { projectCreationValidator } from "../../utils/validator/projectValidators.js";
import { validate } from "../../utils/validator/index.js";
import { isLoggedIn } from "../../utils/route-protector.js";

const router = Router();

router.post("/create", isLoggedIn, projectCreationValidator(), validate, createProject);
router.get("/getprojects", isLoggedIn, getProjects);
router.get("/getprojects/:id", isLoggedIn, getProjectById);

export default router;
