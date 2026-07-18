export class ApiResponse<T> {
  public readonly success: boolean;
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data: T;
  public readonly meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  constructor(
    statusCode: number,
    data: T,
    message = "Success",
    meta?: { page: number; limit: number; total: number; totalPages: number }
  ) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) {
      this.meta = meta;
    }
  }

  static success<T>(data: T, message = "Success") {
    return { success: true as const, message, data };
  }

  static created<T>(data: T, message = "Created successfully") {
    return { success: true as const, message, data };
  }

  static paginated<T>(
    data: T,
    page: number,
    limit: number,
    total: number,
    message = "Success"
  ) {
    return {
      success: true as const,
      message,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
