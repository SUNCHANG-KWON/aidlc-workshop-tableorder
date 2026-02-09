export class AppError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function toAppError(error) {
  if (error instanceof AppError) {
    return error;
  }
  return new AppError(500, 'Internal Server Error');
}
