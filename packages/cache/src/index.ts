import { ProviderNotFoundError } from "@flowhub/errors";

export interface CacheBackend {
  name: string;
  get(key: string): Promise<unknown | undefined>;
  set(key: string, value: unknown, ttlMs?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface MemoryCacheBackendOptions {
  now?: () => number;
}

export class MemoryCacheBackend implements CacheBackend {
  readonly name = "memory";
  private store = new Map<string, { value: unknown; expiresAt?: number }>();
  private readonly now: () => number;

  constructor(options: MemoryCacheBackendOptions = {}) {
    this.now = options.now ?? (() => Date.now());
  }

  async get(key: string): Promise<unknown | undefined> {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt !== undefined && this.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  async set(key: string, value: unknown, ttlMs?: number): Promise<void> {
    const expiresAt = ttlMs !== undefined ? this.now() + ttlMs : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

export class CacheRegistry {
  private backends = new Map<string, CacheBackend>();

  register(backend: CacheBackend): void {
    this.backends.set(backend.name, backend);
  }

  get(name: string): CacheBackend {
    const backend = this.backends.get(name);
    if (!backend) throw new ProviderNotFoundError("cache", name);
    return backend;
  }
}
