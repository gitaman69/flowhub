import { describe, expect, it, vi } from "vitest";
import { createProgram } from "./index.js";

describe("createProgram", () => {
  it("invokes init action with target directory", async () => {
    const init = vi.fn();
    const program = createProgram({ init, addProvider: vi.fn() });
    await program.parseAsync(["node", "flowkit", "init", "my-app"]);
    expect(init).toHaveBeenCalledWith("my-app");
  });

  it("defaults init directory to \".\" when omitted", async () => {
    const init = vi.fn();
    const program = createProgram({ init, addProvider: vi.fn() });
    await program.parseAsync(["node", "flowkit", "init"]);
    expect(init).toHaveBeenCalledWith(".");
  });

  it("invokes addProvider action with provider name", async () => {
    const addProvider = vi.fn();
    const program = createProgram({ init: vi.fn(), addProvider });
    await program.parseAsync(["node", "flowkit", "add", "twilio"]);
    expect(addProvider).toHaveBeenCalledWith("twilio");
  });
});
