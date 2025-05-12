import { Router } from "express";
import { createProject } from "./project.controllers.js";
import { projectCreationValidator } from "../../utils/validator/projectValidators.js";
import { validate } from "../../utils/validator/index.js";
import { isLoggedIn } from "../../utils/route-protector.js";

const router = Router();

router.post("/create", isLoggedIn, projectCreationValidator(), validate, createProject);

export default router;
