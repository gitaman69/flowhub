# Changelog

All notable changes to the `@flowhub/*` packages are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions are per-package but released together while the toolkit is pre-1.0.

## [0.0.4] - 2026-07-23 (@flowhub/otp only)

### Fixed

- `@flowhub/otp` — resend cooldown was tracked on the same entry `verify()` deletes on success (or lazily deletes on expiry-check), so a successful `verify()` silently reset the cooldown timer. A caller could `generate()` → `verify()` (success) → `generate()` again instantly, bypassing the rate limit meant to throttle SMS/email sends. Cooldown timestamps now live independently of the OTP entry and survive both successful verification and lazy expiry cleanup. Found by cross-checking all 16 published packages against real installs after the `@flowhub/cli` fix below.

## [0.0.3] - 2026-07-23

### Fixed

- `@flowhub/cli` — `flowkit init` and `flowkit add <provider>` were no-ops (logged a message, wrote nothing). `init` now scaffolds a real `package.json`/`index.js`/`.gitignore`; `add <provider>` now adds the correct `@flowhub/*` dependency and prints a wiring snippet.

## [0.0.2] - 2026-07-23

Version bump for the original 15 packages (`core` through `cache`) to carry the changes below onto their npm registry pages.

### Added

- `@flowhub/flowhub@0.0.1` — new meta-package re-exporting all 15 `@flowhub/*` packages for a single-install convenience option

### Changed

- Added `keywords` to every package for npm discoverability
- Added `repository`/`homepage`/`bugs` fields pointing at the GitHub repo

## [0.0.1] - 2026-07-23

Initial release of all 15 packages.

### Added

- `@flowhub/core` — `createApp`, `EventBus`, plugin lifecycle, DI container
- `@flowhub/errors` — `FlowKitError`, `ProviderNotFoundError`
- `@flowhub/retry` — `retry()` with fixed/exponential backoff
- `@flowhub/logger` — leveled logger with pluggable sink
- `@flowhub/config` — `loadConfig()` merge + required-key validation
- `@flowhub/express` — `registerOAuthRoutes`, `registerWebhookRoutes`
- `@flowhub/cli` — `flowkit init` / `flowkit add <provider>`
- `@flowhub/storage` — `StorageRegistry`, emits `storage.uploaded`
- `@flowhub/sms` — `SmsRegistry`, emits `sms.sent` / `sms.failed`
- `@flowhub/oauth` — `OAuthRegistry`, emits `oauth.login` / `oauth.refresh`
- `@flowhub/email` — `EmailRegistry`
- `@flowhub/otp` — `OtpManager`, `CooldownError`
- `@flowhub/webhook` — `WebhookRegistry`, `InvalidSignatureError`, emits `webhook.received` / `webhook.rejected`
- `@flowhub/queue` — `QueueRegistry`, `MemoryQueueBackend`
- `@flowhub/cache` — `CacheRegistry`, `MemoryCacheBackend`
