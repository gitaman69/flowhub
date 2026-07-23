# @flowhub/errors

Shared error types thrown across every `@flowhub/*` package, so callers handle one error shape instead of one per provider.

← [Back to root README](../../README.md) · Part of the [FlowKit](../../README.md) toolkit.

## Install

```bash
pnpm add @flowhub/errors
```

## API

### `class FlowKitError extends Error`

```ts
new FlowKitError(message: string, options: { code: string; cause?: unknown })
```

| Property | Type | Description |
|---|---|---|
| `code` | `string` | Machine-readable error code, e.g. `"PROVIDER_NOT_FOUND"` |
| `cause` | `unknown` | The underlying error, if any |

### `class ProviderNotFoundError extends FlowKitError`

```ts
new ProviderNotFoundError(kind: string, provider: string)
```

Thrown by every `*Registry.get(name)` across the toolkit (`SmsRegistry`, `OAuthRegistry`, `StorageRegistry`, `EmailRegistry`, `QueueRegistry`, `CacheRegistry`, `WebhookRegistry`) when `name` was never `register()`-ed. `code` is `"PROVIDER_NOT_FOUND"`.

## Usage

### One `catch` for every registry in the app

```ts
import { ProviderNotFoundError } from "@flowhub/errors";

try {
  await sms.send("mailgun", to, body); // wrong module's provider name, common typo
} catch (err) {
  if (err instanceof ProviderNotFoundError) {
    return res.status(400).json({ error: `Unknown provider: ${err.message}` });
  }
  throw err;
}
```

### Extending `FlowKitError` for your own app-level errors

```ts
import { FlowKitError } from "@flowhub/errors";

class RateLimitError extends FlowKitError {
  constructor(retryAfterMs: number) {
    super(`Rate limit exceeded, retry after ${retryAfterMs}ms`, { code: "RATE_LIMITED" });
  }
}
```

## Related packages

Used by [`@flowhub/sms`](../sms/README.md), [`@flowhub/oauth`](../oauth/README.md), [`@flowhub/email`](../email/README.md), [`@flowhub/storage`](../storage/README.md), [`@flowhub/webhook`](../webhook/README.md), [`@flowhub/queue`](../queue/README.md), and [`@flowhub/cache`](../cache/README.md).
