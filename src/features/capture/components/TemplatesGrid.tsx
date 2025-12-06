"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";

export type TemplateKey =
  | "daily"
  | "learning"
  | "oneOnOne"
  | "gratitude"
  | "ideas";

const TEMPLATE_CONFIG: Record<
  TemplateKey,
  { label: string; description: string; text: string }
> = {
  daily: {
    label: "Daily Reflection",
    description: "End-of-day check-in",
    text: [
      "What did I learn today?",
      "What felt hard or confusing?",
      "What do I want to revisit tomorrow?",
    ].join("\n\n"),
  },
  learning: {
    label: "Learning Log",
    description: "New concepts & skills",
    text: [
      "New concept I learned:",
      "",
      "Why it matters:",
      "",
      "Where I can apply this:",
      "",
      "Next step / experiment:",
    ].join("\n"),
  },
  oneOnOne: {
    label: "1:1 Notes",
    description: "Discussion & follow-ups",
    text: [
      "Discussion points:",
      "- ",
      "",
      "Decisions made:",
      "- ",
      "",
      "Action items & owners:",
      "- ",
      "",
      "Follow-ups for next 1:1:",
      "- ",
    ].join("\n"),
  },
  gratitude: {
    label: "Gratitude",
    description: "Small things that mattered",
    text: [
      "Three things I'm grateful for today:",
      "1.",
      "2.",
      "3.",
      "",
      "Why these mattered:",
    ].join("\n"),
  },
  ideas: {
    label: "Ideas",
    description: "Random sparks, raw notes",
    text: [
      "Idea:",
      "",
      "What problem does this solve?",
      "",
      "Who is this for?",
      "",
      "First tiny experiment I can run:",
    ].join("\n"),
  },
};

type TemplatesGridProps = {
  onSelectTemplate: (text: string) => void;
};

export const TemplatesGrid: React.FC<TemplatesGridProps> = ({
  onSelectTemplate,
}) => {
  const keys = Object.keys(TEMPLATE_CONFIG) as TemplateKey[];

  return (
    <section className="mt-6 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Templates</h2>
        <p className="text-[11px] text-slate-400">
          Tap to pre-fill the capture box
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {keys.map((key) => {
          const tpl = TEMPLATE_CONFIG[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectTemplate(tpl.text)}
              className="group text-left"
            >
              <Card className="flex h-full flex-col items-start border-slate-100 bg-white/80 p-3 text-left shadow-sm shadow-slate-200/60 transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="mb-1 inline-flex rounded-full bg-slate-900/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-50">
                  {tpl.label}
                </span>
                <span className="text-xs text-slate-700">
                  {tpl.description}
                </span>
                <span className="mt-2 line-clamp-2 text-[11px] text-slate-400">
                  {tpl.text}
                </span>
              </Card>
            </button>
          );
        })}
      </div>
    </section>
  );
};
