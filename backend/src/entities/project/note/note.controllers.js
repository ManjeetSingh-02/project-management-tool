import { asyncHandler } from "../../../utils/async-handler.js";
import { APIError } from "../../../utils/api/apiError.js";
import { APIResponse } from "../../../utils/api/apiResponse.js";
import { ProjectNote } from "./note.models.js";

export const getNotes = asyncHandler(async (req, res) => {
  // get id from params
  const { id } = req.params;

  // get all project notes
  const allNotes = await ProjectNote.find({ project: id }).select("-createdAt -updatedAt -__v");
  if (!allNotes.length)
    throw new APIError(400, "Get All Notes Error", "No notes found for this project");

  // success status to user
  return res.status(200).json(new APIResponse(200, "Notes fetched successfully", allNotes));
});

export const getNoteById = async (req, res) => {};

export const createNote = async (req, res) => {};

export const updateNote = async (req, res) => {};

export const deleteNote = async (req, res) => {};
