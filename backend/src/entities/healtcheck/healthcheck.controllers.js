import { APIResponse } from "../../utils/api/apiResponse.js";

export const healthCheck = (_, res) => {
  res.status(200).json(new APIResponse(200, "Server is Running"));
};
