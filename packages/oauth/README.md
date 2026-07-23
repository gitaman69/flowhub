# @flowhub/oauth

Provider-agnostic OAuth registry — Google, GitHub, Microsoft, or any provider that can build an authorize URL and exchange/refresh tokens.

← [Back to root README](../../README.md) · Part of the [FlowKit](../../README.md) toolkit.

## Install

```bash
pnpm add @flowhub/oauth @flowhub/core @flowhub/errors
```

## API

### `interface OAuthProvider`

```ts
interface OAuthProvider {
  name: string;
  buildAuthorizeUrl(state: string): string;
  exchangeCode(code: string, state: string): Promise<TokenSet>;
  refresh(refreshToken: string): Promise<TokenSet>;
}
interface TokenSet {
  accessToken: string;
  refreshToken?: string;
}
```

### `class OAuthRegistry`

```ts
new OAuthRegistry(events?: EventBus)
```

| Method | Description |
|---|---|
| `register(provider)` | Add a provider under `provider.name` |
| `get(name)` | Look up a provider; throws `ProviderNotFoundError` if unregistered |
| `authorize(name, state)` | Returns `provider.buildAuthorizeUrl(state)` |
| `handleCallback(name, code, state)` | Calls `provider.exchangeCode()`, emits `oauth.login`, returns the `TokenSet` |
| `refresh(name, refreshToken)` | Calls `provider.refresh()`, emits `oauth.refresh`, returns the `TokenSet` |

## Events

| Event | Payload | Emitted when |
|---|---|---|
| `oauth.login` | `{ provider }` | `handleCallback()` resolves |
| `oauth.refresh` | `{ provider }` | `refresh()` resolves |

## Usage

### Implementing a Google provider

```ts
import { OAuthRegistry } from "@flowhub/oauth";

const oauth = new OAuthRegistry(app.events);

oauth.register({
  name: "google",
  buildAuthorizeUrl: (state) =>
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=openid+email&state=${state}`,
  async exchangeCode(code, state) {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      body: new URLSearchParams({ code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET, grant_type: "authorization_code" }),
    });
    const { access_token, refresh_token } = await res.json();
    return { accessToken: access_token, refreshToken: refresh_token };
  },
  async refresh(refreshToken) {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      body: new URLSearchParams({ refresh_token: refreshToken, client_id: CLIENT_ID, client_secret: CLIENT_SECRET, grant_type: "refresh_token" }),
    });
    const { access_token } = await res.json();
    return { accessToken: access_token };
  },
});
```

### Mounting routes with `@flowhub/express`

```ts
import { registerOAuthRoutes } from "@flowhub/express";

registerOAuthRoutes(app, {
  authorize: (req, res) => res.json({ url: oauth.authorize(req.params.provider, crypto.randomUUID()) }),
  callback: async (req, res) => res.json(await oauth.handleCallback(req.params.provider, req.query.code, req.query.state)),
});
```

### Caching the access token to skip redundant refreshes

```ts
import { CacheRegistry, MemoryCacheBackend } from "@flowhub/cache";

const cache = new CacheRegistry();
cache.register(new MemoryCacheBackend());

async function getAccessToken(userId: string, refreshToken: string) {
  const backend = cache.get("memory");
  const cached = await backend.get(`token:${userId}`);
  if (cached) return cached as string;
  const { accessToken } = await oauth.refresh("google", refreshToken);
  await backend.set(`token:${userId}`, accessToken, 55 * 60_000);
  return accessToken;
}
```

See the [root README's Before/After section](../../README.md#before--after) for the full comparison against hand-rolled cache logic.

### Adding a second provider without touching route handlers

```ts
oauth.register({ name: "github", buildAuthorizeUrl, exchangeCode, refresh });
// GET /oauth/github and /oauth/github/callback now work — no route changes
```

## Related packages

- [`@flowhub/core`](../core/README.md) — `EventBus` this registry emits onto
- [`@flowhub/errors`](../errors/README.md) — `ProviderNotFoundError`
- [`@flowhub/express`](../express/README.md) — mounts `/oauth/:provider` and `/oauth/:provider/callback`
- [`@flowhub/cache`](../cache/README.md) — cache access tokens between refreshes
