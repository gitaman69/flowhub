import { EventBus } from "@flowhub/core";
import { describe, expect, it, vi } from "vitest";
import { InvalidSignatureError, WebhookRegistry, type WebhookVerifier } from "./index.js";

function fakeVerifier(expectedSignature: string): WebhookVerifier {
  return { name: "stripe", verify: (_payload, signature) => signature === expectedSignature };
}

describe("WebhookRegistry", () => {
  it("emits webhook.received for a valid signature", () => {
    const events = new EventBus();
    const handler = vi.fn();
    events.on("webhook.received", handler);
    const registry = new WebhookRegistry(events);
    registry.register(fakeVerifier("valid-sig"));

    registry.receive("stripe", "{}", "valid-sig");

    expect(handler).toHaveBeenCalledWith({ provider: "stripe", payload: "{}" });
  });

  it("throws InvalidSignatureError and emits webhook.rejected for a bad signature", () => {
    const events = new EventBus();
    const handler = vi.fn();
    events.on("webhook.rejected", handler);
    const registry = new WebhookRegistry(events);
    registry.register(fakeVerifier("valid-sig"));

    expect(() => registry.receive("stripe", "{}", "bad-sig")).toThrow(InvalidSignatureError);
    expect(handler).toHaveBeenCalledWith({ provider: "stripe" });
  });

  it("throws for an unregistered provider", () => {
    const registry = new WebhookRegistry();
    expect(() => registry.receive("missing", "{}", "sig")).toThrow(/no "missing" provider/i);
  });
});
