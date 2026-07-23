import { EventBus } from "@flowhub/core";
import { registerOAuthRoutes, type RouteHandler, type RouterLike } from "@flowhub/express";
import { OAuthRegistry, type OAuthProvider } from "@flowhub/oauth";
import { describe, expect, it, vi } from "vitest";

function createMockRouter(): RouterLike & { handlers: Record<string, RouteHandler> } {
  const handlers: Record<string, RouteHandler> = {};
  return {
    handlers,
    get(path, handler) {
      handlers[`GET ${path}`] = handler;
    },
    post(path, handler) {
      handlers[`POST ${path}`] = handler;
    },
  };
}

describe("oauth flow", () => {
  it("callback route exchanges the code and emits oauth.login on the shared event bus", async () => {
    const events = new EventBus();
    const loginHandler = vi.fn();
    events.on("oauth.login", loginHandler);

    const oauth = new OAuthRegistry(events);
    const provider: OAuthProvider = {
      name: "google",
      buildAuthorizeUrl: (state) => `https://accounts.google.test/authorize?state=${state}`,
      exchangeCode: async () => ({ accessToken: "at", refreshToken: "rt" }),
      refresh: async () => ({ accessToken: "at2" }),
    };
    oauth.register(provider);

    const router = createMockRouter();
    registerOAuthRoutes(router, {
      authorize: (req, res) => {
        res.json({ url: oauth.authorize(req.params.provider!, "state123") });
      },
      callback: async (req, res) => {
        const tokens = await oauth.handleCallback(req.params.provider!, "code123", "state123");
        res.json(tokens);
      },
    });

    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await router.handlers["GET /oauth/:provider/callback"]!(
      { params: { provider: "google" }, headers: {} },
      res,
    );

    expect(res.json).toHaveBeenCalledWith({ accessToken: "at", refreshToken: "rt" });
    expect(loginHandler).toHaveBeenCalledWith({ provider: "google" });
  });
});
