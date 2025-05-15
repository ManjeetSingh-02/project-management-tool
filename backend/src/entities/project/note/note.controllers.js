import { asyncHandler } from "../../../utils/async-handler.js";
import { APIError } from "../../../utils/api/apiError.js";
import { APIResponse } from "../../../utils/api/apiResponse.js";
import { ProjectNote } from "./note.models.js";
import { UserRolesEnum } from "../../../utils/constants.js";

export const getNotes = asyncHandler(async (req, res) => {
  // get id from params
  const { id } = req.params;

  // get all project notes
  const allNotes = await ProjectNote.find({ project: id })
    .select("-__v")
    .populate("createdBy", "username")
    .populate("project", "name");
  if (!allNotes.length)
    throw new APIError(400, "Get All Notes Error", "No notes found for this project");

  // success status to user
  return res.status(200).json(new APIResponse(200, "Notes fetched successfully", allNotes));
});

export const getNoteById = asyncHandler(async (req, res) => {
  // get id and noteId from params
  const { id, noteId } = req.params;

  // check if note exists
  const existingNote = await ProjectNote.findOne({ _id: noteId, project: id })
    .select("-__v")
    .populate("createdBy", "username")
    .populate("project", "name");
  if (!existingNote) throw new APIError(400, "Get Note Error", "Note not found");

  // success status to user
  return res.status(200).json(new APIResponse(200, "Note fetched successfully", existingNote));
});

export const createNote = asyncHandler(async (req, res) => {
  // get id from params
  const { id } = req.params;

  // get content from body
  const { content } = req.body;

  // check if note already exists by same user
  const existingNote = await ProjectNote.findOne({
    project: id,
    createdBy: req.user.id,
    content: content,
  });
  if (existingNote)
    throw new APIError(
      400,
      "Create Note Error",
      "Note already exists for this project by this user",
    );

  // create new note
  const newNote = await ProjectNote.create({
    project: id,
    createdBy: req.user.id,
    content,
  });
  if (!newNote) throw new APIError(400, "Create Note Error", "Note not created");

  // success status to user
  return res.status(201).json(new APIResponse(201, "Note created successfully", newNote));
});

export const updateNote = asyncHandler(async (req, res) => {
  // get id and noteId from params
  const { id, noteId } = req.params;

  // get content from body
  const { content } = req.body;

  // update note
  const updatedNote = await ProjectNote.findOneAndUpdate(
    {
      _id: noteId,
      project: id,
      createdBy: req.user.id,
    },
    { content },
    { new: true },
  );
  if (!updatedNote)
    throw new APIError(
      400,
      "Update Note Error",
      "Note not found or you don't have permission to update this note",
    );

  // success status to user
  return res.status(200).json(new APIResponse(200, "Note updated successfully", updatedNote));
});

export const deleteNote = asyncHandler(async (req, res) => {
  // get id and noteId from params
  const { id, noteId } = req.params;

  //check if note exists
  const existingNote = await ProjectNote.findOne({
    _id: noteId,
    project: id,
  });
  if (!existingNote) throw new APIError(400, "Delete Note Error", "Note not found");

  // check if user not admin and trying to delete other's note
  if (
    req.user.role !== UserRolesEnum.ADMIN &&
    existingNote.createdBy.toString() !== req.user.id.toString()
  )
    throw new APIError(400, "Delete Note Error", "You don't have permission to delete this note");

  // delete note
  await ProjectNote.findOneAndDelete({
    _id: noteId,
    project: id,
  });

  // success status to user
  return res.status(200).json(new APIResponse(200, "Note deleted successfully"));
});
