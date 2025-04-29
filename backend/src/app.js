import express from "express";
import { healthCheckRouter } from "./entities/index.js";

const app = express();

app.use("/api/v1/healthcheck", healthCheckRouter);

export default app;
