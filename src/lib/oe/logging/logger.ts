export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  traceId?: string;
  uid?: string;
  route?: string;
  event?: string;
  [key: string]: unknown;
}

function emit(level: LogLevel, msg: string, ctx: LogContext = {}) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    service: "mindtrail",
    msg,
    ...ctx,
  };

  const line = JSON.stringify(payload);

  if (level === "error" || level === "warn") console.error(line);
  else console.log(line);
}

export const logger = {
  debug: (msg: string, ctx?: LogContext) => emit("debug", msg, ctx),
  info: (msg: string, ctx?: LogContext) => emit("info", msg, ctx),
  warn: (msg: string, ctx?: LogContext) => emit("warn", msg, ctx),
  error: (msg: string, ctx?: LogContext) => emit("error", msg, ctx),
};
