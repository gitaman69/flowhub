# @flowhub/otp

Generation, verification, expiry, and resend-cooldown for one-time codes. Not provider-based — it's the piece that sits between `@flowhub/sms`/`@flowhub/email` and your verification endpoint.

← [Back to root README](../../README.md) · Part of the [FlowKit](../../README.md) toolkit.

## Install

```bash
pnpm add @flowhub/otp
```

## API

### `class OtpManager`

```ts
new OtpManager(options?: {
  length?: number;    // default 6
  ttlMs?: number;      // default 5 * 60_000
  cooldownMs?: number; // default 30_000
  now?: () => number;  // default Date.now — inject for deterministic tests
})
```

| Method | Description |
|---|---|
| `generate(identifier)` | Returns a new numeric code; throws `CooldownError` if called again before `cooldownMs` elapses |
| `verify(identifier, code)` | Returns `true` and consumes the code once, `false` on mismatch, expiry, or replay |

### `class CooldownError extends Error`

Thrown by `generate()` when called before the cooldown window elapses. `error.message` includes the remaining wait in ms.

## Usage

### Generate → deliver → verify

```ts
import { OtpManager, CooldownError } from "@flowhub/otp";
import { SmsRegistry } from "@flowhub/sms";

const otp = new OtpManager({ ttlMs: 5 * 60_000, cooldownMs: 30_000 });
const sms = new SmsRegistry(app.events);

app.post("/otp/send", async (req, res) => {
  try {
    const code = otp.generate(req.body.phone);
    await sms.send("twilio", req.body.phone, `Your code is ${code}`);
    res.json({ sent: true });
  } catch (err) {
    if (err instanceof CooldownError) return res.status(429).json({ message: err.message });
    throw err;
  }
});

app.post("/otp/verify", (req, res) => {
  const ok = otp.verify(req.body.phone, req.body.code);
  res.json({ verified: ok });
});
```

### Deterministic tests — no fake timers needed

```ts
let time = 0;
const otp = new OtpManager({ now: () => time, ttlMs: 1000 });
const code = otp.generate("+1");
time += 1001;
otp.verify("+1", code); // false — expired
```

## Related packages

- [`@flowhub/sms`](../sms/README.md), [`@flowhub/email`](../email/README.md) — deliver the generated code
