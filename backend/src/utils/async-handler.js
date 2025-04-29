// wrapper function to catch errors
export function asyncHandler(requestHandler) {
  return function (req, res, next) {
    Promise.resolve(requestHandler(req, res, next)).catch(err => next(err));
  };
}
