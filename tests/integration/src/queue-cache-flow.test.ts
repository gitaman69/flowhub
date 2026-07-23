import { CacheRegistry, MemoryCacheBackend } from "@flowhub/cache";
import { MemoryQueueBackend, QueueRegistry } from "@flowhub/queue";
import { describe, expect, it } from "vitest";

describe("queue + cache flow", () => {
  it("enqueues a job, processes it, and caches the result for later retrieval", async () => {
    const queue = new QueueRegistry();
    queue.register(new MemoryQueueBackend());
    const cache = new CacheRegistry();
    cache.register(new MemoryCacheBackend());

    await queue.enqueue("memory", { type: "resize-image", id: "img-1" });

    const job = (await queue.dequeue("memory")) as { type: string; id: string };
    expect(job).toEqual({ type: "resize-image", id: "img-1" });

    const result = { url: `https://cdn.test/${job.id}-resized.png` };
    await cache.get("memory").set(`job-result:${job.id}`, result);

    expect(await cache.get("memory").get(`job-result:${job.id}`)).toEqual(result);
    expect(await queue.dequeue("memory")).toBeUndefined();
  });
});
