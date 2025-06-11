import { asyncHandler } from "../../../utils/async-handler.js";
import { APIError } from "../../../utils/api/apiError.js";
import { APIResponse } from "../../../utils/api/apiResponse.js";
import { Task } from "./task.models.js";
import { User } from "../../user/user.models.js";
import { SubTask } from "./subtask/subtask.models.js";
import { UserRolesEnum } from "../../../utils/constants.js";

export const getTasks = asyncHandler(async (req, res) => {
  // get projectId from params
  const { projectId } = req.params;

  // get all tasks for the project
  const allTasks =
    req.user.role === UserRolesEnum.ADMIN || req.user.role === UserRolesEnum.MANAGER
      ? await Task.find({ project: projectId })
          .select("-__v")
          .populate("project", "_id name")
          .populate("assignedTo", "_id username email")
          .populate("assignedBy", "_id username email")
      : await Task.find({
          project: projectId,
          $or: [{ assignedTo: req.user.id }, { assignedBy: req.user.id }],
        })
          .select("-__v")
          .populate("project", "_id name")
          .populate("assignedTo", "_id username email")
          .populate("assignedBy", "_id username email");

  // success status to user
  return res.status(200).json(new APIResponse(200, "Tasks fetched successfully", allTasks));
});

export const getTaskById = asyncHandler(async (req, res) => {
  // get projectId and taskId from params
  const { projectId, taskId } = req.params;

  // check if task exists for the project
  const existingTask =
    req.user.role === UserRolesEnum.ADMIN || req.user.role === UserRolesEnum.MANAGER
      ? await Task.findOne({ project: projectId, _id: taskId })
          .select("-__v")
          .populate("project", "_id name")
          .populate("assignedTo", "_id username email")
          .populate("assignedBy", "_id username email")
      : await Task.findOne({
          project: projectId,
          _id: taskId,
          $or: [{ assignedTo: req.user.id }, { assignedBy: req.user.id }],
        })
          .select("-__v")
          .populate("project", "_id name")
          .populate("assignedTo", "_id username email")
          .populate("assignedBy", "_id username email");
  if (!existingTask) throw new APIError(400, "Get Task Error", "Task not found");

  // success status to user
  return res.status(200).json(new APIResponse(200, "Task fetched successfully", existingTask));
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
  });
  if (existingTask)
    throw new APIError(400, "Create Task Error", "Task already exists for this project");

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

export const updateTask = asyncHandler(async (req, res) => {
  // get projectId and taskId from params
  const { projectId, taskId } = req.params;

  // get task status from body
  const { status } = req.body;

  // update task status
  const updatedTask = await Task.findOneAndUpdate(
    {
      project: projectId,
      _id: taskId,
    },
    { status },
    { new: true },
  );
  if (!updatedTask)
    throw new APIError(400, "Update Task Error", "Something went wrong while updating task");

  // success status to user
  return res.status(200).json(
    new APIResponse(200, "Task updated successfully", {
      task: {
        _id: updatedTask._id,
        status: updatedTask.status,
        updatedAt: updatedTask.updatedAt,
      },
    }),
  );
});

export const deleteTask = asyncHandler(async (req, res) => {
  // get projectId and taskId from params
  const { projectId, taskId } = req.params;

  // delete task subtasks from db
  await SubTask.deleteMany({
    task: taskId,
  });

  // delete task
  await Task.findOneAndDelete({
    project: projectId,
    _id: taskId,
  });

  // success status to user
  return res.status(200).json(new APIResponse(200, "Task deleted successfully"));
});
