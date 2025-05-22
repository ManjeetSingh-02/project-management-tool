import { body, param } from "express-validator";

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

// function to check for subtask id validation errors
export const subTaskIdValidator = () => {
  return [param("subTaskId").trim().isMongoId().withMessage("subtask id is not valid")];
};

// function to check for subtask status validation errors
export const subTaskStatusValidator = () => {
  return [
    body("isCompleted")
      .notEmpty()
      .withMessage("subtask status is required")
      .isBoolean()
      .withMessage("subtask status should be a boolean"),
  ];
};
