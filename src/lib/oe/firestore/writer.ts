import { addDoc, CollectionReference } from "firebase/firestore";
import { startSpan, classifyError } from "@/lib/oe/tracing/tracing";
import { logger } from "@/lib/oe/logging/logger";

export interface FirestoreContext {
  traceId: string;
  uid: string;
  route?: string;
}

export async function addDocWithTracing<T>(
  colRef: CollectionReference<T>,
  data: T,
  ctx: FirestoreContext
) {
  const span = startSpan({
    name: "firestore_write",
    ...ctx,
  });

  try {
    const docRef = await addDoc(colRef, data);

    span.end({ doc_id: docRef.id });

    logger.info("firestore_write_success", {
      event: "firestore_write_success",
      ...ctx,
      doc_id: docRef.id,
    });

    return docRef;
  } catch (err: unknown) {
    const cat = classifyError(err);

    span.end({ error: true, error_category: cat });

    logger.error("firestore_write_error", {
      event: "firestore_write_error",
      ...ctx,
      error_category: cat,
      error_message: err?.message,
    });

    throw err;
  }
}
