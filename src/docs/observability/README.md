# Mindtrail Observability & Engineering (OE)

This document describes how observability is wired into the **Mindtrail MVP** and what metrics we track from day 1.

---

## 1. Goals

Observability should help us answer, quickly:

1. **Is the reflection flow healthy right now?**
2. **How slow is it (end-to-end and per component)?**
3. **How often does it fail, and why?**
4. **How many users are actively using Mindtrail, and how often?**

We achieve this with:

- Structured JSON logs
- Trace IDs + spans
- Client + server latency metrics
- Error classification

---

## 2. Folder Structure

All OE-related code lives under `lib/oe`:

```text
lib/
  oe/
    logging/
      logger.ts       # JSON logger
    tracing/
      tracing.ts      # trace IDs, spans, error categorization
    openai/
      client.ts       # OpenAI wrapper with tracing
    firestore/
      writer.ts       # Firestore wrapper with tracing

## 3. Structured Logging (Server)_

Every log is a JSON object and includes:

event

traceId

route

uid

duration_ms

error_category (if any)

Example:

{
  "ts": "2025-12-03T18:30:01.234Z",
  "level": "info",
  "service": "mindtrail",
  "event": "reflect_success",
  "traceId": "uuid",
  "route": "/api/reflect",
  "uid": "user123",
  "doc_id": "abc123",
  "text_length": 230,
  "insight_length": 140,
  "duration_ms": 1864
}

Important:
We never log raw reflection text — only metadata (length, doc ID, tokens, etc.).

🔍 What We Measure
Reliability

Reflection success rate

Failure rate by error category:

USER_INPUT_ERROR

OPENAI_ERROR

FIRESTORE_ERROR

UNEXPECTED_ERROR

Latency

API latency (/api/reflect)

OpenAI model latency

Firestore write latency

Client-side end-to-end latency (via /api/metrics)

Usage

Daily Active Users (DAU)

Reflections per user

Token consumption (prompt + completion)

🧵 Trace IDs

Each reflection request generates a traceId on the client:

Passed via x-trace-id

Used by:

API

OpenAI wrapper

Firestore wrapper

Metrics beacon

This enables complete end-to-end debugging for every user reflection.

⏱️ Spans (Latency Measurement)

Mindtrail uses spans to measure duration of key operations:

reflect_request

openai_call

firestore_write

Each span emits:

<span>_start

<span>_end with:

duration_ms

metadata (tokens, doc_id, categories, etc.)

This gives accurate p50 / p95 latency.

🧩 Client Latency Metrics

The browser sends a non-blocking beacon on reflection completion:

{
  "event": "client_reflect_latency",
  "traceId": "uuid",
  "duration_ms": 3200,
  "status": 200
}


This measures total user-perceived latency across UI → API → LLM → Firestore.

📊 Recommended Dashboards

Reflection success rate

Errors by category

/api/reflect p95 latency

OpenAI p95 latency

Client-side p95 latency

DAU & reflections per user

Token usage

🚨 Suggested Alerts

API latency p95 > 10s

OpenAI error rate > 5%

Reflection success rate < 90%

Client latency p95 > 12s

🛠️ Adding OE to New Endpoints
// Get or create traceId
const traceId = getOrCreateTraceId(req.headers.get("x-trace-id"));

// Start a span
const span = startSpan({ 
  name: "my_api", 
  traceId, 
  route: "/api/my-api" 
});

// Log structured data
logger.info("my_api_step", { traceId, key: "value" });

// End span on success
span.end({ success: true });

// End span on failure
span.end({ error: true, error_category });
logger.error("my_api_failure", { traceId, error_category });

✅ Summary

Mindtrail’s Observability foundation provides:

Clear system health visibility

End-to-end latency tracing

Actionable error categorization

Usage and performance insights

A scalable framework for future agentic features