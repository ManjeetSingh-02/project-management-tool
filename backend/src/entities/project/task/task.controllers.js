import { asyncHandler } from "../../../utils/async-handler.js";
import { APIError } from "../../../utils/api/apiError.js";
import { APIResponse } from "../../../utils/api/apiResponse.js";
import { Task } from "./task.models.js";
import { User } from "../../user/user.models.js";

export const getTasks = asyncHandler(async (req, res) => {
  // get projectId from params
  const { projectId } = req.params;

  // get all the tasks assigned to the project for the user
  const allTasks = await Task.find({
    project: projectId,
    assignedTo: req.user.id,
  })
    .select("-__v")
    .populate("project", "_id name")
    .populate("assignedTo", "_id username email")
    .populate("assignedBy", "_id username email");

  return res.status(200).json(new APIResponse(200, "Tasks fetched successfully", allTasks));
});

export const getTaskById = asyncHandler(async (req, res) => {
  // get projectId and taskId from params
  const { projectId, taskId } = req.params;

  // get the task assigned to the project for the user
  const existingTask = await Task.findOne({
    project: projectId,
    _id: taskId,
    assignedTo: req.user.id,
  })
    .select("-__v")
    .populate("project", "_id name")
    .populate("assignedTo", "_id username email")
    .populate("assignedBy", "_id username email");
  if (!existingTask) throw new APIError(404, "Get Task Error", "Task not found");

  return res.status(200).json(new APIResponse(200, "Tasks fetched successfully", existingTask));
});

export const createTask = asyncHandler(async (req, res) => {
  // get projectId from params
  const { projectId } = req.params;

  // get task details from body
  const { title, description, assignedTo, attachments } = req.body;

  // check if task already exists for same project and user
  const existingTask = await Task.findOne({
    project: projectId,
    title,
    assignedTo,
  });
  if (existingTask)
    throw new APIError(
      400,
      "Create Task Error",
      "Task already exists for this project and already assigned to same user",
    );

  // create a new task
  const newTask = await Task.create({
    title,
    description,
    project: projectId,
    assignedTo,
    assignedBy: req.user.id,
    attachments,
  });
  if (!newTask)
    throw new APIError(500, "Create Task Error", "Something went wrong while creating task");

  const existingUser = await User.findById(assignedTo);
  if (!existingUser) throw new APIError(404, "Create Task Error", "Assigned user not found");

  // success status to user
  return res.status(201).json(
    new APIResponse(201, "Task created successfully", {
      task: {
        _id: newTask._id,
        title: newTask.title,
        description: newTask.description,
        assignedTo: {
          _id: existingUser._id,
          username: existingUser.username,
          email: existingUser.email,
        },
        status: newTask.status,
        createdAt: newTask.createdAt,
        updatedAt: newTask.updatedAt,
      },
    }),
  );
});

export const updateTask = async (req, res) => {};

export const deleteTask = async (req, res) => {};
