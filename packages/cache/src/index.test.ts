import { describe, expect, it } from "vitest";
import { CacheRegistry, MemoryCacheBackend } from "./index.js";

describe("MemoryCacheBackend", () => {
  it("stores and retrieves a value", async () => {
    const cache = new MemoryCacheBackend();
    await cache.set("k", "v");
    expect(await cache.get("k")).toBe("v");
  });

  it("expires a value after its TTL", async () => {
    let time = 0;
    const cache = new MemoryCacheBackend({ now: () => time });
    await cache.set("k", "v", 1000);
    time += 1001;
    expect(await cache.get("k")).toBeUndefined();
  });

  it("deletes a value", async () => {
    const cache = new MemoryCacheBackend();
    await cache.set("k", "v");
    await cache.delete("k");
    expect(await cache.get("k")).toBeUndefined();
  });
});

describe("CacheRegistry", () => {
  it("resolves a registered backend by name", () => {
    const registry = new CacheRegistry();
    const backend = new MemoryCacheBackend();
    registry.register(backend);
    expect(registry.get("memory")).toBe(backend);
  });

  it("throws for an unregistered backend", () => {
    const registry = new CacheRegistry();
    expect(() => registry.get("missing")).toThrow(/no "missing" provider/i);
  });
});
