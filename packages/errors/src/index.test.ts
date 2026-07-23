import { describe, expect, it } from "vitest";
import { FlowKitError, ProviderNotFoundError } from "./index.js";

describe("FlowKitError", () => {
  it("carries code, message, and cause", () => {
    const cause = new Error("underlying");
    const err = new FlowKitError("boom", { code: "BOOM", cause });
    expect(err.message).toBe("boom");
    expect(err.code).toBe("BOOM");
    expect(err.cause).toBe(cause);
    expect(err).toBeInstanceOf(Error);
  });
});

describe("ProviderNotFoundError", () => {
  it("formats kind and provider into message", () => {
    const err = new ProviderNotFoundError("sms", "twilio");
    expect(err.message).toContain("twilio");
    expect(err.message).toContain("sms");
    expect(err.code).toBe("PROVIDER_NOT_FOUND");
  });
});
