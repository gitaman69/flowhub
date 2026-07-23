# @flowhub/sms

Provider-agnostic SMS registry — Twilio, MSG91, AWS SNS, Vonage, Textlocal, or any provider that can implement `send()`.

← [Back to root README](../../README.md) · Part of the [FlowKit](../../README.md) toolkit.

## Install

```bash
pnpm add @flowhub/sms @flowhub/core @flowhub/errors
```

## API

### `interface SmsProvider`

```ts
interface SmsProvider {
  name: string;
  send(to: string, body: string): Promise<void>;
}
```

### `class SmsRegistry`

```ts
new SmsRegistry(events?: EventBus)
```

| Method | Description |
|---|---|
| `register(provider)` | Add a provider under `provider.name` |
| `get(name)` | Look up a provider; throws `ProviderNotFoundError` if unregistered |
| `send(name, to, body)` | Dispatch to the named provider; emits `sms.sent` on success, `sms.failed` (then rethrows) on error |

## Events

| Event | Payload | Emitted when |
|---|---|---|
| `sms.sent` | `{ provider, to }` | `provider.send()` resolves |
| `sms.failed` | `{ provider, to, error }` | `provider.send()` rejects, before the error is rethrown |

## Usage

### Implementing a Twilio provider

```ts
import twilio from "twilio";
import { SmsRegistry } from "@flowhub/sms";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const sms = new SmsRegistry(app.events);

sms.register({
  name: "twilio",
  async send(to, body) {
    await client.messages.create({ to, body, from: process.env.TWILIO_FROM });
  },
});

await sms.send("twilio", "+15551234567", "Your code is 482913");
```

### Multi-provider failover with `@flowhub/retry`

```ts
import { retry } from "@flowhub/retry";

try {
  await retry(() => sms.send("twilio", to, body), { attempts: 3, delayMs: 200, backoff: "exponential" });
} catch {
  await sms.send("msg91", to, body); // fallback, no retry
}
```

See the [root README's Before/After section](../../README.md#before--after) for the full comparison against hand-rolled retry+fallback code.

### Centralized delivery metrics, independent of provider count

```ts
app.events.on("sms.sent", ({ provider }) => metrics.increment("sms.sent", { provider }));
app.events.on("sms.failed", ({ provider, error }) => metrics.increment("sms.failed", { provider, reason: error.message }));
```

## Related packages

- [`@flowhub/core`](../core/README.md) — `EventBus` this registry emits onto
- [`@flowhub/errors`](../errors/README.md) — `ProviderNotFoundError`
- [`@flowhub/retry`](../retry/README.md) — retry/backoff wrapper for `send()`
- [`@flowhub/otp`](../otp/README.md) — commonly paired for OTP delivery
