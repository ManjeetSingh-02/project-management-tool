import { asyncHandler } from "../../../../utils/async-handler.js";
import { APIError } from "../../../../utils/api/apiError.js";
import { APIResponse } from "../../../../utils/api/apiResponse.js";
import { SubTask } from "./subtask.models.js";

export const getSubTasks = asyncHandler(async (req, res) => {
  // get taskId from params
  const { taskId } = req.params;

  // get all subtasks for the task
  const allSubTasks = await SubTask.find({
    task: taskId,
  });

  // success status to user
  return res.status(200).json(new APIResponse(200, "SubTasks fetched successfully", allSubTasks));
});

export const createSubTask = async (req, res) => {};

export const updateSubTask = async (req, res) => {};

export const deleteSubTask = async (req, res) => {};
