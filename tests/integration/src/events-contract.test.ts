import { EventBus } from "@flowhub/core";
import { OAuthRegistry, type OAuthProvider } from "@flowhub/oauth";
import { SmsRegistry, type SmsProvider } from "@flowhub/sms";
import { StorageRegistry, type StorageProvider } from "@flowhub/storage";
import { describe, expect, it, vi } from "vitest";

describe("Plan.md events contract", () => {
  it("sms.sent and sms.failed are emitted by @flowhub/sms", async () => {
    const events = new EventBus();
    const sentHandler = vi.fn();
    const failedHandler = vi.fn();
    events.on("sms.sent", sentHandler);
    events.on("sms.failed", failedHandler);

    const sms = new SmsRegistry(events);
    const ok: SmsProvider = { name: "ok", send: vi.fn(async () => {}) };
    const bad: SmsProvider = { name: "bad", send: vi.fn(async () => { throw new Error("down"); }) };
    sms.register(ok);
    sms.register(bad);

    await sms.send("ok", "+1", "hi");
    await expect(sms.send("bad", "+1", "hi")).rejects.toThrow();

    expect(sentHandler).toHaveBeenCalled();
    expect(failedHandler).toHaveBeenCalled();
  });

  it("oauth.login and oauth.refresh are emitted by @flowhub/oauth", async () => {
    const events = new EventBus();
    const loginHandler = vi.fn();
    const refreshHandler = vi.fn();
    events.on("oauth.login", loginHandler);
    events.on("oauth.refresh", refreshHandler);

    const oauth = new OAuthRegistry(events);
    const provider: OAuthProvider = {
      name: "google",
      buildAuthorizeUrl: (state) => state,
      exchangeCode: async () => ({ accessToken: "at" }),
      refresh: async () => ({ accessToken: "at2" }),
    };
    oauth.register(provider);

    await oauth.handleCallback("google", "code", "state");
    await oauth.refresh("google", "rt");

    expect(loginHandler).toHaveBeenCalled();
    expect(refreshHandler).toHaveBeenCalled();
  });

  it("storage.uploaded is emitted by @flowhub/storage", async () => {
    const events = new EventBus();
    const uploadedHandler = vi.fn();
    events.on("storage.uploaded", uploadedHandler);

    const storage = new StorageRegistry(events);
    const provider: StorageProvider = {
      name: "s3",
      upload: async (key) => ({ url: `https://cdn.test/${key}` }),
    };
    storage.register(provider);

    await storage.upload("s3", "a.png", "data");

    expect(uploadedHandler).toHaveBeenCalled();
  });
});
