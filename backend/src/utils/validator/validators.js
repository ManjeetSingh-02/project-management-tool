import { body } from "express-validator";

export const userRegistrationValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("invalid email"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("username is required")
      .isLength({ min: 3 })
      .withMessage("username should be atleast 3 chars")
      .isLength({ max: 13 })
      .withMessage("username should not be more than 13 chars"),
    body("password")
      .notEmpty()
      .withMessage("password is required")
      .isStrongPassword()
      .withMessage("password is not strong enough, increase its length"),
  ];
};