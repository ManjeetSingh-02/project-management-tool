import { body } from "express-validator";

// function to check for any registration validation errors
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
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "password should contain one uppercase, one lowercase, one number and one special character and min length must be 8",
      ),
    body("fullname").trim().notEmpty().withMessage("fullname is required"),
  ];
};

// function to check for any login validation errors
export const userLoginValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("invalid email"),
    body("password").notEmpty().withMessage("password is required"),
  ];
};

// function to check for email verification validation errors
export const emailValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("invalid email"),
  ];
};

// function to check for password validation errors
export const passwordValidator = () => {
  return [
    body("newPassword")
      .notEmpty()
      .withMessage("new password is required")
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "new password should contain one uppercase, one lowercase, one number and one special character and min length must be 8",
      ),
  ];
};
