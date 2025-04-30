import express from "express";
import {
  healthCheckRouter,
  noteRouter,
  projectRouter,
  taskRouter,
  userRouter,
} from "./entities/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// file path for .env file
dotenv.config({ path: "./.env" });

// create new express app
const app = express();

// middleware for usage of cookies
app.use(cookieParser());

// middleware for CORS configuration
app.use(
  cors({
    origin: process.env.ORIGIN_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Set-Cookie", "*"],
  }),
);

// middleware for handling JSON data
app.use(express.json());

// middleware for handling URL-encoded data
app.use(express.urlencoded({ extended: true }));

// middleware for serving static files
app.use(express.static("public"));

// middlewares for handling API routes
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/notes", noteRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/users", userRouter);

export default app;
