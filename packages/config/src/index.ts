export type ConfigSource = Record<string, unknown>;

export interface LoadConfigOptions {
  required?: string[];
  defaults?: ConfigSource;
}

export function loadConfig(sources: ConfigSource[], options: LoadConfigOptions = {}): ConfigSource {
  const merged = sources.reduce<ConfigSource>(
    (acc, source) => ({ ...acc, ...source }),
    { ...(options.defaults ?? {}) },
  );

  const missing = (options.required ?? []).filter((key) => merged[key] === undefined);
  if (missing.length > 0) {
    throw new Error(`Missing required config key(s): ${missing.join(", ")}`);
  }

  return merged;
}
