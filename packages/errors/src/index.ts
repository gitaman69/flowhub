export interface FlowKitErrorOptions {
  code: string;
  cause?: unknown;
}

export class FlowKitError extends Error {
  readonly code: string;
  readonly cause?: unknown;

  constructor(message: string, options: FlowKitErrorOptions) {
    super(message);
    this.name = "FlowKitError";
    this.code = options.code;
    this.cause = options.cause;
  }
}

export class ProviderNotFoundError extends FlowKitError {
  constructor(kind: string, provider: string) {
    super(`No "${provider}" provider registered for ${kind}`, {
      code: "PROVIDER_NOT_FOUND",
    });
    this.name = "ProviderNotFoundError";
  }
}
