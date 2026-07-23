import { EventBus } from "@flowhub/core";
import { describe, expect, it, vi } from "vitest";
import { SmsRegistry, type SmsProvider } from "./index.js";

describe("SmsRegistry", () => {
  it("dispatches send to the registered provider and emits sms.sent", async () => {
    const events = new EventBus();
    const sentHandler = vi.fn();
    events.on("sms.sent", sentHandler);
    const provider: SmsProvider = { name: "twilio", send: vi.fn(async () => {}) };
    const registry = new SmsRegistry(events);
    registry.register(provider);

    await registry.send("twilio", "+1", "hello");

    expect(provider.send).toHaveBeenCalledWith("+1", "hello");
    expect(sentHandler).toHaveBeenCalledWith({ provider: "twilio", to: "+1" });
  });

  it("emits sms.failed and rethrows when the provider send fails", async () => {
    const events = new EventBus();
    const failedHandler = vi.fn();
    events.on("sms.failed", failedHandler);
    const error = new Error("carrier rejected");
    const provider: SmsProvider = { name: "twilio", send: vi.fn(async () => { throw error; }) };
    const registry = new SmsRegistry(events);
    registry.register(provider);

    await expect(registry.send("twilio", "+1", "hello")).rejects.toThrow(error);
    expect(failedHandler).toHaveBeenCalledWith({ provider: "twilio", to: "+1", error });
  });

  it("throws for an unregistered provider", async () => {
    const registry = new SmsRegistry();
    await expect(registry.send("missing", "+1", "hi")).rejects.toThrow(/no "missing" provider/i);
  });
});
