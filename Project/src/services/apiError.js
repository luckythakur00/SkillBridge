export class ApiError extends Error {
  constructor(status, message, fieldErrors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}
