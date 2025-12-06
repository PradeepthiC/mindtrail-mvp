// src/app/api/reflect/route.ts
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/oe/logging/logger";
import {
  getOrCreateTraceId,
  startSpan,
  classifyError,
} from "@/lib/oe/tracing/tracing";
import { callOpenAIForReflection } from "@/lib/oe/openai/client";
import { adminDb } from "@/lib/firebaseAdmin";

type Reflection = {
  text_raw: string;
  insight: string;
  topics: string[];
  created_at: number;
};

export async function POST(req: NextRequest) {
  const route = "/api/reflect";
  const traceId = getOrCreateTraceId(req.headers.get("x-trace-id"));
  const span = startSpan({ name: "reflect_request", route, traceId });
  const startedAt = Date.now();

  try {
    const body = await req.json().catch(() => null);
    const text_raw = (body?.text ?? "").trim();

    if (!text_raw) {
      const err = new Error("Reflection text required");
      const cat = classifyError(err);

      span.end({ error: true, error_category: cat });

      logger.warn("reflect_validation_error", {
        route,
        traceId,
        error_category: cat,
        error_message: err.message,
      });

      return NextResponse.json(
        { error: "Reflection text is required" },
        { status: 400 }
      );
    }

    const raw = req.headers.get("x-user-id");
    const uid =
      raw && raw !== "null" && raw !== "undefined"
        ? raw
        : "anon"; // fallback for dev

    // 1) Call OpenAI
    const { content } = await callOpenAIForReflection(text_raw, {
      traceId,
      uid,
      route,
    });

    const data: Reflection = {
      text_raw,
      insight: content,
      topics: [],
      created_at: Date.now(),
    };

    // 2) Firestore write via firebase-admin (bypasses security rules)
    const userDocRef = adminDb.collection("users").doc(uid);
    const reflectionsCol = userDocRef.collection("reflections");
    const docRef = await reflectionsCol.add(data);

    span.end({
      success: true,
      uid,
      doc_id: docRef.id,
      text_length: text_raw.length,
      insight_length: content.length,
    });

    logger.info("reflect_success", {
      route,
      traceId,
      uid,
      doc_id: docRef.id,
      text_length: text_raw.length,
      insight_length: content.length,
      duration_ms: Date.now() - startedAt,
    });

    return NextResponse.json(
      {
        id: docRef.id,
        insight: content,
        topics: [],
        traceId,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const isError = err instanceof Error;
    const message = isError ? err.message : "Unknown error";
    const name = isError ? err.name : "Error";
    const stack = isError ? err.stack : undefined;

    const cat = classifyError(
      isError ? err : new Error("Unknown error in /api/reflect")
    );

    span.end({ error: true, error_category: cat });

    logger.error("reflect_request_error", {
      route,
      traceId,
      status: 500,
      error_category: cat,
      errorName: name,
      errorMessage: message,
      stack,
    });

    return new Response(
      JSON.stringify({
        error: "Reflect failed",
        details: message,
        traceId,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    logger.info("reflect_request_completed", {
      route,
      traceId,
      duration_ms: Date.now() - startedAt,
    });
  }
}
