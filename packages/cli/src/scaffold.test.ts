import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addProviderToProject, initProject } from "./scaffold.js";

let workDir: string;

beforeEach(async () => {
  workDir = await mkdtemp(path.join(tmpdir(), "flowkit-cli-test-"));
});

afterEach(async () => {
  await rm(workDir, { recursive: true, force: true });
});

describe("initProject", () => {
  it("creates package.json, index.js, and .gitignore in the target directory", async () => {
    const target = path.join(workDir, "my-app");
    const logs: string[] = [];

    await initProject(target, (line) => logs.push(line));

    const pkg = JSON.parse(await readFile(path.join(target, "package.json"), "utf8"));
    expect(pkg.name).toBe("my-app");
    expect(pkg.dependencies).toEqual({ "@flowhub/core": "*" });

    const index = await readFile(path.join(target, "index.js"), "utf8");
    expect(index).toContain("createApp");

    expect(logs.some((l) => l.includes("create") && l.includes("package.json"))).toBe(true);
  });

  it("does not overwrite files that already exist", async () => {
    const target = path.join(workDir, "my-app");
    await initProject(target, () => {});
    const before = await readFile(path.join(target, "package.json"), "utf8");

    const logs: string[] = [];
    await initProject(target, (line) => logs.push(line));
    const after = await readFile(path.join(target, "package.json"), "utf8");

    expect(after).toBe(before);
    expect(logs.some((l) => l.includes("skip"))).toBe(true);
  });
});

describe("addProviderToProject", () => {
  it("adds the correct @flowhub/* dependency for a known provider", async () => {
    await initProject(workDir, () => {});
    const logs: string[] = [];

    await addProviderToProject("twilio", workDir, (line) => logs.push(line));

    const pkg = JSON.parse(await readFile(path.join(workDir, "package.json"), "utf8"));
    expect(pkg.dependencies["@flowhub/sms"]).toBeDefined();
    expect(logs.some((l) => l.includes("@flowhub/sms"))).toBe(true);
  });

  it("reports unknown providers without touching package.json", async () => {
    await initProject(workDir, () => {});
    const before = await readFile(path.join(workDir, "package.json"), "utf8");
    const logs: string[] = [];

    await addProviderToProject("not-a-real-provider", workDir, (line) => logs.push(line));

    const after = await readFile(path.join(workDir, "package.json"), "utf8");
    expect(after).toBe(before);
    expect(logs.some((l) => l.includes("Unknown provider"))).toBe(true);
  });

  it("errors clearly when no package.json exists yet", async () => {
    const logs: string[] = [];
    await addProviderToProject("twilio", workDir, (line) => logs.push(line));
    expect(logs.some((l) => l.includes("flowkit init"))).toBe(true);
  });
});
