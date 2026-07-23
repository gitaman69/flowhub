import { EventBus } from "@flowhub/core";
import { registerWebhookRoutes, type RouteHandler, type RouterLike } from "@flowhub/express";
import { InvalidSignatureError, WebhookRegistry, type WebhookVerifier } from "@flowhub/webhook";
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

function setup() {
  const events = new EventBus();
  const webhooks = new WebhookRegistry(events);
  const verifier: WebhookVerifier = {
    name: "stripe",
    verify: (_payload, signature) => signature === "valid-sig",
  };
  webhooks.register(verifier);

  const router = createMockRouter();
  registerWebhookRoutes(router, {
    receive: async (req, res) => {
      webhooks.receive(req.params.provider!, JSON.stringify(req.body), req.headers["x-signature"] ?? "");
      res.status(200).json({ ok: true });
    },
  });

  return { events, router };
}

describe("webhook flow", () => {
  it("valid signature passes through and emits webhook.received", async () => {
    const { events, router } = setup();
    const received = vi.fn();
    events.on("webhook.received", received);

    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await router.handlers["POST /webhook/:provider"]!(
      { params: { provider: "stripe" }, body: { id: 1 }, headers: { "x-signature": "valid-sig" } },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(received).toHaveBeenCalled();
  });

  it("invalid signature is rejected and does not emit webhook.received", async () => {
    const { events, router } = setup();
    const received = vi.fn();
    const rejected = vi.fn();
    events.on("webhook.received", received);
    events.on("webhook.rejected", rejected);

    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await expect(
      router.handlers["POST /webhook/:provider"]!(
        { params: { provider: "stripe" }, body: { id: 1 }, headers: { "x-signature": "bad-sig" } },
        res,
      ),
    ).rejects.toThrow(InvalidSignatureError);

    expect(received).not.toHaveBeenCalled();
    expect(rejected).toHaveBeenCalled();
  });
});
