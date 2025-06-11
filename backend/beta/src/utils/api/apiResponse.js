// class to standardize API responses
export class APIResponse {
  constructor(statusCode, message = "Success", data = []) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = true;
  }
}
