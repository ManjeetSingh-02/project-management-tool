import { asyncHandler } from "../../../utils/async-handler.js";
import { APIError } from "../../../utils/api/apiError.js";
import { APIResponse } from "../../../utils/api/apiResponse.js";
import { ProjectNote } from "./note.models.js";

export const getNotes = asyncHandler(async (req, res) => {
  // get projectId from params
  const { projectId } = req.params;

  // get all project notes
  const allNotes = await ProjectNote.find({ project: projectId, createdBy: req.user.id })
    .select("-createdBy -__v")
    .populate("project", "name");

  // success status to user
  return res.status(200).json(new APIResponse(200, "Notes fetched successfully", allNotes));
});

export const getNoteById = asyncHandler(async (req, res) => {
  // get projectId and noteId from params
  const { projectId, noteId } = req.params;

  // check if note exists
  const existingNote = await ProjectNote.findOne({
    _id: noteId,
    project: projectId,
    createdBy: req.user.id,
  })
    .select("-createdBy -__v")
    .populate("project", "name");
  if (!existingNote) throw new APIError(400, "Get Note Error", "Note not found");

  // success status to user
  return res.status(200).json(new APIResponse(200, "Note fetched successfully", existingNote));
});

export const createNote = asyncHandler(async (req, res) => {
  // get projectId from params
  const { projectId } = req.params;

  // get content from body
  const { content } = req.body;

  // check if note already exists by same user for the same project
  const existingNote = await ProjectNote.findOne({
    project: projectId,
    createdBy: req.user.id,
    content: content.trim(),
  });
  if (existingNote)
    throw new APIError(400, "Create Note Error", "Note already exists for this project and user");

  // create new note
  const newNote = await ProjectNote.create({
    project: projectId,
    createdBy: req.user.id,
    content,
  });
  if (!newNote)
    throw new APIError(400, "Create Note Error", "Something went wrong while creating note");

  // success status to user
  return res.status(201).json(
    new APIResponse(201, "Note created successfully", {
      note: {
        _id: newNote._id,
        content: newNote.content,
        createdAt: newNote.createdAt,
        updatedAt: newNote.updatedAt,
      },
    }),
  );
});

export const updateNote = asyncHandler(async (req, res) => {
  // get projectId and noteId from params
  const { projectId, noteId } = req.params;

  // get content from body
  const { content } = req.body;

  // check if note already exists by same user for the same project
  const existingNote = await ProjectNote.findOne({
    _id: {
      $ne: noteId,
    },
    project: projectId,
    createdBy: req.user.id,
    content: content.trim(),
  });
  if (existingNote)
    throw new APIError(
      400,
      "Update Note Error",
      "Another note with same content already exists for this project and user",
    );

  // update note
  const updatedNote = await ProjectNote.findOneAndUpdate(
    {
      _id: noteId,
      project: projectId,
      createdBy: req.user.id,
    },
    { content },
    { new: true },
  );
  if (!updatedNote)
    throw new APIError(400, "Update Note Error", "Something went wrong while updating note");

  // success status to user
  return res.status(200).json(
    new APIResponse(200, "Note updated successfully", {
      note: {
        _id: updatedNote._id,
        content: updatedNote.content,
        createdAt: updatedNote.createdAt,
        updatedAt: updatedNote.updatedAt,
      },
    }),
  );
});

export const deleteNote = asyncHandler(async (req, res) => {
  // get projectId and noteId from params
  const { projectId, noteId } = req.params;

  //check if note exists
  const existingNote = await ProjectNote.findOne({
    _id: noteId,
    project: projectId,
    createdBy: req.user.id,
  });
  if (!existingNote) throw new APIError(400, "Delete Note Error", "Note not found");

  // delete note
  await ProjectNote.findOneAndDelete({
    _id: noteId,
    project: projectId,
    createdBy: req.user.id,
  });

  // success status to user
  return res.status(200).json(new APIResponse(200, "Note deleted successfully"));
});
