import { describe, expect, it } from "vitest";
import { MemoryQueueBackend, QueueRegistry } from "./index.js";

describe("QueueRegistry", () => {
  it("enqueues and dequeues jobs in FIFO order via the registered backend", async () => {
    const registry = new QueueRegistry();
    registry.register(new MemoryQueueBackend());

    await registry.enqueue("memory", { id: 1 });
    await registry.enqueue("memory", { id: 2 });

    expect(await registry.dequeue("memory")).toEqual({ id: 1 });
    expect(await registry.dequeue("memory")).toEqual({ id: 2 });
    expect(await registry.dequeue("memory")).toBeUndefined();
  });

  it("throws for an unregistered backend", async () => {
    const registry = new QueueRegistry();
    await expect(registry.enqueue("missing", {})).rejects.toThrow(/no "missing" provider/i);
  });
});
