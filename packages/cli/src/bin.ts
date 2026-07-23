#!/usr/bin/env node
import { createProgram } from "./index.js";

const program = createProgram({
  init(dir) {
    console.log(`flowkit: scaffolding new project in "${dir}"`);
  },
  addProvider(provider) {
    console.log(`flowkit: adding provider "${provider}"`);
  },
});

program.parseAsync(process.argv);
