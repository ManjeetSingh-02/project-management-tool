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

export const createSubTask = asyncHandler(async (req, res) => {
  // get taskId from params
  const { taskId } = req.params;

  // get subtask title from body
  const { title } = req.body;

  // check if subtask with same title already exists
  const existingSubTask = await SubTask.findOne({
    title,
    task: taskId,
  });
  if (existingSubTask)
    throw new APIError(400, "Create SubTask Error", "SubTask already exists for this project");

  // create subtask
  const newSubTask = await SubTask.create({
    title,
    task: taskId,
    createdBy: req.user.id,
  });
  if (!newSubTask)
    throw new APIError(400, "Create SubTask Error", "Something went wrong while creating subtask");

  // success status to user
  return res.status(201).json(
    new APIResponse(201, "SubTask created successfully", {
      subtask: {
        id: newSubTask._id,
        title: newSubTask.title,
        isCompleted: newSubTask.isCompleted,
        createdAt: newSubTask.createdAt,
      },
    }),
  );
});

export const updateSubTask = async (req, res) => {};

export const deleteSubTask = async (req, res) => {};
