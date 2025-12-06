"use client";

import * as React from "react";

export type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className = "", ...props }, ref) => {
    const base =
      "w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-900 shadow-inner shadow-slate-200 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 resize-none";

    return (
      <textarea
        ref={ref}
        className={[base, className].filter(Boolean).join(" ")}
        {...props}
      />
    );
  }
);

TextArea.displayName = "TextArea";
