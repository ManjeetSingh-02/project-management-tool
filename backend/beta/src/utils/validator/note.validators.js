import { body, param } from "express-validator";

// function check for project note validation errors
export const projectNoteValidator = () => {
  return [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("project note is required")
      .isLength({ min: 4 })
      .withMessage("project note should be atleast 4 chars")
      .isLength({ max: 100 })
      .withMessage("project note should not be more than 100 chars"),
  ];
};

// function to check for project note id validation errors
export const projectNoteIdValidator = () => {
  return [param("noteId").trim().isMongoId().withMessage("note id is invalid")];
};
