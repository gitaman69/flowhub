#!/usr/bin/env node
import { createProgram } from "./index.js";
import { addProviderToProject, initProject } from "./scaffold.js";

const program = createProgram({
  init(dir) {
    return initProject(dir);
  },
  addProvider(provider) {
    return addProviderToProject(provider, process.cwd());
  },
});

program.parseAsync(process.argv);
