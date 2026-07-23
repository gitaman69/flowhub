import { EventBus } from "@flowhub/core";
import { describe, expect, it, vi } from "vitest";
import { OAuthRegistry, type OAuthProvider } from "./index.js";

function fakeProvider(): OAuthProvider {
  return {
    name: "google",
    buildAuthorizeUrl: (state) => `https://accounts.google.test/authorize?state=${state}`,
    exchangeCode: vi.fn(async () => ({ accessToken: "at", refreshToken: "rt" })),
    refresh: vi.fn(async () => ({ accessToken: "at2" })),
  };
}

describe("OAuthRegistry", () => {
  it("builds an authorize URL via the registered provider", () => {
    const registry = new OAuthRegistry();
    registry.register(fakeProvider());
    expect(registry.authorize("google", "abc")).toContain("state=abc");
  });

  it("emits oauth.login on successful callback", async () => {
    const events = new EventBus();
    const handler = vi.fn();
    events.on("oauth.login", handler);
    const registry = new OAuthRegistry(events);
    registry.register(fakeProvider());
    const tokens = await registry.handleCallback("google", "code", "state");
    expect(tokens.accessToken).toBe("at");
    expect(handler).toHaveBeenCalledWith({ provider: "google" });
  });

  it("emits oauth.refresh on token refresh", async () => {
    const events = new EventBus();
    const handler = vi.fn();
    events.on("oauth.refresh", handler);
    const registry = new OAuthRegistry(events);
    registry.register(fakeProvider());
    await registry.refresh("google", "rt");
    expect(handler).toHaveBeenCalledWith({ provider: "google" });
  });

  it("throws for an unregistered provider", () => {
    const registry = new OAuthRegistry();
    expect(() => registry.authorize("missing", "s")).toThrow(/no "missing" provider/i);
  });
});
