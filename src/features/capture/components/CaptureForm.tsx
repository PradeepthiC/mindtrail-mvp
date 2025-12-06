"use client";

import * as React from "react";
import type { CaptureContext } from "../types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Card } from "@/components/ui/Card";

type CaptureFormProps = {
  text: string;
  onTextChange: (value: string) => void;

  context: CaptureContext;
  onContextChange: (value: CaptureContext) => void;

  tags: string[];
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;

  onSave: () => void;
  isSaving: boolean;
  canSave: boolean;
};

export const CaptureForm: React.FC<CaptureFormProps> = ({
  text,
  onTextChange,
  context,
  onContextChange,
  tags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  onSave,
  isSaving,
  canSave,
}) => {
  return (
    <Card className="p-4 shadow-lg shadow-slate-200/60">
      <div className="mb-2">
        <h2 className="text-sm font-semibold text-slate-900">Quick Capture</h2>
        <p className="text-xs text-slate-500">
          Jot down what you learned or want to remember.
        </p>
      </div>

      {/* Text area */}
      <div className="relative">
        <TextArea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="What did you learn or want to remember today?"
          className="mt-2 h-36"
        />
        <div className="pointer-events-none absolute bottom-2 right-3 text-[11px] text-slate-400">
          {text.trim().length} chars
        </div>
      </div>

      {/* Tags + Context */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Tags */}
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Tags
            </span>
            {tags.length > 0 && (
              <span className="text-[10px] text-slate-400">
                Click a tag to remove
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="group flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              >
                <span>#{tag}</span>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-600">
                  ✕
                </span>
              </button>
            ))}

            <div className="flex items-center gap-2">
              <Input
                value={tagInput}
                onChange={(e) => onTagInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onAddTag();
                  }
                }}
                placeholder="Add tag"
                className="h-8 w-[120px]"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddTag}
                className="h-8 w-8 p-0"
              >
                +
              </Button>
            </div>
          </div>
        </div>

        {/* Context */}
        <div className="w-full max-w-[180px]">
          <div className="mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Context
            </span>
          </div>

          <select
            value={context}
            onChange={(e) =>
              onContextChange(e.target.value as CaptureContext)
            }
            className="h-9 w-full rounded-full border border-slate-200 bg-white/80 px-3 text-xs text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
          >
            <option value="work">Work</option>
            <option value="career">Career</option>
            <option value="personal">Personal</option>
            <option value="family">Family</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Save */}
      <div className="mt-4 flex items-center justify-end">
        <Button
          type="button"
          variant="primary"
          size="md"
          disabled={!canSave || isSaving}
          onClick={onSave}
        >
          {isSaving ? "Saving..." : "Save Capture"}
        </Button>
      </div>
    </Card>
  );
};
