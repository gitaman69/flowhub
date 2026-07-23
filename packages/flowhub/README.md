# @flowhub/flowhub

One-install convenience bundle for the entire FlowKit toolkit. `@flowhub/flowhub` re-exports every symbol from all 15 `@flowhub/*` packages — `core`, `errors`, `retry`, `logger`, `config`, `express`, `cli`, `storage`, `sms`, `oauth`, `email`, `otp`, `webhook`, `queue`, `cache` — from a single import. Same classes, same functions, same behavior as importing each package directly; this package adds nothing but the re-export.

← [Back to root README](../../README.md) · Part of the [FlowKit](../../README.md) toolkit.

## Table of Contents

- [Install](#install)
- [When to use this vs. the individual packages](#when-to-use-this-vs-the-individual-packages)
- [Quick example](#quick-example)
- [What's re-exported, by module](#whats-re-exported-by-module)
  - [core](#core)
  - [errors](#errors)
  - [retry](#retry)
  - [logger](#logger)
  - [config](#config)
  - [express](#express)
  - [cli](#cli)
  - [storage](#storage)
  - [sms](#sms)
  - [oauth](#oauth)
  - [email](#email)
  - [otp](#otp)
  - [webhook](#webhook)
  - [queue](#queue)
  - [cache](#cache)
- [Full example: OTP-gated signup with events](#full-example-otp-gated-signup-with-events)
- [Related packages](#related-packages)

## Install

```bash
pnpm add @flowhub/flowhub
# or npm / yarn
```

This pulls in all 15 packages as regular dependencies (see [package.json](package.json)) — one install, everything available, no per-module `pnpm add`.

## When to use this vs. the individual packages

| | `@flowhub/flowhub` | Individual packages (`@flowhub/sms`, `@flowhub/oauth`, ...) |
|---|---|---|
| Install | One command | One per module you use |
| Dependency tree | Includes all 15 modules | Only what you import |
| Versioning | All modules move together | Each module versioned independently |
| Best for | Prototyping, or services touching most of the toolkit | Production services using a handful of modules |

If you only need `sms` + `otp`, installing those two directly keeps the tree smaller and each module upgrades independently. If you're standing up a new backend and expect to touch most of the toolkit, this package saves the repetition — swap it for the individual packages later without any code changes, since the exports are identical.

## Quick example

```ts
import { createApp, SmsRegistry, OAuthRegistry, OtpManager } from "@flowhub/flowhub";

const app = createApp();
const sms = new SmsRegistry(app.events);
const oauth = new OAuthRegistry(app.events);
const otp = new OtpManager({ ttlMs: 5 * 60_000 });
```

Equivalent, one import per module:

```ts
import { createApp } from "@flowhub/core";
import { SmsRegistry } from "@flowhub/sms";
import { OAuthRegistry } from "@flowhub/oauth";
import { OtpManager } from "@flowhub/otp";
```

## What's re-exported, by module

Every export below is available directly from `"@flowhub/flowhub"`. Each module links to its own README for the full API reference, event tables, and more usage examples.

### [core](../core/README.md)

Configuration, lifecycle, plugin loading, DI, event bus.

| Export | Kind | Signature |
|---|---|---|
| `createApp` | function | `(config?: Record<string, unknown>) => FlowKitApp` |
| `FlowKitApp` | class | `.events`, `.config`, `.register()`, `.resolve()`, `.use()`, `.hasPlugin()` |
| `EventBus` | class | `.on()`, `.off()`, `.emit()` |
| `Plugin` | interface | `{ name: string; setup(app): void \| Promise<void> }` |

```ts
const app = createApp({ env: "production" });
app.events.on("sms.sent", (p) => console.log(p));
```

### [errors](../errors/README.md)

Shared error types thrown across every module.

| Export | Kind | Signature |
|---|---|---|
| `FlowKitError` | class | `new FlowKitError(message, { code, cause? })` |
| `ProviderNotFoundError` | class | `new ProviderNotFoundError(kind, provider)` — thrown by every `*Registry.get()` |

### [retry](../retry/README.md)

Retry helper with fixed/exponential backoff.

| Export | Kind | Signature |
|---|---|---|
| `retry` | function | `<T>(fn: () => Promise<T> \| T, options?: { attempts?, delayMs?, backoff? }) => Promise<T>` |

```ts
await retry(() => sms.send("twilio", to, body), { attempts: 3, delayMs: 200, backoff: "exponential" });
```

### [logger](../logger/README.md)

Minimal leveled logger.

| Export | Kind | Signature |
|---|---|---|
| `createLogger` | function | `(options?: { level?, sink? }) => Logger` |
| `Logger` | class | `.debug()`, `.info()`, `.warn()`, `.error()` |

### [config](../config/README.md)

Config merge + required-key validation.

| Export | Kind | Signature |
|---|---|---|
| `loadConfig` | function | `(sources: Record<string, unknown>[], options?: { required?, defaults? }) => Record<string, unknown>` |

### [express](../express/README.md)

Route registration for OAuth and webhook endpoints.

| Export | Kind | Signature |
|---|---|---|
| `registerOAuthRoutes` | function | `(router, { authorize, callback })` — mounts `GET /oauth/:provider`, `GET /oauth/:provider/callback` |
| `registerWebhookRoutes` | function | `(router, { receive })` — mounts `POST /webhook/:provider` |
| `RouterLike`, `RouteHandler`, `RouteRequest`, `RouteResponse` | types | Structural interfaces any router (incl. Express) satisfies |

### [cli](../cli/README.md)

`flowkit` CLI internals.

| Export | Kind | Signature |
|---|---|---|
| `createProgram` | function | `(actions: { init, addProvider }) => Command` — powers the `flowkit init` / `flowkit add <provider>` binary |

### [storage](../storage/README.md)

Object storage registry (S3, Cloudinary, GCS, Azure Blob, MinIO).

| Export | Kind | Signature | Events |
|---|---|---|---|
| `StorageRegistry` | class | `.register()`, `.get()`, `.upload(name, key, data)` | `storage.uploaded` |
| `StorageProvider` | interface | `{ name, upload(key, data): Promise<{ url }> }` | |

### [sms](../sms/README.md)

SMS registry (Twilio, MSG91, AWS SNS, Vonage, Textlocal).

| Export | Kind | Signature | Events |
|---|---|---|---|
| `SmsRegistry` | class | `.register()`, `.get()`, `.send(name, to, body)` | `sms.sent`, `sms.failed` |
| `SmsProvider` | interface | `{ name, send(to, body): Promise<void> }` | |

### [oauth](../oauth/README.md)

OAuth registry (Google, GitHub, Microsoft) — PKCE, state, refresh.

| Export | Kind | Signature | Events |
|---|---|---|---|
| `OAuthRegistry` | class | `.register()`, `.get()`, `.authorize(name, state)`, `.handleCallback(name, code, state)`, `.refresh(name, refreshToken)` | `oauth.login`, `oauth.refresh` |
| `OAuthProvider`, `TokenSet` | interface | `{ name, buildAuthorizeUrl, exchangeCode, refresh }` | |

### [email](../email/README.md)

Email registry (Resend, SendGrid, SMTP, Mailgun, SES).

| Export | Kind | Signature |
|---|---|---|
| `EmailRegistry` | class | `.register()`, `.get()`, `.send(name, to, subject, body)` |
| `EmailProvider` | interface | `{ name, send(to, subject, body): Promise<void> }` |

### [otp](../otp/README.md)

OTP generation, verification, expiry, resend cooldown.

| Export | Kind | Signature |
|---|---|---|
| `OtpManager` | class | `.generate(identifier)`, `.verify(identifier, code)` |
| `CooldownError` | class | Thrown by `generate()` before cooldown elapses |

### [webhook](../webhook/README.md)

Inbound webhook signature verification.

| Export | Kind | Signature | Events |
|---|---|---|---|
| `WebhookRegistry` | class | `.register()`, `.get()`, `.receive(name, payload, signature)` | `webhook.received`, `webhook.rejected` |
| `WebhookVerifier`, `InvalidSignatureError` | interface / class | `{ name, verify(payload, signature): boolean }` | |

### [queue](../queue/README.md)

Job queue registry (BullMQ, RabbitMQ, Redis, SQS).

| Export | Kind | Signature |
|---|---|---|
| `QueueRegistry` | class | `.register()`, `.get()`, `.enqueue(name, job)`, `.dequeue(name)` |
| `MemoryQueueBackend` | class | In-memory FIFO backend, `name: "memory"` |

### [cache](../cache/README.md)

Cache registry (Memory, Redis, LRU).

| Export | Kind | Signature |
|---|---|---|
| `CacheRegistry` | class | `.register()`, `.get(name)` |
| `MemoryCacheBackend` | class | TTL-aware in-memory backend, `.get()`, `.set(key, value, ttlMs?)`, `.delete()` |

## Full example: OTP-gated signup with events

Every module below comes from the single `@flowhub/flowhub` import:

```ts
import {
  createApp,
  SmsRegistry,
  OtpManager,
  CooldownError,
  CacheRegistry,
  MemoryCacheBackend,
  retry,
} from "@flowhub/flowhub";

const app = createApp();
const sms = new SmsRegistry(app.events);
const otp = new OtpManager({ ttlMs: 5 * 60_000, cooldownMs: 30_000 });
const cache = new CacheRegistry();
cache.register(new MemoryCacheBackend());

sms.register({
  name: "twilio",
  async send(to, body) {
    /* call the real Twilio SDK */
  },
});

app.events.on("sms.sent", ({ provider, to }) => console.log(`sms sent via ${provider} to ${to}`));
app.events.on("sms.failed", ({ provider, error }) => console.error(`sms via ${provider} failed`, error));

async function sendSignupOtp(phone: string) {
  try {
    const code = otp.generate(phone);
    await retry(() => sms.send("twilio", phone, `Your code is ${code}`), { attempts: 3, delayMs: 200 });
  } catch (err) {
    if (err instanceof CooldownError) throw new Error("Please wait before requesting another code");
    throw err;
  }
}

async function verifySignupOtp(phone: string, code: string) {
  const cacheKey = `otp-verified:${phone}`;
  if (await cache.get("memory").get(cacheKey)) return true; // already verified this session
  const ok = otp.verify(phone, code);
  if (ok) await cache.get("memory").set(cacheKey, true, 10 * 60_000);
  return ok;
}
```

## Related packages

Every package in the [root README's package table](../../README.md#packages) — this is the sum of all of them, nothing more. See the [root README's Before/After section](../../README.md#before--after) for why the registry+event pattern used throughout is worth it over hand-rolled provider SDK calls.
