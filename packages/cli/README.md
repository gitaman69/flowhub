# @flowhub/cli

`flowkit init [dir]` and `flowkit add <provider>` — built on [Commander](https://github.com/tj/commander.js). `createProgram(actions)` exposes the wiring for testing; `bin.ts` is the real executable entry point installed as the `flowkit` binary.

← [Back to root README](../../README.md) · Part of the [FlowKit](../../README.md) toolkit.

## Install

```bash
pnpm add -g @flowhub/cli
```

## Commands

| Command | Description |
|---|---|
| `flowkit init [dir]` | Scaffold a new FlowKit project in `dir` (defaults to `.`) |
| `flowkit add <provider>` | Add a provider to the current FlowKit project |

## API

### `createProgram(actions): Command`

```ts
interface CliActions {
  init(targetDir: string): void | Promise<void>;
  addProvider(provider: string): void | Promise<void>;
}
```

Returns a Commander `Command` wired to call `actions.init`/`actions.addProvider`. The published `flowkit` binary is `createProgram(realActions).parseAsync(process.argv)` — see [src/bin.ts](src/bin.ts).

## Usage

```bash
flowkit init my-app
flowkit add twilio
```

### Testing your own CLI extension without spawning a process

```ts
import { createProgram } from "@flowhub/cli";

const init = vi.fn();
const program = createProgram({ init, addProvider: vi.fn() });
await program.parseAsync(["node", "flowkit", "init", "my-app"]);
expect(init).toHaveBeenCalledWith("my-app");
```

### Building your own `init` action

```ts
const program = createProgram({
  init: async (dir) => {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, "flowkit.config.json"), "{}");
  },
  addProvider: (provider) => console.log(`TODO: scaffold provider files for ${provider}`),
});
```

## Related packages

Scaffolds a project that typically imports [`@flowhub/core`](../core/README.md) plus whichever provider packages `flowkit add` was run for.
