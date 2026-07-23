# @flowhub/express

Automatic route registration for FlowKit's HTTP surface: OAuth authorize/callback and inbound webhooks. Works against any router matching the minimal `RouterLike` interface — Express routers satisfy it structurally, no `@types/express` dependency required.

← [Back to root README](../../README.md) · Part of the [FlowKit](../../README.md) toolkit.

## Install

```bash
pnpm add @flowhub/express express
```

## API

### `registerOAuthRoutes(router, handlers)`

Mounts `GET /oauth/:provider` → `handlers.authorize` and `GET /oauth/:provider/callback` → `handlers.callback`.

### `registerWebhookRoutes(router, handlers)`

Mounts `POST /webhook/:provider` → `handlers.receive`.

### Types

```ts
interface RouteRequest {
  params: Record<string, string>;
  body?: unknown;
  headers: Record<string, string | undefined>;
}
interface RouteResponse {
  status(code: number): RouteResponse;
  json(body: unknown): void;
}
type RouteHandler = (req: RouteRequest, res: RouteResponse) => void | Promise<void>;
interface RouterLike {
  get(path: string, handler: RouteHandler): void;
  post(path: string, handler: RouteHandler): void;
}
```

## Usage

### Mounting on a real Express app

```ts
import express from "express";
import { registerOAuthRoutes, registerWebhookRoutes } from "@flowhub/express";
import { OAuthRegistry } from "@flowhub/oauth";
import { WebhookRegistry, InvalidSignatureError } from "@flowhub/webhook";

const app = express();
const oauth = new OAuthRegistry(flowkitApp.events);
const webhooks = new WebhookRegistry(flowkitApp.events);

registerOAuthRoutes(app, {
  authorize: (req, res) => res.json({ url: oauth.authorize(req.params.provider, crypto.randomUUID()) }),
  callback: async (req, res) => res.json(await oauth.handleCallback(req.params.provider, req.query.code as string, req.query.state as string)),
});

registerWebhookRoutes(app, {
  receive: async (req, res) => {
    try {
      webhooks.receive(req.params.provider, JSON.stringify(req.body), req.headers["x-signature"] as string);
      res.status(200).json({ ok: true });
    } catch (err) {
      if (err instanceof InvalidSignatureError) return res.status(400).json({ error: err.message });
      throw err;
    }
  },
});
```

### One handler, many providers — no per-provider route wiring

Every provider registered on `oauth`/`webhooks` is reachable through the same two routes; adding `oauth.register({ name: "github", ... })` needs no new `app.get(...)` call.

## Related packages

- [`@flowhub/oauth`](../oauth/README.md) — provides the `authorize`/`handleCallback` logic behind these routes
- [`@flowhub/webhook`](../webhook/README.md) — provides the `receive` logic behind the webhook route
