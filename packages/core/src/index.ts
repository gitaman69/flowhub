export type EventHandler<T = unknown> = (payload: T) => void;

export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();

  on<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    const set = this.handlers.get(event) ?? new Set();
    set.add(handler as EventHandler);
    this.handlers.set(event, set);
    return () => this.off(event, handler as EventHandler);
  }

  off(event: string, handler: EventHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  emit<T = unknown>(event: string, payload?: T): void {
    for (const handler of this.handlers.get(event) ?? []) {
      handler(payload);
    }
  }
}

export interface Plugin {
  name: string;
  setup(app: FlowKitApp): void | Promise<void>;
}

export class FlowKitApp {
  readonly events = new EventBus();
  readonly config: Record<string, unknown>;
  private services = new Map<string, unknown>();
  private plugins = new Map<string, Plugin>();

  constructor(config: Record<string, unknown> = {}) {
    this.config = config;
  }

  register<T>(token: string, service: T): void {
    this.services.set(token, service);
  }

  resolve<T>(token: string): T {
    if (!this.services.has(token)) {
      throw new Error(`FlowKit: no service registered for token "${token}"`);
    }
    return this.services.get(token) as T;
  }

  async use(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`FlowKit: plugin "${plugin.name}" already registered`);
    }
    this.plugins.set(plugin.name, plugin);
    await plugin.setup(this);
  }

  hasPlugin(name: string): boolean {
    return this.plugins.has(name);
  }
}

export function createApp(config?: Record<string, unknown>): FlowKitApp {
  return new FlowKitApp(config);
}
