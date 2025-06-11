// class to standardize API Errors
export class APIError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;
    // if stack is present, use it, else capture the stack trace
    if (stack) this.stack = stack;
    else Error.captureStackTrace(this, this.constructor);
  }
}
