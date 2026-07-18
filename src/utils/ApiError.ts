export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorDetails: string[];

  constructor(
    statusCode: number,
    message: string,
    errorDetails: string[] = [],
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorDetails = errorDetails;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message = "Bad request", errorDetails: string[] = []) {
    return new ApiError(400, message, errorDetails);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }

  static notFound(message = "Not found") {
    return new ApiError(404, message);
  }

  static conflict(message = "Conflict") {
    return new ApiError(409, message);
  }

  static internal(message = "Internal server error") {
    return new ApiError(500, message, [], false);
  }
}
