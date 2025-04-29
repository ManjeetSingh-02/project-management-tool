import express from "express";
import { healthCheckRouter, noteRouter, projectRouter } from "./entities/index.js";

const app = express();

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/notes", noteRouter);
app.use("/api/v1/projects", projectRouter);

export default app;
