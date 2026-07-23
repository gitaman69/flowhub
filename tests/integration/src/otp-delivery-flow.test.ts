import { EmailRegistry, type EmailProvider } from "@flowhub/email";
import { OtpManager } from "@flowhub/otp";
import { SmsRegistry, type SmsProvider } from "@flowhub/sms";
import { describe, expect, it, vi } from "vitest";

describe("otp delivery flow", () => {
  it("generates an OTP, delivers it via sms, and verifies it before expiry", async () => {
    let time = 0;
    const otp = new OtpManager({ now: () => time, ttlMs: 5000, cooldownMs: 1000 });
    const sms = new SmsRegistry();
    let deliveredCode = "";
    const provider: SmsProvider = {
      name: "twilio",
      send: vi.fn(async (_to, body) => {
        deliveredCode = body;
      }),
    };
    sms.register(provider);

    const code = otp.generate("+1-555-0100");
    await sms.send("twilio", "+1-555-0100", `Your code is ${code}`);

    expect(deliveredCode).toContain(code);
    expect(otp.verify("+1-555-0100", code)).toBe(true);
  });

  it("delivers via email and fails verification once expired", async () => {
    let time = 0;
    const otp = new OtpManager({ now: () => time, ttlMs: 5000 });
    const email = new EmailRegistry();
    let deliveredCode = "";
    const provider: EmailProvider = {
      name: "resend",
      send: vi.fn(async (_to, _subject, body) => {
        deliveredCode = body;
      }),
    };
    email.register(provider);

    const code = otp.generate("user@test.com");
    await email.send("resend", "user@test.com", "Your code", `Code: ${code}`);
    expect(deliveredCode).toContain(code);

    time += 5001;
    expect(otp.verify("user@test.com", code)).toBe(false);
  });

  it("blocks resend before the cooldown elapses", () => {
    let time = 0;
    const otp = new OtpManager({ now: () => time, cooldownMs: 30_000 });
    otp.generate("+1-555-0100");
    time += 5000;
    expect(() => otp.generate("+1-555-0100")).toThrow(/cooldown/i);
  });
});
