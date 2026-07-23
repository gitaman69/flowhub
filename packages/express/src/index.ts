export type RouteHandler = (req: RouteRequest, res: RouteResponse) => void | Promise<void>;

export interface RouteRequest {
  params: Record<string, string>;
  body?: unknown;
  headers: Record<string, string | undefined>;
}

export interface RouteResponse {
  status(code: number): RouteResponse;
  json(body: unknown): void;
}

export interface RouterLike {
  get(path: string, handler: RouteHandler): void;
  post(path: string, handler: RouteHandler): void;
}

export interface OAuthHandlers {
  authorize: RouteHandler;
  callback: RouteHandler;
}

export interface WebhookHandlers {
  receive: RouteHandler;
}

export function registerOAuthRoutes(router: RouterLike, handlers: OAuthHandlers): void {
  router.get("/oauth/:provider", handlers.authorize);
  router.get("/oauth/:provider/callback", handlers.callback);
}

export function registerWebhookRoutes(router: RouterLike, handlers: WebhookHandlers): void {
  router.post("/webhook/:provider", handlers.receive);
}
