import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const PROVIDER_TO_MODULE: Record<string, string> = {
  twilio: "sms",
  msg91: "sms",
  sns: "sms",
  vonage: "sms",
  textlocal: "sms",
  resend: "email",
  sendgrid: "email",
  smtp: "email",
  mailgun: "email",
  ses: "email",
  google: "oauth",
  github: "oauth",
  microsoft: "oauth",
  s3: "storage",
  cloudinary: "storage",
  gcs: "storage",
  "azure-blob": "storage",
  minio: "storage",
  stripe: "webhook",
  bullmq: "queue",
  rabbitmq: "queue",
  sqs: "queue",
  redis: "cache",
  lru: "cache",
};

const MODULE_TO_REGISTRY: Record<string, string> = {
  sms: "SmsRegistry",
  email: "EmailRegistry",
  oauth: "OAuthRegistry",
  storage: "StorageRegistry",
  webhook: "WebhookRegistry",
  queue: "QueueRegistry",
  cache: "CacheRegistry",
};

async function exists(target: string): Promise<boolean> {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function writeIfMissing(filePath: string, content: string, log: (line: string) => void): Promise<void> {
  if (await exists(filePath)) {
    log(`  skip    ${filePath} (already exists)`);
    return;
  }
  await writeFile(filePath, content);
  log(`  create  ${filePath}`);
}

export async function initProject(dir: string, log: (line: string) => void = console.log): Promise<void> {
  await mkdir(dir, { recursive: true });
  const name = path.basename(path.resolve(dir));

  await writeIfMissing(
    path.join(dir, "package.json"),
    JSON.stringify(
      {
        name,
        version: "0.0.1",
        private: true,
        type: "module",
        scripts: { start: "node index.js" },
        dependencies: { "@flowhub/core": "*" },
      },
      null,
      2,
    ) + "\n",
    log,
  );

  await writeIfMissing(
    path.join(dir, "index.js"),
    `import { createApp } from "@flowhub/core";

const app = createApp();
app.events.on("app.ready", () => console.log("FlowKit app ready"));
app.events.emit("app.ready");

console.log('Run "flowkit add <provider>" to wire up sms, email, oauth, storage, webhook, queue, or cache.');
`,
    log,
  );

  await writeIfMissing(path.join(dir, ".gitignore"), "node_modules\n", log);

  log("");
  log("Next steps:");
  log(`  cd ${dir}`);
  log("  npm install");
  log("  npm start");
}

export async function addProviderToProject(
  provider: string,
  cwd: string,
  log: (line: string) => void = console.log,
): Promise<void> {
  const mod = PROVIDER_TO_MODULE[provider];
  if (!mod) {
    log(`Unknown provider "${provider}". Known providers: ${Object.keys(PROVIDER_TO_MODULE).sort().join(", ")}`);
    return;
  }

  const pkgPath = path.join(cwd, "package.json");
  if (!(await exists(pkgPath))) {
    log(`No package.json found in ${cwd} — run "flowkit init" first.`);
    return;
  }

  const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
  pkg.dependencies = pkg.dependencies ?? {};
  const depName = `@flowhub/${mod}`;
  const alreadyPresent = depName in pkg.dependencies;
  pkg.dependencies[depName] = pkg.dependencies[depName] ?? "*";
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  const registryClass = MODULE_TO_REGISTRY[mod];
  log(`  update  package.json${alreadyPresent ? ` (${depName} already present)` : ` (+${depName})`}`);
  log("");
  log(`Run "npm install", then:`);
  log("");
  log(`  import { ${registryClass} } from "${depName}";`);
  log("");
  log(`  const ${mod} = new ${registryClass}(app.events);`);
  log(`  ${mod}.register({ name: "${provider}", /* implement the provider */ });`);
}
