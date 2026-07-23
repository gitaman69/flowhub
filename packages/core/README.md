# @flowhub/core

Configuration, lifecycle, plugin loading, dependency injection, and events — the foundation every other `@flowhub/*` package builds on.

← [Back to root README](../../README.md) · Part of the [FlowKit](../../README.md) toolkit.

## Install

```bash
pnpm add @flowhub/core
```

## API

### `createApp(config?): FlowKitApp`

Factory for a `FlowKitApp` instance. `config` is a plain object, stored as-is on `app.config`.

### `class FlowKitApp`

| Member | Signature | Description |
|---|---|---|
| `events` | `EventBus` | Shared event bus — pass this into every `*Registry` you construct |
| `config` | `Record<string, unknown>` | Whatever you passed to `createApp()` |
| `register(token, service)` | `<T>(token: string, service: T): void` | Store a service under a string token |
| `resolve(token)` | `<T>(token: string): T` | Look up a service; throws if the token was never registered |
| `use(plugin)` | `(plugin: Plugin) => Promise<void>` | Run `plugin.setup(app)`; throws if a plugin with that `name` is already registered |
| `hasPlugin(name)` | `(name: string) => boolean` | Check whether a plugin has been registered |

### `class EventBus`

| Member | Signature | Description |
|---|---|---|
| `on(event, handler)` | `<T>(event: string, handler: (payload: T) => void) => () => void` | Subscribe; returns an unsubscribe function |
| `off(event, handler)` | `(event: string, handler) => void` | Unsubscribe explicitly |
| `emit(event, payload?)` | `<T>(event: string, payload?: T) => void` | Synchronously calls every subscribed handler |

### `interface Plugin`

```ts
interface Plugin {
  name: string;
  setup(app: FlowKitApp): void | Promise<void>;
}
```

## Usage

### Wiring the event bus once, for every module

Every `@flowhub/sms`, `@flowhub/oauth`, `@flowhub/storage`, and `@flowhub/webhook` registry accepts an `EventBus` in its constructor. Wire it once at app startup and every registry's events land in the same place:

```ts
import { createApp } from "@flowhub/core";
import { SmsRegistry } from "@flowhub/sms";
import { OAuthRegistry } from "@flowhub/oauth";

const app = createApp({ env: process.env.NODE_ENV });

const sms = new SmsRegistry(app.events);
const oauth = new OAuthRegistry(app.events);

// one listener, fires for every registry that shares this bus
app.events.on("sms.sent", (payload) => metrics.increment("sms.sent", { provider: payload.provider }));
app.events.on("oauth.login", (payload) => metrics.increment("oauth.login", { provider: payload.provider }));
```

### Dependency injection for cross-cutting services

```ts
import { createLogger } from "@flowhub/logger";

app.register("logger", createLogger({ level: "info" }));

// anywhere else in the app, without threading the logger through every function signature:
const logger = app.resolve<ReturnType<typeof createLogger>>("logger");
logger.info("request handled");
```

### Plugins for setup that needs to run once, in order

```ts
await app.use({
  name: "sentry",
  setup(app) {
    app.events.on("sms.failed", (p) => Sentry.captureException(p.error));
  },
});

await app.use({ name: "sentry", setup() {} }); // throws — plugin names are unique
```

## Related packages

- [`@flowhub/errors`](../errors/README.md) — error types thrown across the toolkit
- [`@flowhub/sms`](../sms/README.md), [`@flowhub/oauth`](../oauth/README.md), [`@flowhub/storage`](../storage/README.md), [`@flowhub/webhook`](../webhook/README.md) — registries that emit onto this `EventBus`
