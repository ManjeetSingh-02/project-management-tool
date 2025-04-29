import express from "express";
import { healthCheckRouter, noteRouter } from "./entities/index.js";

const app = express();

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/notes", noteRouter);

export default app;
