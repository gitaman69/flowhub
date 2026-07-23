export interface OtpManagerOptions {
  length?: number;
  ttlMs?: number;
  cooldownMs?: number;
  now?: () => number;
}

interface OtpEntry {
  code: string;
  expiresAt: number;
}

export class CooldownError extends Error {
  constructor(retryAfterMs: number) {
    super(`Resend cooldown active, retry after ${retryAfterMs}ms`);
    this.name = "CooldownError";
  }
}

export class OtpManager {
  private entries = new Map<string, OtpEntry>();
  private lastSentAt = new Map<string, number>();
  private readonly length: number;
  private readonly ttlMs: number;
  private readonly cooldownMs: number;
  private readonly now: () => number;

  constructor(options: OtpManagerOptions = {}) {
    this.length = options.length ?? 6;
    this.ttlMs = options.ttlMs ?? 5 * 60 * 1000;
    this.cooldownMs = options.cooldownMs ?? 30 * 1000;
    this.now = options.now ?? (() => Date.now());
  }

  generate(identifier: string): string {
    const now = this.now();
    const lastSent = this.lastSentAt.get(identifier);
    if (lastSent !== undefined) {
      const elapsed = now - lastSent;
      if (elapsed < this.cooldownMs) throw new CooldownError(this.cooldownMs - elapsed);
    }

    const code = randomDigits(this.length);
    this.entries.set(identifier, { code, expiresAt: now + this.ttlMs });
    this.lastSentAt.set(identifier, now);
    return code;
  }

  verify(identifier: string, code: string): boolean {
    const entry = this.entries.get(identifier);
    if (!entry) return false;
    if (this.now() > entry.expiresAt) {
      this.entries.delete(identifier);
      return false;
    }
    const valid = entry.code === code;
    if (valid) this.entries.delete(identifier);
    return valid;
  }
}

function randomDigits(length: number): string {
  let code = "";
  for (let i = 0; i < length; i++) code += Math.floor(Math.random() * 10).toString();
  return code;
}
