// wrapper function to catch errors
export function asyncHandler(requestHandler) {
  return function (req, res, next) {
    Promise.resolve(requestHandler(req, res, next)).catch(err =>
      res.status(err.statusCode).json({
        statusCode: err.statusCode,
        message: err.message,
        error: err.errors,
      }),
    );
  };
}
