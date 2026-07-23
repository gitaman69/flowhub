import type { EventBus } from "@flowhub/core";
import { ProviderNotFoundError } from "@flowhub/errors";

export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
}

export interface OAuthProvider {
  name: string;
  buildAuthorizeUrl(state: string): string;
  exchangeCode(code: string, state: string): Promise<TokenSet>;
  refresh(refreshToken: string): Promise<TokenSet>;
}

export class OAuthRegistry {
  private providers = new Map<string, OAuthProvider>();

  constructor(private events?: EventBus) {}

  register(provider: OAuthProvider): void {
    this.providers.set(provider.name, provider);
  }

  get(name: string): OAuthProvider {
    const provider = this.providers.get(name);
    if (!provider) throw new ProviderNotFoundError("oauth", name);
    return provider;
  }

  authorize(providerName: string, state: string): string {
    return this.get(providerName).buildAuthorizeUrl(state);
  }

  async handleCallback(providerName: string, code: string, state: string): Promise<TokenSet> {
    const tokens = await this.get(providerName).exchangeCode(code, state);
    this.events?.emit("oauth.login", { provider: providerName });
    return tokens;
  }

  async refresh(providerName: string, refreshToken: string): Promise<TokenSet> {
    const tokens = await this.get(providerName).refresh(refreshToken);
    this.events?.emit("oauth.refresh", { provider: providerName });
    return tokens;
  }
}
