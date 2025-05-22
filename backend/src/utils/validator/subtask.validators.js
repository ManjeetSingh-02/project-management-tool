import { body } from "express-validator";

// function check for subtask validation errors
export const subTaskValidator = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("subtask title is required")
      .isLength({ min: 3 })
      .withMessage("subtask title should be atleast 3 chars")
      .isLength({ max: 13 })
      .withMessage("subtask title should not be more than 13 chars"),
  ];
};
