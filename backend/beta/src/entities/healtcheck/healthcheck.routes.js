import { Router } from "express";
import { healthCheck } from "./healthcheck.controllers.js";

const router = Router();

router.get("/", healthCheck);

export default router;
