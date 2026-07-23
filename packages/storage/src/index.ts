import type { EventBus } from "@flowhub/core";
import { ProviderNotFoundError } from "@flowhub/errors";

export interface UploadResult {
  url: string;
}

export interface StorageProvider {
  name: string;
  upload(key: string, data: Uint8Array | string): Promise<UploadResult>;
}

export class StorageRegistry {
  private providers = new Map<string, StorageProvider>();

  constructor(private events?: EventBus) {}

  register(provider: StorageProvider): void {
    this.providers.set(provider.name, provider);
  }

  get(name: string): StorageProvider {
    const provider = this.providers.get(name);
    if (!provider) throw new ProviderNotFoundError("storage", name);
    return provider;
  }

  async upload(providerName: string, key: string, data: Uint8Array | string): Promise<UploadResult> {
    const result = await this.get(providerName).upload(key, data);
    this.events?.emit("storage.uploaded", { provider: providerName, key, url: result.url });
    return result;
  }
}
