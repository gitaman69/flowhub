import { describe, expect, it } from "vitest";
import { CooldownError, OtpManager } from "./index.js";

describe("OtpManager", () => {
  it("verifies a freshly generated code", () => {
    let time = 0;
    const otp = new OtpManager({ now: () => time });
    const code = otp.generate("user-1");
    expect(otp.verify("user-1", code)).toBe(true);
  });

  it("fails verification with a wrong code", () => {
    let time = 0;
    const otp = new OtpManager({ now: () => time });
    otp.generate("user-1");
    expect(otp.verify("user-1", "000000")).toBe(false);
  });

  it("fails verification after expiry", () => {
    let time = 0;
    const otp = new OtpManager({ now: () => time, ttlMs: 1000 });
    const code = otp.generate("user-1");
    time += 1001;
    expect(otp.verify("user-1", code)).toBe(false);
  });

  it("a code can only be consumed once", () => {
    let time = 0;
    const otp = new OtpManager({ now: () => time });
    const code = otp.generate("user-1");
    expect(otp.verify("user-1", code)).toBe(true);
    expect(otp.verify("user-1", code)).toBe(false);
  });

  it("enforces resend cooldown", () => {
    let time = 0;
    const otp = new OtpManager({ now: () => time, cooldownMs: 30_000 });
    otp.generate("user-1");
    time += 1000;
    expect(() => otp.generate("user-1")).toThrow(CooldownError);
  });

  it("allows resend after cooldown elapses", () => {
    let time = 0;
    const otp = new OtpManager({ now: () => time, cooldownMs: 30_000 });
    otp.generate("user-1");
    time += 30_001;
    expect(() => otp.generate("user-1")).not.toThrow();
  });

  it("cooldown survives a successful verify — resend still blocked within the window", () => {
    let time = 0;
    const otp = new OtpManager({ now: () => time, cooldownMs: 30_000 });
    const code = otp.generate("user-1");
    expect(otp.verify("user-1", code)).toBe(true);
    time += 1000; // still well inside the 30s cooldown
    expect(() => otp.generate("user-1")).toThrow(CooldownError);
  });

  it("cooldown survives an expired code being lazily deleted by verify", () => {
    let time = 0;
    const otp = new OtpManager({ now: () => time, ttlMs: 1000, cooldownMs: 30_000 });
    const code = otp.generate("user-1");
    time += 1001; // code expires
    expect(otp.verify("user-1", code)).toBe(false); // triggers lazy deletion of the entry
    // cooldown (30s from generate) has not elapsed yet
    expect(() => otp.generate("user-1")).toThrow(CooldownError);
  });
});
