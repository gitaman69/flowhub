# @flowhub/retry

Retry an async or sync function with fixed or exponential backoff. One helper instead of a hand-rolled loop at every provider call site.

← [Back to root README](../../README.md) · Part of the [FlowKit](../../README.md) toolkit.

## Install

```bash
pnpm add @flowhub/retry
```

## API

### `retry(fn, options?): Promise<T>`

```ts
function retry<T>(fn: () => Promise<T> | T, options?: RetryOptions): Promise<T>;

interface RetryOptions {
  attempts?: number;        // default 3
  delayMs?: number;         // default 0
  backoff?: "fixed" | "exponential"; // default "fixed"
}
```

Calls `fn()` up to `attempts` times. On failure, waits `delayMs` (fixed) or `delayMs * 2^(attempt-1)` (exponential) before retrying. Rethrows the last error once attempts are exhausted.

## Usage

### Wrapping a flaky provider call

```ts
import { retry } from "@flowhub/retry";
import { SmsRegistry } from "@flowhub/sms";

const sms = new SmsRegistry(app.events);

await retry(() => sms.send("twilio", to, body), {
  attempts: 3,
  delayMs: 200,
  backoff: "exponential", // waits 200ms, then 400ms
});
```

### Fallback to a second provider after retries exhaust

```ts
try {
  await retry(() => sms.send("twilio", to, body), { attempts: 3, delayMs: 200 });
} catch {
  await sms.send("msg91", to, body); // last resort, no retry
}
```

### Retrying a non-network operation

`fn` doesn't have to touch a provider — anything that can transiently fail works:

```ts
await retry(() => fs.promises.rename(tmpPath, finalPath), { attempts: 5, delayMs: 50 });
```

## Related packages

Commonly paired with [`@flowhub/sms`](../sms/README.md), [`@flowhub/email`](../email/README.md), [`@flowhub/storage`](../storage/README.md), and [`@flowhub/oauth`](../oauth/README.md) — see the [root README's Before/After section](../../README.md#before--after) for a full failover example.
