import { describe, expect, it } from "vitest";
import * as flowhub from "./index.js";

describe("@flowhub/flowhub re-exports", () => {
  it("re-exports core", () => {
    expect(typeof flowhub.createApp).toBe("function");
    expect(typeof flowhub.EventBus).toBe("function");
  });

  it("re-exports errors", () => {
    expect(typeof flowhub.FlowKitError).toBe("function");
    expect(typeof flowhub.ProviderNotFoundError).toBe("function");
  });

  it("re-exports retry, logger, config", () => {
    expect(typeof flowhub.retry).toBe("function");
    expect(typeof flowhub.createLogger).toBe("function");
    expect(typeof flowhub.loadConfig).toBe("function");
  });

  it("re-exports express route helpers", () => {
    expect(typeof flowhub.registerOAuthRoutes).toBe("function");
    expect(typeof flowhub.registerWebhookRoutes).toBe("function");
  });

  it("re-exports cli", () => {
    expect(typeof flowhub.createProgram).toBe("function");
  });

  it("re-exports every provider registry", () => {
    expect(typeof flowhub.StorageRegistry).toBe("function");
    expect(typeof flowhub.SmsRegistry).toBe("function");
    expect(typeof flowhub.OAuthRegistry).toBe("function");
    expect(typeof flowhub.EmailRegistry).toBe("function");
    expect(typeof flowhub.WebhookRegistry).toBe("function");
    expect(typeof flowhub.QueueRegistry).toBe("function");
    expect(typeof flowhub.CacheRegistry).toBe("function");
  });

  it("re-exports otp", () => {
    expect(typeof flowhub.OtpManager).toBe("function");
    expect(typeof flowhub.CooldownError).toBe("function");
  });
});
