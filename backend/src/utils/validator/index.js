import { validationResult } from "express-validator";
import { APIError } from "../api/apiError.js";

export const validate = (req, _, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) return next();

  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  throw new APIError(402, "Invalid data from body", extractedErrors);
};
