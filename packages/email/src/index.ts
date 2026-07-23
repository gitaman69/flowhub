import { ProviderNotFoundError } from "@flowhub/errors";

export interface EmailProvider {
  name: string;
  send(to: string, subject: string, body: string): Promise<void>;
}

export class EmailRegistry {
  private providers = new Map<string, EmailProvider>();

  register(provider: EmailProvider): void {
    this.providers.set(provider.name, provider);
  }

  get(name: string): EmailProvider {
    const provider = this.providers.get(name);
    if (!provider) throw new ProviderNotFoundError("email", name);
    return provider;
  }

  async send(providerName: string, to: string, subject: string, body: string): Promise<void> {
    return this.get(providerName).send(to, subject, body);
  }
}
