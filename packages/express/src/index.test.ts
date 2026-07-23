import { describe, expect, it, vi } from "vitest";
import { registerOAuthRoutes, registerWebhookRoutes, type RouterLike } from "./index.js";

function createMockRouter(): RouterLike & { routes: Record<string, unknown> } {
  const routes: Record<string, unknown> = {};
  return {
    routes,
    get(path, handler) {
      routes[`GET ${path}`] = handler;
    },
    post(path, handler) {
      routes[`POST ${path}`] = handler;
    },
  };
}

describe("registerOAuthRoutes", () => {
  it("registers authorize and callback paths", () => {
    const router = createMockRouter();
    const authorize = vi.fn();
    const callback = vi.fn();
    registerOAuthRoutes(router, { authorize, callback });
    expect(router.routes["GET /oauth/:provider"]).toBe(authorize);
    expect(router.routes["GET /oauth/:provider/callback"]).toBe(callback);
  });
});

describe("registerWebhookRoutes", () => {
  it("registers the webhook receive path", () => {
    const router = createMockRouter();
    const receive = vi.fn();
    registerWebhookRoutes(router, { receive });
    expect(router.routes["POST /webhook/:provider"]).toBe(receive);
  });
});
