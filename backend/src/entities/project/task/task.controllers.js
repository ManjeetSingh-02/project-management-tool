import { asyncHandler } from "../../../utils/async-handler.js";
import { APIError } from "../../../utils/api/apiError.js";
import { APIResponse } from "../../../utils/api/apiResponse.js";
import { Task } from "./task.models.js";

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

export const getTaskById = async (req, res) => {};

export const createTask = async (req, res) => {};

export const updateTask = async (req, res) => {};

export const deleteTask = async (req, res) => {};
