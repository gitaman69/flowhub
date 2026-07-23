export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export interface LoggerOptions {
  level?: LogLevel;
  sink?: (level: LogLevel, message: string, meta?: unknown) => void;
}

export class Logger {
  private level: LogLevel;
  private sink: (level: LogLevel, message: string, meta?: unknown) => void;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? "info";
    this.sink = options.sink ?? defaultSink;
  }

  private log(level: LogLevel, message: string, meta?: unknown): void {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.level]) return;
    this.sink(level, message, meta);
  }

  debug(message: string, meta?: unknown): void {
    this.log("debug", message, meta);
  }

  info(message: string, meta?: unknown): void {
    this.log("info", message, meta);
  }

  warn(message: string, meta?: unknown): void {
    this.log("warn", message, meta);
  }

  error(message: string, meta?: unknown): void {
    this.log("error", message, meta);
  }
}

function defaultSink(level: LogLevel, message: string, meta?: unknown): void {
  const line = `[${level}] ${message}`;
  if (meta !== undefined) console[level === "debug" ? "log" : level](line, meta);
  else console[level === "debug" ? "log" : level](line);
}

export function createLogger(options?: LoggerOptions): Logger {
  return new Logger(options);
}
