import { body, param } from "express-validator";
import { AvailableTaskStatuses } from "../constants.js";

// function to check for task id validation errors
export const taskIdValidator = () => {
  return [param("taskId").trim().isMongoId().withMessage("task id is invalid")];
};

// function check for task validation errors
export const taskValidator = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("task title is required")
      .isLength({ min: 3 })
      .withMessage("task title should be atleast 3 chars")
      .isLength({ max: 13 })
      .withMessage("task title should not be more than 13 chars"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("task description is required")
      .isLength({ min: 10 })
      .withMessage("task description should be atleast 10 chars")
      .isLength({ max: 100 })
      .withMessage("task description should not be more than 100 chars"),
    body("assignedTo")
      .trim()
      .notEmpty()
      .withMessage("assigned to user id is required")
      .isMongoId()
      .withMessage("invalid user id"),
    body("attachments").optional().isArray().withMessage("attachments should be an array"),
  ];
};

// function to check for task status validation errors
export const taskStatusValidator = () => {
  return [
    body("status")
      .trim()
      .notEmpty()
      .withMessage("project status is required")
      .isIn(AvailableTaskStatuses)
      .withMessage("project can only have following status: todo | in_progress | done"),
  ];
};
