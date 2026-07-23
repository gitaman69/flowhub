import type { EventBus } from "@flowhub/core";
import { ProviderNotFoundError } from "@flowhub/errors";

export interface SmsProvider {
  name: string;
  send(to: string, body: string): Promise<void>;
}

export class SmsRegistry {
  private providers = new Map<string, SmsProvider>();

  constructor(private events?: EventBus) {}

  register(provider: SmsProvider): void {
    this.providers.set(provider.name, provider);
  }

  get(name: string): SmsProvider {
    const provider = this.providers.get(name);
    if (!provider) throw new ProviderNotFoundError("sms", name);
    return provider;
  }

  async send(providerName: string, to: string, body: string): Promise<void> {
    const provider = this.get(providerName);
    try {
      await provider.send(to, body);
      this.events?.emit("sms.sent", { provider: providerName, to });
    } catch (error) {
      this.events?.emit("sms.failed", { provider: providerName, to, error });
      throw error;
    }
  }
}
