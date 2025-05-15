import { param } from "express-validator";

// function to check for project note id validation errors
export const projectNoteIdValidator = () => {
  return [param("noteId").trim().isMongoId().withMessage("note id is invalid")];
};
