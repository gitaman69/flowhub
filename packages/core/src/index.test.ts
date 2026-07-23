import { describe, expect, it, vi } from "vitest";
import { createApp, EventBus } from "./index.js";

describe("EventBus", () => {
  it("delivers emitted payload to listeners", () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.on("sms.sent", handler);
    bus.emit("sms.sent", { to: "+1" });
    expect(handler).toHaveBeenCalledWith({ to: "+1" });
  });

  it("off() stops delivery", () => {
    const bus = new EventBus();
    const handler = vi.fn();
    const unsubscribe = bus.on("x", handler);
    unsubscribe();
    bus.emit("x");
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("FlowKitApp", () => {
  it("registers and resolves services", () => {
    const app = createApp();
    app.register("logger", { log: () => {} });
    expect(app.resolve("logger")).toBeDefined();
  });

  it("throws resolving an unknown service", () => {
    const app = createApp();
    expect(() => app.resolve("missing")).toThrow(/no service registered/);
  });

  it("runs plugin setup and tracks registration", async () => {
    const app = createApp();
    const setup = vi.fn();
    await app.use({ name: "test-plugin", setup });
    expect(setup).toHaveBeenCalledWith(app);
    expect(app.hasPlugin("test-plugin")).toBe(true);
  });

  it("rejects duplicate plugin registration", async () => {
    const app = createApp();
    await app.use({ name: "dup", setup: () => {} });
    await expect(app.use({ name: "dup", setup: () => {} })).rejects.toThrow(/already registered/);
  });
});
