// src/features/capture/CaptureScreen.tsx
"use client";

import * as React from "react";
import { AppShell } from "@/components/AppShell";
import { useCapture } from "./useCapture";
import { CaptureForm } from "./components/CaptureForm";
import { TemplatesGrid } from "./components/TemplatesGrid";
import { RecentCapturesList } from "./components/RecentCapturesList";

export default function CaptureScreen() {
  const {
    text,
    context,
    tags,
    tagInput,
    items,
    listLoading,
    error,
    isSaving,
    hasText,
    setText,
    setContext,
    setTagInput,
    addTag,
    removeTag,
    saveCapture,
  } = useCapture();

  function handleTemplateSelect(templateText: string) {
    setText(templateText);
  }

  function handleSave() {
    saveCapture();
  }

  const recent = (items ?? []).slice(0, 5);

  return (
    <AppShell
      title="Capture your insights"
      subtitle="A quiet space to save what matters — ideas, learnings, and reflections."
    >
      <div className="flex flex-1 flex-col gap-6 lg:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          <CaptureForm
            text={text}
            onTextChange={setText}
            context={context}
            onContextChange={setContext}
            tags={tags}
            tagInput={tagInput}
            onTagInputChange={setTagInput}
            onAddTag={addTag}
            onRemoveTag={removeTag}
            onSave={handleSave}
            isSaving={isSaving}
            canSave={hasText}
          />

          <TemplatesGrid onSelectTemplate={handleTemplateSelect} />
        </div>

        <RecentCapturesList
          items={recent}
          loading={listLoading}
          error={error}
        />
      </div>
    </AppShell>
  );
}
