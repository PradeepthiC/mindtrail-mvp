// src/lib/oe/tracing/tracing.ts
import { logger } from "@/lib/oe/logging/logger";

export type SpanContext = {
  name: string;
  route?: string;
  traceId?: string;
  [key: string]: unknown;
};

export type SpanEndFields = {
  [key: string]: unknown;
};

type Span = {
  end: (fields?: SpanEndFields) => void;
};

export function getOrCreateTraceId(headerValue: string | null): string {
  if (headerValue && headerValue !== "null" && headerValue !== "undefined") {
    return headerValue;
  }
  // Simple fallback: random ID; you can switch to crypto.randomUUID if desired
  return `trace_${Math.random().toString(36).slice(2, 10)}`;
}

export function startSpan(ctx: SpanContext): Span {
  const { name, route, traceId } = ctx;
  const startedAt = Date.now();

  logger.debug("span_start", {
    event: "span_start",
    name,
    route,
    traceId,
  });

  function end(fields?: SpanEndFields) {
    const duration_ms = Date.now() - startedAt;

    logger.debug("span_end", {
      event: "span_end",
      name,
      route,
      traceId,
      duration_ms,
      ...(fields ?? {}),
    });
  }

  return { end };
}

export function classifyError(err: unknown): string {
  // naive classifier; adjust as needed
  if (err instanceof Error) {
    const message = err.message.toLowerCase();

    if (
      message.includes("validation") ||
      message.includes("required") ||
      message.includes("invalid")
    ) {
      return "validation";
    }

    if (
      message.includes("timeout") ||
      message.includes("network") ||
      message.includes("upstream")
    ) {
      return "upstream";
    }
  }

  return "internal";
}
