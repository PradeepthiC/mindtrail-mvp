// src/lib/oe/openai/client.ts
import OpenAI from "openai";
import { startSpan, classifyError } from "@/lib/oe/tracing/tracing";
import { logger } from "@/lib/oe/logging/logger";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface OpenAIContext {
  traceId: string;
  uid?: string;
  route?: string;
}

export async function callOpenAIForReflection(prompt: string, ctx: OpenAIContext) {
  const span = startSpan({
    name: "openai_call",
    ...ctx,
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are Mindtrail AI assistant. Produce insights and topics.",
        },
        { role: "user", content: prompt },
      ],
    });

    const usage = response.usage;

    span.end({
      model: response.model,
      prompt_tokens: usage?.prompt_tokens,
      completion_tokens: usage?.completion_tokens,
    });

    logger.info("openai_success", {
      event: "openai_success",
      ...ctx,
      model: response.model,
      prompt_tokens: usage?.prompt_tokens,
      completion_tokens: usage?.completion_tokens,
    });

    return {
      content: response.choices[0]?.message?.content ?? "",
      usage,
    };
  } catch (err: unknown) {
    const cat = classifyError(err);

    span.end({ error: true, error_category: cat });

    logger.error("openai_error", {
      event: "openai_error",
      ...ctx,
      error_category: cat,
      error_message: err?.message,
    });

    throw err;
  }
}
