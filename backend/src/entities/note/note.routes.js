import { Router } from "express";
import { getNotes } from "./note.controllers.js";
import { projectIdValidator } from "../../utils/validator/projectValidators.js";
import { validate } from "../../utils/validator/index.js";
import { isLoggedIn, hasRolePermission } from "../../utils/route-protector.js";
import { UserRolesEnum } from "../../utils/constants.js";

const router = Router();

router.get(
  "/",
  isLoggedIn,
  projectIdValidator(),
  validate,
  hasRolePermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN, UserRolesEnum.MEMBER]),
  getNotes,
);

export default router;
