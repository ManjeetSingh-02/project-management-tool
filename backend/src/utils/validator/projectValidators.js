import { body } from "express-validator";

// function to check for project creation validation errors
export const projectCreationValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("project name is required")
      .isLength({ min: 3 })
      .withMessage("project name should be atleast 3 chars")
      .isLength({ max: 13 })
      .withMessage("project name should not be more than 13 chars"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("project description is required")
      .isLength({ min: 10 })
      .withMessage("project description should be atleast 10 chars")
      .isLength({ max: 100 })
      .withMessage("project description should not be more than 100 chars"),
  ];
};
