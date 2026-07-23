# @flowhub/cache

Provider-agnostic cache registry — Memory, Redis, LRU, or any backend that can implement `get`/`set`/`delete`. Includes a TTL-aware in-memory backend out of the box.

← [Back to root README](../../README.md) · Part of the [FlowKit](../../README.md) toolkit.

## Install

```bash
pnpm add @flowhub/cache @flowhub/errors
```

## API

### `interface CacheBackend`

```ts
interface CacheBackend {
  name: string;
  get(key: string): Promise<unknown | undefined>;
  set(key: string, value: unknown, ttlMs?: number): Promise<void>;
  delete(key: string): Promise<void>;
}
```

### `class MemoryCacheBackend implements CacheBackend`

```ts
new MemoryCacheBackend(options?: { now?: () => number })
```

`name` is `"memory"`. Entries with a `ttlMs` expire lazily on `get()`.

### `class CacheRegistry`

| Method | Description |
|---|---|
| `register(backend)` | Add a backend under `backend.name` |
| `get(name)` | Look up a backend; throws `ProviderNotFoundError` if unregistered |

## Usage

### Caching an expensive OAuth token refresh

```ts
import { CacheRegistry, MemoryCacheBackend } from "@flowhub/cache";

const cache = new CacheRegistry();
cache.register(new MemoryCacheBackend());

async function getAccessToken(userId: string) {
  const backend = cache.get("memory");
  const cached = await backend.get(`token:${userId}`);
  if (cached) return cached as string;
  const { accessToken } = await oauth.refresh("google", userId);
  await backend.set(`token:${userId}`, accessToken, 55 * 60_000);
  return accessToken;
}
```

See the [root README's Before/After section](../../README.md#before--after) for why this cuts real network round-trips, not just code.

### Swapping in Redis for a multi-instance deployment

```ts
import { createClient } from "redis";

const redis = createClient();
cache.register({
  name: "redis",
  get: (key) => redis.get(key),
  set: (key, value, ttlMs) => (ttlMs ? redis.set(key, value as string, { PX: ttlMs }) : redis.set(key, value as string)).then(() => undefined),
  delete: (key) => redis.del(key).then(() => undefined),
});

await cache.get("redis").set("session:abc", JSON.stringify(session), 60_000); // same shape as "memory"
```

## Related packages

- [`@flowhub/errors`](../errors/README.md) — `ProviderNotFoundError`
- [`@flowhub/oauth`](../oauth/README.md), [`@flowhub/storage`](../storage/README.md) — commonly cached calls
