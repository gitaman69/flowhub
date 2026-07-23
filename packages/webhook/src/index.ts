import type { EventBus } from "@flowhub/core";
import { FlowKitError, ProviderNotFoundError } from "@flowhub/errors";

export interface WebhookVerifier {
  name: string;
  verify(payload: string, signature: string): boolean;
}

export class InvalidSignatureError extends FlowKitError {
  constructor(provider: string) {
    super(`Invalid webhook signature for provider "${provider}"`, { code: "INVALID_SIGNATURE" });
    this.name = "InvalidSignatureError";
  }
}

export class WebhookRegistry {
  private verifiers = new Map<string, WebhookVerifier>();

  constructor(private events?: EventBus) {}

  register(verifier: WebhookVerifier): void {
    this.verifiers.set(verifier.name, verifier);
  }

  get(name: string): WebhookVerifier {
    const verifier = this.verifiers.get(name);
    if (!verifier) throw new ProviderNotFoundError("webhook", name);
    return verifier;
  }

  receive(providerName: string, payload: string, signature: string): void {
    const verifier = this.get(providerName);
    if (!verifier.verify(payload, signature)) {
      this.events?.emit("webhook.rejected", { provider: providerName });
      throw new InvalidSignatureError(providerName);
    }
    this.events?.emit("webhook.received", { provider: providerName, payload });
  }
}
