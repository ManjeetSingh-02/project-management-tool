import { validationResult } from "express-validator";
import { APIError } from "../api/apiError.js";
import { asyncHandler } from "../async-handler.js";

// function to check for any validation errors
export const validate = asyncHandler(async (req, _, next) => {
  // check for any errors
  const errors = validationResult(req);

  // if there are no errors, move to the next middleware
  if (errors.isEmpty()) return next();

  // if there are errors, extract the error messages and paths
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  // throw an APIError with the extracted errors
  throw new APIError(422, "Validation Error", extractedErrors);
});
