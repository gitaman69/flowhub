# Contributing to FlowKit

## Setup

```bash
pnpm install
pnpm build
pnpm test
```

Node.js 20+ and pnpm required (see [package.json](package.json) `engines`).

## Before opening a PR

Every PR must pass, for the whole workspace:

```bash
pnpm build       # tsup build, every package
pnpm typecheck   # tsc --noEmit, every package
pnpm test        # unit tests (all 15 packages) + @flowhub/tests integration flows
```

Run a single package's scripts with `pnpm --filter @flowhub/<name> run <script>` while iterating.

## Adding a provider to an existing module

Each provider-backed package (`sms`, `email`, `oauth`, `storage`, `webhook`, `queue`, `cache`) exposes a `*Provider`/`*Verifier`/`*Backend` interface and a `*Registry`. To add a provider:

1. Implement the interface — see the package's README (e.g. [`packages/sms/README.md`](packages/sms/README.md)) for the exact shape
2. Add a unit test registering your provider against the existing `*Registry` and asserting dispatch + error behavior (see `packages/sms/src/index.test.ts` for the pattern)
3. If the provider is one of the "shipped" examples in a README, update that README's usage snippet

## Adding a new package

1. `packages/<name>/` with `package.json` (`@flowhub/<name>`, `publishConfig.access: public`, `tsup`/`vitest` scripts matching the other packages), `tsconfig.json` extending [`tsconfig.base.json`](tsconfig.base.json), `src/index.ts`, `src/index.test.ts`, `README.md`
2. Add it to [`pnpm-workspace.yaml`](pnpm-workspace.yaml) if it's outside `packages/*`/`tests/*`
3. Link it from the root [README.md](README.md) package table
4. If it emits events or is exercised by a cross-package flow, add coverage in [`tests/integration`](tests/integration)

## Commit style

Conventional-ish prefixes (`feat:`, `fix:`, `docs:`, `test:`, `chore:`) in the summary line. Explain *why*, not just *what* — the diff already shows what changed.

## Code style

- TypeScript strict mode ([tsconfig.base.json](tsconfig.base.json)) — no `any` escapes without a good reason
- No comments explaining *what* code does; only *why*, when it's non-obvious
- Match the existing `*Registry`/`*Provider` pattern for new provider-backed packages rather than inventing a new shape

## Release / publish

Package versions are bumped and published per-package (`publishConfig.access: public`, scope `@flowhub`). Update [CHANGELOG.md](CHANGELOG.md) alongside any version bump.
