import { EventBus } from "@flowhub/core";
import { describe, expect, it, vi } from "vitest";
import { StorageRegistry, type StorageProvider } from "./index.js";

function fakeProvider(name = "s3"): StorageProvider {
  return { name, upload: vi.fn(async (key) => ({ url: `https://cdn.test/${key}` })) };
}

describe("StorageRegistry", () => {
  it("dispatches upload to the registered provider", async () => {
    const registry = new StorageRegistry();
    const provider = fakeProvider();
    registry.register(provider);
    const result = await registry.upload("s3", "a.png", "data");
    expect(result.url).toBe("https://cdn.test/a.png");
    expect(provider.upload).toHaveBeenCalledWith("a.png", "data");
  });

  it("throws for an unregistered provider", async () => {
    const registry = new StorageRegistry();
    await expect(registry.upload("missing", "a.png", "data")).rejects.toThrow(/no "missing" provider/i);
  });

  it("emits storage.uploaded on the event bus", async () => {
    const events = new EventBus();
    const handler = vi.fn();
    events.on("storage.uploaded", handler);
    const registry = new StorageRegistry(events);
    registry.register(fakeProvider());
    await registry.upload("s3", "a.png", "data");
    expect(handler).toHaveBeenCalledWith({ provider: "s3", key: "a.png", url: "https://cdn.test/a.png" });
  });
});
