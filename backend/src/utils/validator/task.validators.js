// function to check for task id validation errors
export const taskIdValidator = () => {
  return [param("taskId").trim().isMongoId().withMessage("task id is invalid")];
};
