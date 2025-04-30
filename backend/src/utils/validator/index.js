import { validationResult } from "express-validator";
import { APIError } from "../api/apiError.js";

// function to check for any validation errors
export const validate = async (req, res, next) => {
  // check for any errors
  const errors = validationResult(req);

  // if there are no errors, move to the next middleware
  if (errors.isEmpty()) return next();

  // if there are errors, extract the error messages and paths
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  // return an APIError with the extracted errors
  return res.status(422).json(new APIError(422, "Invalid data from body", extractedErrors));
};
