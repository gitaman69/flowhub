import { describe, expect, it, vi } from "vitest";
import { createLogger } from "./index.js";

describe("Logger", () => {
  it("suppresses levels below the configured threshold", () => {
    const sink = vi.fn();
    const logger = createLogger({ level: "warn", sink });
    logger.debug("debug message");
    logger.info("info message");
    expect(sink).not.toHaveBeenCalled();
  });

  it("passes through levels at or above the threshold", () => {
    const sink = vi.fn();
    const logger = createLogger({ level: "warn", sink });
    logger.warn("warn message");
    logger.error("error message");
    expect(sink).toHaveBeenCalledTimes(2);
    expect(sink).toHaveBeenCalledWith("warn", "warn message", undefined);
  });

  it("forwards metadata to the sink", () => {
    const sink = vi.fn();
    const logger = createLogger({ level: "debug", sink });
    logger.info("with meta", { userId: 1 });
    expect(sink).toHaveBeenCalledWith("info", "with meta", { userId: 1 });
  });
});
