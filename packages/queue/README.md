# @flowhub/queue

Provider-agnostic job queue registry — BullMQ, RabbitMQ, Redis, SQS, or the built-in in-memory backend for local dev.

← [Back to root README](../../README.md) · Part of the [FlowKit](../../README.md) toolkit.

## Install

```bash
pnpm add @flowhub/queue @flowhub/errors
```

## API

### `interface QueueBackend`

```ts
interface QueueBackend {
  name: string;
  enqueue(job: unknown): Promise<void>;
  dequeue(): Promise<unknown | undefined>;
}
```

### `class MemoryQueueBackend implements QueueBackend`

In-memory FIFO queue, `name` is `"memory"`. Good for local dev and tests; not shared across processes.

### `class QueueRegistry`

| Method | Description |
|---|---|
| `register(backend)` | Add a backend under `backend.name` |
| `get(name)` | Look up a backend; throws `ProviderNotFoundError` if unregistered |
| `enqueue(name, job)` | Dispatch to the named backend's `enqueue()` |
| `dequeue(name)` | Dispatch to the named backend's `dequeue()` |

## Usage

### Local dev with the built-in memory backend

```ts
import { QueueRegistry, MemoryQueueBackend } from "@flowhub/queue";

const queue = new QueueRegistry();
queue.register(new MemoryQueueBackend());

await queue.enqueue("memory", { type: "resize-image", key: "avatars/1.png" });
const job = await queue.dequeue("memory");
```

### Swapping in BullMQ for production — same call sites

```ts
import { Queue } from "bullmq";

const bullQueue = new Queue("jobs");
queue.register({
  name: "bullmq",
  enqueue: (job) => bullQueue.add(job.type as string, job).then(() => undefined),
  dequeue: async () => undefined, // BullMQ workers consume via Queue.process, not polling dequeue()
});

await queue.enqueue("bullmq", { type: "resize-image", key: "avatars/1.png" }); // same call as "memory"
```

## Related packages

- [`@flowhub/errors`](../errors/README.md) — `ProviderNotFoundError`
- [`@flowhub/cache`](../cache/README.md) — cache job results after processing
