# @flowhub/config

Merge config objects from multiple sources, apply defaults, and fail fast when a required key is missing.

← [Back to root README](../../README.md) · Part of the [FlowKit](../../README.md) toolkit.

## Install

```bash
pnpm add @flowhub/config
```

## API

### `loadConfig(sources, options?): Record<string, unknown>`

```ts
function loadConfig(sources: Record<string, unknown>[], options?: {
  required?: string[];
  defaults?: Record<string, unknown>;
}): Record<string, unknown>;
```

Merges `sources` left to right (later sources override earlier ones), under `options.defaults`. Throws `Error("Missing required config key(s): ...")` if any key in `options.required` is still `undefined` after merging.

## Usage

### Env vars overriding a config file, with required keys enforced

```ts
import { loadConfig } from "@flowhub/config";
import fileConfig from "./flowkit.config.json";

const config = loadConfig(
  [fileConfig, { twilioAuthToken: process.env.TWILIO_AUTH_TOKEN }],
  { required: ["twilioAccountSid", "twilioAuthToken"], defaults: { region: "us-east-1" } },
);
```

### Per-environment overrides

```ts
const base = { logLevel: "info", retryAttempts: 3 };
const overrides = process.env.NODE_ENV === "production" ? { logLevel: "warn" } : {};

const config = loadConfig([base, overrides]);
```

## Related packages

Feed the result into [`@flowhub/core`](../core/README.md)'s `createApp(config)`.
