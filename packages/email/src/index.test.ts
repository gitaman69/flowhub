import { describe, expect, it, vi } from "vitest";
import { EmailRegistry, type EmailProvider } from "./index.js";

describe("EmailRegistry", () => {
  it("dispatches send to the registered provider", async () => {
    const provider: EmailProvider = { name: "resend", send: vi.fn(async () => {}) };
    const registry = new EmailRegistry();
    registry.register(provider);
    await registry.send("resend", "a@test.com", "hi", "body");
    expect(provider.send).toHaveBeenCalledWith("a@test.com", "hi", "body");
  });

  it("throws for an unregistered provider", async () => {
    const registry = new EmailRegistry();
    await expect(registry.send("missing", "a@test.com", "hi", "body")).rejects.toThrow(/no "missing" provider/i);
  });
});
