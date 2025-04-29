import express from "express";
import {
  healthCheckRouter,
  noteRouter,
  projectRouter,
  taskRouter,
  userRouter,
} from "./entities/index.js";

// create new express app
const app = express();

// middlewares for API routes
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/notes", noteRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/users", userRouter);

export default app;
