import { describe, expect, it, vi } from "vitest";
import { retry } from "./index.js";

describe("retry", () => {
  it("succeeds after N failures", async () => {
    let calls = 0;
    const fn = vi.fn(() => {
      calls++;
      if (calls < 3) throw new Error("fail");
      return "ok";
    });
    const result = await retry(fn, { attempts: 5 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("respects max attempts and rethrows last error", async () => {
    const fn = vi.fn(() => {
      throw new Error("always fails");
    });
    await expect(retry(fn, { attempts: 2 })).rejects.toThrow("always fails");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("applies exponential backoff delay", async () => {
    vi.useFakeTimers();
    let calls = 0;
    const fn = vi.fn(() => {
      calls++;
      if (calls < 3) throw new Error("fail");
      return "ok";
    });

    const promise = retry(fn, { attempts: 3, delayMs: 10, backoff: "exponential" });
    await vi.advanceTimersByTimeAsync(10);
    await vi.advanceTimersByTimeAsync(20);
    await expect(promise).resolves.toBe("ok");
    vi.useRealTimers();
  });
});
