import { describe, expect, it } from "vitest";
import { loadConfig } from "./index.js";

describe("loadConfig", () => {
  it("merges sources left to right, later overriding earlier", () => {
    const config = loadConfig([{ a: 1, b: 1 }, { b: 2 }]);
    expect(config).toEqual({ a: 1, b: 2 });
  });

  it("applies defaults under all sources", () => {
    const config = loadConfig([{ a: 1 }], { defaults: { a: 0, b: 0 } });
    expect(config).toEqual({ a: 1, b: 0 });
  });

  it("throws when a required key is missing", () => {
    expect(() => loadConfig([{ a: 1 }], { required: ["a", "b"] })).toThrow(/b/);
  });

  it("passes when all required keys are present", () => {
    const config = loadConfig([{ a: 1, b: 2 }], { required: ["a", "b"] });
    expect(config).toEqual({ a: 1, b: 2 });
  });
});
