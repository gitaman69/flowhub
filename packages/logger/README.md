# @flowhub/logger

Minimal leveled logger — `debug`/`info`/`warn`/`error` — with a pluggable sink so tests never need to mock `console`.

← [Back to root README](../../README.md) · Part of the [FlowKit](../../README.md) toolkit.

## Install

```bash
pnpm add @flowhub/logger
```

## API

### `createLogger(options?): Logger`

```ts
interface LoggerOptions {
  level?: "debug" | "info" | "warn" | "error"; // default "info"
  sink?: (level: LogLevel, message: string, meta?: unknown) => void; // default: console
}
```

### `class Logger`

`.debug(message, meta?)`, `.info(message, meta?)`, `.warn(message, meta?)`, `.error(message, meta?)` — calls below the configured `level` are dropped before reaching the sink.

## Usage

### Registering a shared logger on the app

```ts
import { createApp } from "@flowhub/core";
import { createLogger } from "@flowhub/logger";

const app = createApp();
app.register("logger", createLogger({ level: process.env.NODE_ENV === "production" ? "warn" : "debug" }));
```

### Structured logging with a JSON sink

```ts
const logger = createLogger({
  level: "info",
  sink: (level, message, meta) => process.stdout.write(JSON.stringify({ level, message, ...meta }) + "\n"),
});

logger.info("sms sent", { provider: "twilio", to: "+15551234567" });
```

### Testing without touching `console`

```ts
import { vi } from "vitest";

const sink = vi.fn();
const logger = createLogger({ level: "warn", sink });
logger.debug("noisy"); // suppressed, sink never called
logger.warn("actual problem");
expect(sink).toHaveBeenCalledWith("warn", "actual problem", undefined);
```

## Related packages

Register alongside other cross-cutting services via [`@flowhub/core`](../core/README.md)'s `app.register()`/`app.resolve()`.
