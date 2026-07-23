# Changelog

All notable changes to the `@flowhub/*` packages are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions are per-package but released together while the toolkit is pre-1.0.

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
