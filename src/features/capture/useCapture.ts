// src/features/capture/useCapture.ts
"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { logger } from "@/lib/oe/logging/logger";
import { authFetch } from "@/lib/authFetch";
import type { CaptureContext, CaptureItem } from "./types";

type CaptureDoc = {
  text_raw?: string;
  tags?: unknown;
  context?: CaptureContext;
  created_at?: number | Timestamp | { toMillis: () => number };
};

export function useCapture() {
  // input state
  const [text, setText] = useState("");
  const [context, setContext] = useState<CaptureContext>("work");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // list state
  const [items, setItems] = useState<CaptureItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // saving
  const [isSaving, setIsSaving] = useState(false);

  const hasText = text.trim().length > 0;

  // Firestore subscription to "reflections" (captures)
  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      logger.warn("useCapture_no_auth_user", {
        event: "capture_subscribe",
      });
      setItems([]);
      setListLoading(false);
      return;
    }

    const uid = user.uid;

    logger.info("useCapture_subscribe_start", {
      event: "capture_subscribe",
      uid,
    });

    try {
      const colRef = collection(db, "users", uid, "reflections");
      const q = query(colRef, orderBy("created_at", "desc"));

      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          logger.debug("useCapture_snapshot_received", {
            event: "capture_snapshot",
            uid,
            count: snap.size,
          });

          const mapped: CaptureItem[] = snap.docs.map((doc) => {
            const data = doc.data() as CaptureDoc;
            const raw = data.created_at;

            let created_at: number;
            if (typeof raw === "number") {
              created_at = raw;
            } else if (raw instanceof Timestamp) {
              created_at = raw.toMillis();
            } else if (raw && typeof (raw as { toMillis?: () => number }).toMillis === "function") {
              created_at = (raw as { toMillis: () => number }).toMillis();
            } else {
              created_at = Date.now();
            }

            const tagsValue = Array.isArray(data.tags)
              ? (data.tags as string[])
              : [];

            return {
              id: doc.id,
              text_raw: data.text_raw ?? "",
              tags: tagsValue,
              context: data.context ?? "work",
              created_at,
            };
          });

          setItems(mapped);
          setListLoading(false);
        },
        (err) => {
          const message =
            err instanceof Error ? err.message : "Unknown snapshot error";

          logger.error("useCapture_snapshot_error", {
            event: "capture_snapshot_error",
            uid,
            error: message,
          });
          setError(message);
          setListLoading(false);
        }
      );

      return () => {
        logger.info("useCapture_unsubscribe", {
          event: "capture_unsubscribe",
          uid,
        });
        unsubscribe();
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unknown subscribe error";

      logger.error("useCapture_subscribe_exception", {
        event: "capture_subscribe_error",
        error: message,
      });
      setError(message);
      setListLoading(false);
      return;
    }
  }, []);

  // tag helpers
  function addTag() {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  // save capture via /api/reflect
  async function saveCapture() {
    const trimmed = text.trim();
    if (!trimmed || isSaving) return;

    const uid = auth.currentUser?.uid;

    logger.info("save_capture_attempt", {
      event: "save_capture",
      uid,
      textLength: trimmed.length,
      tagsCount: tags.length,
      context,
    });

    setIsSaving(true);
    setError(null);

    try {
      await authFetch("/api/reflect", {
        method: "POST",
        body: JSON.stringify({
          text_raw: trimmed,
          context,
          tags,
        }),
      });

      logger.info("save_capture_success", {
        event: "save_capture",
        uid,
      });

      setText("");
      setTags([]);
      setContext("work");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unknown save error";

      logger.error("save_capture_failure", {
        event: "save_capture_error",
        uid,
        error: message,
      });
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return {
    // state
    text,
    context,
    tags,
    tagInput,
    items,
    listLoading,
    error,
    isSaving,
    hasText,

    // setters
    setText,
    setContext,
    setTagInput,

    // tag helpers
    addTag,
    removeTag,

    // save
    saveCapture,
  };
}
