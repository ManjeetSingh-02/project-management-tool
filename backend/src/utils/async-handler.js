// wrapper function to catch errors
export function asyncHandler(requestHandler) {
  return function (req, res, next) {
    Promise.resolve(requestHandler(req, res, next)).catch(err =>
      res.status(err.statusCode ?? 500).json({
        statusCode: err.statusCode ?? 500,
        success: err.success ?? false,
        message: err.message ?? "Internal Server Error",
        error: err.errors ?? err.error ?? "Something went wrong",
      }),
    );
  };
}
