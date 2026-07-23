import { Command } from "commander";

export interface CliActions {
  init(targetDir: string): void | Promise<void>;
  addProvider(provider: string): void | Promise<void>;
}

export function createProgram(actions: CliActions): Command {
  const program = new Command("flowkit");

  program
    .command("init")
    .description("Scaffold a new FlowKit project")
    .argument("[dir]", "target directory", ".")
    .action(async (dir: string) => {
      await actions.init(dir);
    });

  program
    .command("add")
    .description("Add a provider to the current FlowKit project")
    .argument("<provider>", "provider name, e.g. twilio, stripe, resend")
    .action(async (provider: string) => {
      await actions.addProvider(provider);
    });

  return program;
}
