# @flowhub/webhook

Signature verification and event dispatch for inbound webhooks — Stripe, GitHub, or any provider whose payloads you can verify with a shared secret or public key.

← [Back to root README](../../README.md) · Part of the [FlowKit](../../README.md) toolkit.

## Install

```bash
pnpm add @flowhub/webhook @flowhub/core @flowhub/errors
```

## API

### `interface WebhookVerifier`

```ts
interface WebhookVerifier {
  name: string;
  verify(payload: string, signature: string): boolean;
}
```

### `class WebhookRegistry`

```ts
new WebhookRegistry(events?: EventBus)
```

| Method | Description |
|---|---|
| `register(verifier)` | Add a verifier under `verifier.name` |
| `get(name)` | Look up a verifier; throws `ProviderNotFoundError` if unregistered |
| `receive(name, payload, signature)` | Verifies; emits `webhook.received` on success, `webhook.rejected` then throws `InvalidSignatureError` on failure |

### `class InvalidSignatureError extends FlowKitError`

`code` is `"INVALID_SIGNATURE"`.

## Events

| Event | Payload | Emitted when |
|---|---|---|
| `webhook.received` | `{ provider, payload }` | Signature is valid |
| `webhook.rejected` | `{ provider }` | Signature is invalid, before `InvalidSignatureError` is thrown |

## Usage

### Implementing a Stripe verifier

```ts
import Stripe from "stripe";
import { WebhookRegistry, InvalidSignatureError } from "@flowhub/webhook";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhooks = new WebhookRegistry(app.events);

webhooks.register({
  name: "stripe",
  verify(payload, signature) {
    try {
      stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
      return true;
    } catch {
      return false;
    }
  },
});
```

### Mounting with `@flowhub/express`

```ts
import { registerWebhookRoutes } from "@flowhub/express";

registerWebhookRoutes(app, {
  receive: async (req, res) => {
    try {
      webhooks.receive(req.params.provider, JSON.stringify(req.body), req.headers["x-signature"]);
      res.status(200).json({ ok: true });
    } catch (err) {
      if (err instanceof InvalidSignatureError) return res.status(400).json({ error: err.message });
      throw err;
    }
  },
});
```

### One audit log for every webhook provider

```ts
app.events.on("webhook.received", ({ provider, payload }) => auditLog.write({ provider, payload }));
app.events.on("webhook.rejected", ({ provider }) => auditLog.write({ provider, rejected: true }));
```

## Related packages

- [`@flowhub/core`](../core/README.md) — `EventBus` this registry emits onto
- [`@flowhub/errors`](../errors/README.md) — `ProviderNotFoundError`, base for `InvalidSignatureError`
- [`@flowhub/express`](../express/README.md) — mounts `/webhook/:provider`
