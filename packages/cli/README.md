# @flowhub/cli

`flowkit init [dir]` and `flowkit add <provider>` — built on [Commander](https://github.com/tj/commander.js). `createProgram(actions)` exposes the wiring for testing; `bin.ts` is the real executable entry point installed as the `flowkit` binary, backed by [`src/scaffold.ts`](src/scaffold.ts) for the actual file I/O.

← [Back to root README](../../README.md) · Part of the [FlowKit](../../README.md) toolkit. See the root README's [Try it in 60 seconds](../../README.md#try-it-in-60-seconds) for a full real-terminal walkthrough.

## Install

```bash
npm add -g @flowhub/cli
```

## Commands

| Command | Description |
|---|---|
| `flowkit init [dir]` | Scaffold a new project in `dir` (defaults to `.`): `package.json` (with `@flowhub/core` dependency), a starter `index.js`, and `.gitignore`. Skips any file that already exists instead of overwriting it. |
| `flowkit add <provider>` | Look up which `@flowhub/*` module a provider name belongs to, add it as a dependency in the current directory's `package.json`, and print an import + registration snippet for it. |

### Known providers for `add`

| Provider names | Module added |
|---|---|
| `twilio`, `msg91`, `sns`, `vonage`, `textlocal` | `@flowhub/sms` |
| `resend`, `sendgrid`, `smtp`, `mailgun`, `ses` | `@flowhub/email` |
| `google`, `github`, `microsoft` | `@flowhub/oauth` |
| `s3`, `cloudinary`, `gcs`, `azure-blob`, `minio` | `@flowhub/storage` |
| `stripe` | `@flowhub/webhook` |
| `bullmq`, `rabbitmq`, `sqs` | `@flowhub/queue` |
| `redis`, `lru` | `@flowhub/cache` |

An unrecognized provider name prints the list above instead of guessing.

## API

### `createProgram(actions): Command`

```ts
interface CliActions {
  init(targetDir: string): void | Promise<void>;
  addProvider(provider: string): void | Promise<void>;
}
```

Returns a Commander `Command` wired to call `actions.init`/`actions.addProvider`. The published `flowkit` binary is `createProgram({ init: initProject, addProvider: (p) => addProviderToProject(p, process.cwd()) }).parseAsync(process.argv)` — see [src/bin.ts](src/bin.ts).

### `initProject(dir, log?): Promise<void>` / `addProviderToProject(provider, cwd, log?): Promise<void>`

The real scaffolding logic, exported from [src/scaffold.ts](src/scaffold.ts) so it's unit-testable without mocking `console` — pass a `log` callback to capture output (defaults to `console.log`).

## Usage

```bash
flowkit init my-app
cd my-app && npm install
flowkit add twilio
npm install && npm start
```

### Testing your own CLI extension without spawning a process

```ts
import { createProgram } from "@flowhub/cli";

const init = vi.fn();
const program = createProgram({ init, addProvider: vi.fn() });
await program.parseAsync(["node", "flowkit", "init", "my-app"]);
expect(init).toHaveBeenCalledWith("my-app");
```

### Testing the real scaffolding logic

`scaffold.ts` isn't part of this package's public `exports` map — it's exercised directly inside this repo ([src/scaffold.test.ts](src/scaffold.test.ts)), not imported by consumers:

```ts
import { initProject } from "./scaffold.js";

const logs: string[] = [];
await initProject("/tmp/my-app", (line) => logs.push(line));
```

## Related packages

Scaffolds a project that imports [`@flowhub/core`](../core/README.md), then wires in whichever provider packages `flowkit add` was run for (`@flowhub/sms`, `@flowhub/oauth`, `@flowhub/storage`, `@flowhub/email`, `@flowhub/webhook`, `@flowhub/queue`, `@flowhub/cache`).
