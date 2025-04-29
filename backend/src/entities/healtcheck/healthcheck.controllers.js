import { APIResponse } from "../../utils/api/apiResponse.js";

export const healthCheck = (_, res) => {
  res.status(200).json(new APIResponse(200, { message: "Server is Running" }));
};
