import { createApp } from "@flowhub/core";
import { createProgram } from "@flowhub/cli";
import { describe, expect, it, vi } from "vitest";

describe("init flow", () => {
  it("flowkit init wires a scaffolded project onto a FlowKit app with a plugin", async () => {
    const app = createApp();
    const setup = vi.fn();

    const program = createProgram({
      init: async (dir) => {
        await app.use({ name: "scaffold", setup });
        app.config.initializedIn = dir;
      },
      addProvider: vi.fn(),
    });

    await program.parseAsync(["node", "flowkit", "init", "my-app"]);

    expect(app.hasPlugin("scaffold")).toBe(true);
    expect(setup).toHaveBeenCalledWith(app);
    expect(app.config.initializedIn).toBe("my-app");
  });
});
