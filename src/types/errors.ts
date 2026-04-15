export class AppError extends Error {
  public readonly code: string;

  public readonly retryable: boolean;

  public readonly details?: unknown;

  public constructor(code: string, message: string, retryable = false, details?: unknown) {
    super(message);
    this.code = code;
    this.retryable = retryable;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  public constructor(message: string, details?: unknown) {
    super("VALIDATION_ERROR", message, false, details);
  }
}

export class ToolPolicyError extends AppError {
  public constructor(message: string, details?: unknown) {
    super("POLICY_ERROR", message, false, details);
  }
}

export class CommandExecutionError extends AppError {
  public constructor(message: string, retryable = true, details?: unknown) {
    super("COMMAND_EXECUTION_ERROR", message, retryable, details);
  }
}
