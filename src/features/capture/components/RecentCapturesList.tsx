"use client";

import * as React from "react";
import type { CaptureItem } from "../types";
import { Card } from "@/components/ui/Card";
import { capitalize, formatTimeAgo } from "../utils";

type RecentCapturesListProps = {
  items: CaptureItem[];
  loading?: boolean;
  error?: string | null;
};

export const RecentCapturesList: React.FC<RecentCapturesListProps> = ({
  items,
  loading,
  error,
}) => {
  return (
    <aside className="mt-6 w-full max-w-sm space-y-3 lg:mt-0 lg:w-80">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">
          Recent captures
        </h2>
        <span className="text-[11px] text-slate-400">
          Last {Math.min(5, items.length || 0)} notes
        </span>
      </div>

      <Card className="p-4">
        {loading ? (
          <div className="flex min-h-[180px] items-center justify-center text-xs text-slate-400">
            Loading…
          </div>
        ) : error ? (
          <div className="flex min-h-[180px] items-center justify-center text-center text-xs text-red-500">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center text-center text-xs text-slate-400">
            <p>No captures yet.</p>
            <p>Start by saving your first capture today.</p>
          </div>
        ) : (
          <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <RecentCaptureCard
                key={item.id ?? item.created_at}
                item={item}
              />
            ))}
          </div>
        )}
      </Card>
    </aside>
  );
};

function RecentCaptureCard({ item }: { item: CaptureItem }) {
  const preview =
    item.text_raw.length > 160
      ? item.text_raw.slice(0, 160).trimEnd() + "…"
      : item.text_raw;

  return (
    <button
      type="button"
      className="w-full rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-left text-xs text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm"
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <p className="line-clamp-3">{preview}</p>
        <span className="shrink-0 text-[10px] text-slate-400">
          {formatTimeAgo(item.created_at)}
        </span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1">
        <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] text-slate-600">
          {capitalize(item.context)}
        </span>
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-900/5 px-2 py-0.5 text-[10px] text-slate-600"
          >
            #{tag}
          </span>
        ))}
      </div>
    </button>
  );
}
